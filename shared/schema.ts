import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  email: text("email").unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("user"), // "admin", "user"
  firstName: text("first_name"),
  lastName: text("last_name"),
  profileImageUrl: text("profile_image_url"),
  isActive: boolean("is_active").notNull().default(true),
  resetToken: text("reset_token"),
  resetTokenExpiry: timestamp("reset_token_expiry"),
  lastLogin: timestamp("last_login"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Sessions table for express-session
export const sessions = pgTable("sessions", {
  sid: varchar("sid").primaryKey(),
  sess: text("sess").notNull(), // JSON session data
  expire: timestamp("expire").notNull(),
});

export const courses = pgTable("courses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description").notNull(),
  level: text("level").notNull(), // "Principiante", "Intermedio", "Avanzado"
  duration: text("duration").notNull(), // "8 semanas"
  totalWeeks: integer("total_weeks").notNull(),
  startDate: text("start_date").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const commissions = pgTable("commissions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  courseId: varchar("course_id").notNull().references(() => courses.id),
  code: text("code").notNull().unique(), // "M1LN01"
  days: text("days").notNull(), // "Martes y Jueves"
  time: text("time").notNull(), // "19:00 - 21:00"
  instructor: text("instructor").notNull(),
  maxCapacity: integer("max_capacity").notNull().default(20),
  currentEnrollment: integer("current_enrollment").notNull().default(0),
  startDate: text("start_date").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const registrations = pgTable("registrations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  courseId: varchar("course_id").notNull().references(() => courses.id),
  commissionId: varchar("commission_id").notNull().references(() => commissions.id),
  fullName: text("full_name").notNull(),
  pronouns: text("pronouns").notNull(),
  email: text("email").notNull(),
  discordUsername: text("discord_username").notNull(),
  communityAffiliation: text("community_affiliation").notNull(), // "si", "no", "prefiero-no-decir"
  dataConsent: boolean("data_consent").notNull().default(false),
  newsletter: boolean("newsletter").notNull().default(false),
  status: text("status").notNull().default("pending"), // "pending", "confirmed", "cancelled"
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertCourseSchema = createInsertSchema(courses).omit({
  id: true,
  createdAt: true,
});

export const insertCommissionSchema = createInsertSchema(commissions).omit({
  id: true,
  createdAt: true,
});

export const insertRegistrationSchema = createInsertSchema(registrations).omit({
  id: true,
  createdAt: true,
}).extend({
  fullName: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  pronouns: z.string().min(1, "Los pronombres son obligatorios"),
  email: z.string().email("Ingresa un email válido"),
  discordUsername: z.string().regex(/^.+#\d{4}$/, "Formato de Discord inválido (usuario#1234)"),
  communityAffiliation: z.enum(["si", "no", "prefiero-no-decir"]),
  dataConsent: z.boolean().refine(val => val === true, "Debes aceptar el consentimiento de datos"),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  resetToken: true,
  resetTokenExpiry: true,
  lastLogin: true,
}).extend({
  username: z.string().min(3, "El usuario debe tener al menos 3 caracteres"),
  email: z.string().email("Ingresa un email válido").optional(),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  role: z.enum(["admin", "user"]).default("user"),
});

export const loginSchema = z.object({
  username: z.string().min(1, "Usuario requerido"),
  password: z.string().min(1, "Contraseña requerida"),
});

export const passwordResetRequestSchema = z.object({
  email: z.string().email("Ingresa un email válido"),
});

export const passwordResetSchema = z.object({
  token: z.string().min(1, "Token requerido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type LoginData = z.infer<typeof loginSchema>;
export type PasswordResetRequest = z.infer<typeof passwordResetRequestSchema>;
export type PasswordReset = z.infer<typeof passwordResetSchema>;
export type Course = typeof courses.$inferSelect;
export type InsertCourse = z.infer<typeof insertCourseSchema>;
export type Commission = typeof commissions.$inferSelect;
export type InsertCommission = z.infer<typeof insertCommissionSchema>;
export type Registration = typeof registrations.$inferSelect;
export type InsertRegistration = z.infer<typeof insertRegistrationSchema>;

// Extended types for frontend
export type CourseWithCommissions = Course & {
  commissions: Commission[];
  availableCommissions: number;
};

export type CommissionWithAvailability = Commission & {
  availableSpots: number;
};
