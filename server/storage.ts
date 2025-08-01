import {
  users,
  courses,
  commissions,
  registrations,
  type User,
  type UpsertUser,
  type Course,
  type InsertCourse,
  type Commission,
  type InsertCommission,
  type UpdateCommission,
  type Registration,
  type InsertRegistration,
  type CourseWithCommissions,
  type CommissionWithAvailability
} from "@shared/schema";
import { db } from "./db";
import { eq, ne, lt, sql } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
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
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Course methods
  async getCourses(): Promise<CourseWithCommissions[]> {
    const allCourses = await db.select().from(courses);
    const allCommissions = await db.select().from(commissions);
    
    return allCourses.map((course: Course) => {
      const courseCommissions = allCommissions.filter((c: Commission) => c.courseId === course.id);
      return {
        ...course,
        commissions: courseCommissions,
        availableCommissions: courseCommissions.filter((c: Commission) => c.isActive).length,
      };
    });
  }

  async getCourse(id: string): Promise<Course | undefined> {
    const [course] = await db.select().from(courses).where(eq(courses.id, id));
    return course;
  }

  async createCourse(course: InsertCourse): Promise<Course> {
    const [newCourse] = await db.insert(courses).values(course).returning();
    return newCourse;
  }

  // Commission methods
  async getCommissionsByCourse(courseId: string): Promise<CommissionWithAvailability[]> {
    const courseCommissions = await db.select().from(commissions).where(eq(commissions.courseId, courseId));
    return courseCommissions.map((commission: Commission) => ({
      ...commission,
      availableSpots: commission.maxCapacity - commission.currentEnrollment,
    }));
  }

  async getCommission(id: string): Promise<Commission | undefined> {
    const [commission] = await db.select().from(commissions).where(eq(commissions.id, id));
    return commission;
  }

  async createCommission(commission: InsertCommission): Promise<Commission> {
    const [newCommission] = await db.insert(commissions).values(commission).returning();
    return newCommission;
  }

  async updateCommission(id: string, updates: Partial<Commission>): Promise<Commission> {
    const [updatedCommission] = await db
      .update(commissions)
      .set(updates)
      .where(eq(commissions.id, id))
      .returning();
    return updatedCommission;
  }

  async deleteCommission(id: string): Promise<void> {
    await db.delete(commissions).where(eq(commissions.id, id));
  }

  async checkScheduleConflict(courseId: string, days: string, time: string, excludeId?: string): Promise<boolean> {
    let query = db.select().from(commissions)
      .where(eq(commissions.courseId, courseId))
      .where(eq(commissions.days, days))
      .where(eq(commissions.time, time));
    
    if (excludeId) {
      query = query.where(ne(commissions.id, excludeId));
    }
    
    const conflicts = await query;
    return conflicts.length > 0;
  }

  async getCommissionsWithLowEnrollment(threshold: number = 5): Promise<Commission[]> {
    return await db.select().from(commissions).where(lt(commissions.currentEnrollment, threshold));
  }

  // Registration methods
  async createRegistration(registration: InsertRegistration): Promise<Registration> {
    const [newRegistration] = await db.insert(registrations).values(registration).returning();
    return newRegistration;
  }

  async getRegistrations(): Promise<Registration[]> {
    return await db.select().from(registrations);
  }

  async updateCommissionEnrollment(commissionId: string, increment: number): Promise<void> {
    await db
      .update(commissions)
      .set({ 
        currentEnrollment: sql`${commissions.currentEnrollment} + ${increment}`
      })
      .where(eq(commissions.id, commissionId));
  }
}

