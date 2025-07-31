import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
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

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
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
