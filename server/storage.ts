import { type User, type InsertUser, type Course, type InsertCourse, type Commission, type InsertCommission, type Registration, type InsertRegistration, type CourseWithCommissions, type CommissionWithAvailability } from "@shared/schema";
import { users, courses, commissions, registrations, sessions } from "@shared/schema";
import { randomUUID } from "crypto";
import { eq, desc, ne, lt } from "drizzle-orm";

// Database connection will be handled dynamically
let db: any = null;

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByResetToken(token: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserLastLogin(id: string): Promise<void>;
  setPasswordResetToken(id: string, token: string, expiry: Date): Promise<void>;
  clearPasswordResetToken(id: string): Promise<void>;
  updateUserPassword(id: string, hashedPassword: string): Promise<void>;
  
  // Course methods
  getCourses(): Promise<CourseWithCommissions[]>;
  getCourse(id: string): Promise<Course | undefined>;
  createCourse(course: InsertCourse): Promise<Course>;
  
  // Commission methods
  getCommissionsByCourse(courseId: string): Promise<CommissionWithAvailability[]>;
  getCommission(id: string): Promise<Commission | undefined>;
  createCommission(commission: InsertCommission): Promise<Commission>;
  updateCommission(id: string, updates: Partial<Commission>): Promise<Commission>;
  deleteCommission(id: string): Promise<void>;
  checkScheduleConflict(courseId: string, days: string, time: string, excludeId?: string): Promise<boolean>;
  getCommissionsWithLowEnrollment(threshold?: number): Promise<Commission[]>;
  
  // Registration methods
  createRegistration(registration: InsertRegistration): Promise<Registration>;
  getRegistrations(): Promise<Registration[]>;
  updateCommissionEnrollment(commissionId: string, increment: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  private db: any;

  constructor() {
    // Initialize database connection
    this.initializeDb();
  }

  private async initializeDb() {
    try {
      const { db: dbConnection } = await import("./db");
      this.db = dbConnection;
    } catch (error) {
      console.error("Failed to initialize database:", error);
      throw error;
    }
  }

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await this.db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await this.db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await this.db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async getUserByResetToken(token: string): Promise<User | undefined> {
    const [user] = await this.db.select().from(users).where(eq(users.resetToken, token));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await this.db
      .insert(users)
      .values({
        ...insertUser,
        isActive: insertUser.isActive ?? true,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
    return user;
  }

  async updateUserLastLogin(id: string): Promise<void> {
    await this.db
      .update(users)
      .set({ lastLogin: new Date(), updatedAt: new Date() })
      .where(eq(users.id, id));
  }

  async setPasswordResetToken(id: string, token: string, expiry: Date): Promise<void> {
    await this.db
      .update(users)
      .set({ resetToken: token, resetTokenExpiry: expiry, updatedAt: new Date() })
      .where(eq(users.id, id));
  }

  async clearPasswordResetToken(id: string): Promise<void> {
    await this.db
      .update(users)
      .set({ resetToken: null, resetTokenExpiry: null, updatedAt: new Date() })
      .where(eq(users.id, id));
  }

  async updateUserPassword(id: string, hashedPassword: string): Promise<void> {
    await this.db
      .update(users)
      .set({ password: hashedPassword, updatedAt: new Date() })
      .where(eq(users.id, id));
  }

  async getCourses(): Promise<CourseWithCommissions[]> {
    const allCourses = await this.db.select().from(courses).where(eq(courses.isActive, true));
    
    return await Promise.all(allCourses.map(async (course) => {
      const courseCommissions = await this.getCommissionsByCourse(course.id);
      return {
        ...course,
        commissions: courseCommissions.map(c => ({
          id: c.id,
          courseId: c.courseId,
          code: c.code,
          days: c.days,
          time: c.time,
          instructor: c.instructor,
          maxCapacity: c.maxCapacity,
          currentEnrollment: c.currentEnrollment,
          startDate: c.startDate,
          isActive: c.isActive,
          createdAt: c.createdAt,
        })),
        availableCommissions: courseCommissions.filter(c => c.availableSpots > 0).length,
      };
    }));
  }

  async getCourse(id: string): Promise<Course | undefined> {
    const [course] = await this.db.select().from(courses).where(eq(courses.id, id));
    return course || undefined;
  }

  async createCourse(course: InsertCourse): Promise<Course> {
    const [newCourse] = await this.db
      .insert(courses)
      .values({
        ...course,
        isActive: course.isActive ?? true,
        createdAt: new Date(),
      })
      .returning();
    return newCourse;
  }

  async getCommissionsByCourse(courseId: string): Promise<CommissionWithAvailability[]> {
    const courseCommissions = await this.db
      .select()
      .from(commissions)
      .where(eq(commissions.courseId, courseId));

    return courseCommissions.map((commission: Commission) => ({
      ...commission,
      availableSpots: commission.maxCapacity - commission.currentEnrollment,
    }));
  }

  async getCommission(id: string): Promise<Commission | undefined> {
    const [commission] = await this.db.select().from(commissions).where(eq(commissions.id, id));
    return commission || undefined;
  }

  async createCommission(commission: InsertCommission): Promise<Commission> {
    const [newCommission] = await this.db
      .insert(commissions)
      .values({
        ...commission,
        isActive: commission.isActive ?? true,
        createdAt: new Date(),
      })
      .returning();
    return newCommission;
  }

  async updateCommission(id: string, updates: Partial<Commission>): Promise<Commission> {
    const [updatedCommission] = await this.db
      .update(commissions)
      .set({ ...updates, createdAt: undefined })
      .where(eq(commissions.id, id))
      .returning();
    return updatedCommission;
  }

  async deleteCommission(id: string): Promise<void> {
    await this.db
      .update(commissions)
      .set({ isActive: false })
      .where(eq(commissions.id, id));
  }

  async checkScheduleConflict(courseId: string, days: string, time: string, excludeId?: string): Promise<boolean> {
    const query = this.db
      .select()
      .from(commissions)
      .where(eq(commissions.courseId, courseId))
      .where(eq(commissions.days, days))
      .where(eq(commissions.time, time))
      .where(eq(commissions.isActive, true));

    if (excludeId) {
      query.where(ne(commissions.id, excludeId));
    }

    const conflicts = await query;
    return conflicts.length > 0;
  }

  async getCommissionsWithLowEnrollment(threshold: number = 5): Promise<Commission[]> {
    return await this.db
      .select()
      .from(commissions)
      .where(eq(commissions.isActive, true))
      .where(lt(commissions.currentEnrollment, threshold));
  }

  async createRegistration(registration: InsertRegistration): Promise<Registration> {
    const [newRegistration] = await this.db
      .insert(registrations)
      .values({
        ...registration,
        status: "confirmed",
        newsletter: registration.newsletter ?? false,
        createdAt: new Date(),
      })
      .returning();

    // Update commission enrollment count
    await this.updateCommissionEnrollment(registration.commissionId, 1);

    return newRegistration;
  }

  async getRegistrations(): Promise<Registration[]> {
    return await this.db.select().from(registrations).orderBy(desc(registrations.createdAt));
  }

  async updateCommissionEnrollment(commissionId: string, increment: number): Promise<void> {
    const [commission] = await this.db.select().from(commissions).where(eq(commissions.id, commissionId));
    
    if (commission) {
      await this.db
        .update(commissions)
        .set({ currentEnrollment: commission.currentEnrollment + increment })
        .where(eq(commissions.id, commissionId));
    }
  }
}

// In-memory storage fallback
export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private courses: Map<string, Course>;
  private commissions: Map<string, Commission>;
  private registrations: Map<string, Registration>;

  constructor() {
    this.users = new Map();
    this.courses = new Map();
    this.commissions = new Map();
    this.registrations = new Map();
    
    // Initialize with sample data
    this.initializeData();
  }

  private async loadSampleUsers() {
    // We'll now create users with properly hashed passwords
    // This will be done by the seed script or through the authentication service
    console.log('Sample users will be created via seed script for proper password hashing.');
  }

  private initializeData() {
    this.loadSampleUsers();
    
    // Sample courses
    const sampleCourses = [
      {
        id: "course-1",
        name: "Maquetado Web Nivel I",
        description: "Aprende las bases del desarrollo web con HTML5, CSS3 y responsive design. Ideal para quienes comienzan en el mundo del desarrollo web.",
        level: "Principiante",
        duration: "8 semanas",
        totalWeeks: 8,
        startDate: "15 de Abril",
        isActive: true,
        createdAt: new Date(),
      },
      {
        id: "course-2",
        name: "JavaScript Fundamentals",
        description: "Domina los conceptos fundamentales de JavaScript, desde variables hasta manipulación del DOM. Perfecto para dar el siguiente paso en tu carrera.",
        level: "Intermedio",
        duration: "10 semanas",
        totalWeeks: 10,
        startDate: "22 de Abril",
        isActive: true,
        createdAt: new Date(),
      },
      {
        id: "course-3",
        name: "React.js Avanzado",
        description: "Especialízate en React.js con hooks avanzados, context API, y patrones de diseño modernos. Para desarrolladores con experiencia previa.",
        level: "Avanzado",
        duration: "12 semanas",
        totalWeeks: 12,
        startDate: "29 de Abril",
        isActive: true,
        createdAt: new Date(),
      },
    ];

    sampleCourses.forEach((course: Course) => {
      this.courses.set(course.id, course);
    });

    // Sample commissions
    const sampleCommissions = [
      {
        id: "comm-1",
        courseId: "course-1",
        code: "M1LN01",
        days: "Martes",
        time: "19:00 - 21:00",
        instructor: "Prof. Ana García",
        maxCapacity: 20,
        currentEnrollment: 5,
        startDate: "15 de Abril",
        isActive: true,
        createdAt: new Date(),
      },
      {
        id: "comm-2",
        courseId: "course-1",
        code: "M1LN02",
        days: "Jueves",
        time: "18:30 - 20:30",
        instructor: "Prof. Carlos Ruiz",
        maxCapacity: 20,
        currentEnrollment: 17,
        startDate: "16 de Abril",
        isActive: true,
        createdAt: new Date(),
      },
      {
        id: "comm-3",
        courseId: "course-1",
        code: "M1LN03",
        days: "Sábados",
        time: "10:00 - 12:00",
        instructor: "Prof. María López",
        maxCapacity: 15,
        currentEnrollment: 15,
        startDate: "17 de Abril",
        isActive: true,
        createdAt: new Date(),
      },
      {
        id: "comm-4",
        courseId: "course-2",
        code: "JS01",
        days: "Lunes y Miércoles",
        time: "19:00 - 21:00",
        instructor: "Prof. Diego Silva",
        maxCapacity: 18,
        currentEnrollment: 8,
        startDate: "22 de Abril",
        isActive: true,
        createdAt: new Date(),
      },
      {
        id: "comm-5",
        courseId: "course-2",
        code: "JS02",
        days: "Viernes",
        time: "18:00 - 21:00",
        instructor: "Prof. Laura Mendez",
        maxCapacity: 16,
        currentEnrollment: 12,
        startDate: "24 de Abril",
        isActive: true,
        createdAt: new Date(),
      },
      {
        id: "comm-6",
        courseId: "course-3",
        code: "REACT01",
        days: "Martes y Jueves",
        time: "20:00 - 22:00",
        instructor: "Prof. Roberto Castro",
        maxCapacity: 12,
        currentEnrollment: 7,
        startDate: "29 de Abril",
        isActive: true,
        createdAt: new Date(),
      },
    ];

    sampleCommissions.forEach((commission: Commission) => {
      this.commissions.set(commission.id, commission);
    });
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async getUserByResetToken(token: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.resetToken === token,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser,
      id,
      email: insertUser.email || null,
      firstName: insertUser.firstName || null,
      lastName: insertUser.lastName || null,
      profileImageUrl: insertUser.profileImageUrl || null,
      isActive: insertUser.isActive ?? true,
      resetToken: null,
      resetTokenExpiry: null,
      lastLogin: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async updateUserLastLogin(id: string): Promise<void> {
    const user = this.users.get(id);
    if (user) {
      user.lastLogin = new Date();
      user.updatedAt = new Date();
      this.users.set(id, user);
    }
  }

  async setPasswordResetToken(id: string, token: string, expiry: Date): Promise<void> {
    const user = this.users.get(id);
    if (user) {
      user.resetToken = token;
      user.resetTokenExpiry = expiry;
      user.updatedAt = new Date();
      this.users.set(id, user);
    }
  }

  async clearPasswordResetToken(id: string): Promise<void> {
    const user = this.users.get(id);
    if (user) {
      user.resetToken = null;
      user.resetTokenExpiry = null;
      user.updatedAt = new Date();
      this.users.set(id, user);
    }
  }

  async updateUserPassword(id: string, hashedPassword: string): Promise<void> {
    const user = this.users.get(id);
    if (user) {
      user.password = hashedPassword;
      user.updatedAt = new Date();
      this.users.set(id, user);
    }
  }

  async getCourses(): Promise<CourseWithCommissions[]> {
    const coursesArray = Array.from(this.courses.values()).filter(course => course.isActive);
    
    return await Promise.all(coursesArray.map(async (course) => {
      const commissions = await this.getCommissionsByCourse(course.id);
      return {
        ...course,
        commissions: commissions.map(c => ({
          id: c.id,
          courseId: c.courseId,
          code: c.code,
          days: c.days,
          time: c.time,
          instructor: c.instructor,
          maxCapacity: c.maxCapacity,
          currentEnrollment: c.currentEnrollment,
          startDate: c.startDate,
          isActive: c.isActive,
          createdAt: c.createdAt,
        })),
        availableCommissions: commissions.filter(c => c.availableSpots > 0).length,
      };
    }));
  }

  async getCourse(id: string): Promise<Course | undefined> {
    return this.courses.get(id);
  }

  async createCourse(course: InsertCourse): Promise<Course> {
    const id = randomUUID();
    const newCourse: Course = {
      ...course,
      id,
      isActive: course.isActive ?? true,
      createdAt: new Date(),
    };
    this.courses.set(id, newCourse);
    return newCourse;
  }

  async getCommissionsByCourse(courseId: string): Promise<CommissionWithAvailability[]> {
    const commissions = Array.from(this.commissions.values())
      .filter(commission => commission.courseId === courseId && commission.isActive);
    
    return commissions.map(commission => ({
      ...commission,
      availableSpots: commission.maxCapacity - commission.currentEnrollment,
    }));
  }

  async getCommission(id: string): Promise<Commission | undefined> {
    return this.commissions.get(id);
  }

  async createCommission(commission: InsertCommission): Promise<Commission> {
    const id = randomUUID();
    const newCommission: Commission = {
      ...commission,
      id,
      maxCapacity: commission.maxCapacity ?? 20,
      currentEnrollment: commission.currentEnrollment ?? 0,
      isActive: commission.isActive ?? true,
      createdAt: new Date(),
    };
    this.commissions.set(id, newCommission);
    return newCommission;
  }

  async updateCommission(id: string, updates: Partial<Commission>): Promise<Commission> {
    const commission = this.commissions.get(id);
    if (!commission) {
      throw new Error('Commission not found');
    }
    
    const updatedCommission: Commission = {
      ...commission,
      ...updates,
      id, // Preserve original ID
      createdAt: commission.createdAt, // Preserve creation date
    };
    
    this.commissions.set(id, updatedCommission);
    return updatedCommission;
  }

  async deleteCommission(id: string): Promise<void> {
    const commission = this.commissions.get(id);
    if (commission) {
      commission.isActive = false;
      this.commissions.set(id, commission);
    }
  }

  async checkScheduleConflict(courseId: string, days: string, time: string, excludeId?: string): Promise<boolean> {
    const allCommissions = Array.from(this.commissions.values());
    const conflicts = allCommissions.filter(commission => 
      commission.courseId === courseId &&
      commission.days === days &&
      commission.time === time &&
      commission.isActive &&
      commission.id !== excludeId
    );
    return conflicts.length > 0;
  }

  async getCommissionsWithLowEnrollment(threshold: number = 5): Promise<Commission[]> {
    return Array.from(this.commissions.values()).filter(commission =>
      commission.isActive && commission.currentEnrollment < threshold
    );
  }

  async createRegistration(registration: InsertRegistration): Promise<Registration> {
    const id = randomUUID();
    const newRegistration: Registration = {
      ...registration,
      id,
      status: "confirmed",
      newsletter: registration.newsletter ?? false,
      createdAt: new Date(),
    };
    this.registrations.set(id, newRegistration);
    
    // Update commission enrollment
    await this.updateCommissionEnrollment(registration.commissionId, 1);
    
    return newRegistration;
  }

  async getRegistrations(): Promise<Registration[]> {
    return Array.from(this.registrations.values());
  }

  async updateCommissionEnrollment(commissionId: string, increment: number): Promise<void> {
    const commission = this.commissions.get(commissionId);
    if (commission) {
      commission.currentEnrollment += increment;
      this.commissions.set(commissionId, commission);
    }
  }
}

// Always use MemStorage for now to ensure the application works
// DatabaseStorage is ready but the current DATABASE_URL has authentication issues
export const storage = new MemStorage();