// In-memory storage fallback
export class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private courses: Map<string, Course> = new Map();
  private commissions: Map<string, Commission> = new Map();
  private registrations: Map<string, Registration> = new Map();

  constructor() {
    this.seedData();
  }

  private seedData() {
    // Seed a development user
    const devUser: User = {
      id: 'dev-user-1',
      email: 'dev@example.com',
      firstName: 'Dev',
      lastName: 'User',
      profileImageUrl: null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.users.set(devUser.id, devUser);

    // Seed courses
    const course1: Course = {
      id: "course-1",
      name: "Desarrollo Web Frontend",
      description: "Introducción completa al desarrollo web frontend con HTML, CSS y JavaScript, enfocado en diseño responsive y moderno.",
      level: "Principiante",
      duration: "8 semanas",
      totalWeeks: 8,
      startDate: "15 de marzo",
      isActive: true,
      createdAt: new Date(),
    };

    this.courses.set(course1.id, course1);

    // Seed commissions
    const commission1: Commission = {
      id: "comm-1",
      courseId: course1.id,
      code: "FE101",
      days: "Martes y Jueves",
      time: "19:00 - 21:00",
      instructor: "Alex Martínez",
      maxCapacity: 20,
      currentEnrollment: 3,
      startDate: "15 de marzo",
      isActive: true,
      cancelReason: null,
      createdAt: new Date(),
    };

    this.commissions.set(commission1.id, commission1);
  }

  // User operations
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const existingUser = this.users.get(userData.id!);
    const user: User = existingUser ? 
      { ...existingUser, ...userData, updatedAt: new Date() } :
      { 
        id: userData.id!,
        email: userData.email || null,
        firstName: userData.firstName || null,
        lastName: userData.lastName || null,
        profileImageUrl: userData.profileImageUrl || null,
        createdAt: new Date(),
        updatedAt: new Date()
      };
    
    this.users.set(user.id, user);
    return user;
  }

  // Course methods
  async getCourses(): Promise<CourseWithCommissions[]> {
    const courseList = Array.from(this.courses.values());
    return courseList.map(course => {
      const courseCommissions = Array.from(this.commissions.values()).filter(c => c.courseId === course.id);
      return {
        ...course,
        commissions: courseCommissions,
        availableCommissions: courseCommissions.filter(c => c.isActive).length,
      };
    });
  }

  async getCourse(id: string): Promise<Course | undefined> {
    return this.courses.get(id);
  }

  async createCourse(course: InsertCourse): Promise<Course> {
    const newCourse: Course = {
      id: `course-${Date.now()}`,
      ...course,
      isActive: course.isActive ?? true,
      createdAt: new Date(),
    };
    this.courses.set(newCourse.id, newCourse);
    return newCourse;
  }

  // Commission methods
  async getCommissionsByCourse(courseId: string): Promise<CommissionWithAvailability[]> {
    const courseCommissions = Array.from(this.commissions.values()).filter(c => c.courseId === courseId);
    return courseCommissions.map(commission => ({
      ...commission,
      availableSpots: commission.maxCapacity - commission.currentEnrollment,
    }));
  }

  async getCommission(id: string): Promise<Commission | undefined> {
    return this.commissions.get(id);
  }

  async createCommission(commission: InsertCommission): Promise<Commission> {
    const newCommission: Commission = {
      id: `comm-${Date.now()}`,
      ...commission,
      currentEnrollment: 0,
      isActive: true,
      cancelReason: null,
      createdAt: new Date(),
    };
    this.commissions.set(newCommission.id, newCommission);
    return newCommission;
  }

  async updateCommission(id: string, updates: Partial<Commission>): Promise<Commission> {
    const existing = this.commissions.get(id);
    if (!existing) throw new Error("Commission not found");
    
    const updated = { ...existing, ...updates };
    this.commissions.set(id, updated);
    return updated;
  }

  async deleteCommission(id: string): Promise<void> {
    this.commissions.delete(id);
  }

  async checkScheduleConflict(courseId: string, days: string, time: string, excludeId?: string): Promise<boolean> {
    return Array.from(this.commissions.values()).some(c => 
      c.courseId === courseId && 
      c.days === days && 
      c.time === time && 
      c.id !== excludeId
    );
  }

  async getCommissionsWithLowEnrollment(threshold: number = 5): Promise<Commission[]> {
    return Array.from(this.commissions.values()).filter(c => c.currentEnrollment < threshold);
  }

  // Registration methods
  async createRegistration(registration: InsertRegistration): Promise<Registration> {
    const newRegistration: Registration = {
      id: `reg-${Date.now()}`,
      ...registration,
      communityAffiliation: "no", // Default value for backward compatibility
      newsletter: registration.newsletter ?? false,
      status: "pending",
      createdAt: new Date(),
    };
    this.registrations.set(newRegistration.id, newRegistration);
    
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

// Use MemStorage until user explicitly migrates to Supabase
export const storage = new MemStorage();