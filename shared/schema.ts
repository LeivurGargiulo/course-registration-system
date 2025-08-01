import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean, jsonb, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
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
  cancelReason: text("cancel_reason"),
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
}).extend({
  code: z.string().min(3, "El código debe tener al menos 3 caracteres").max(10, "El código no puede exceder 10 caracteres"),
  days: z.string().min(1, "Los días son obligatorios"),
  time: z.string().min(1, "El horario es obligatorio"),
  instructor: z.string().min(2, "El nombre del instructor debe tener al menos 2 caracteres"),
  maxCapacity: z.number().min(5, "La capacidad mínima es 5 estudiantes").max(30, "La capacidad máxima es 30 estudiantes"),
  startDate: z.string().min(1, "La fecha de inicio es obligatoria"),
});

export const updateCommissionSchema = insertCommissionSchema.partial().extend({
  id: z.string(),
});

export const commissionCancellationSchema = z.object({
  id: z.string().min(1, "ID de comisión requerido"),
  reason: z.string().min(10, "Debe proporcionar una razón de al menos 10 caracteres"),
  notifyStudents: z.boolean().default(true),
});

export const insertRegistrationSchema = createInsertSchema(registrations).omit({
  id: true,
  createdAt: true,
}).extend({
  fullName: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  pronouns: z.string().min(1, "Los pronombres son obligatorios"),
  email: z.string().email("Ingresa un email válido"),
  discordUsername: z.string().regex(/^.+#\d{4}$/, "Formato de Discord inválido (usuario#1234)"),
  dataConsent: z.boolean().refine(val => val === true, "Debes aceptar el consentimiento de datos"),
});

export const insertUserSchema = createInsertSchema(users).omit({
  createdAt: true,
  updatedAt: true,
});



// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type Course = typeof courses.$inferSelect;
export type InsertCourse = z.infer<typeof insertCourseSchema>;
export type Commission = typeof commissions.$inferSelect;
export type InsertCommission = z.infer<typeof insertCommissionSchema>;
export type UpdateCommission = z.infer<typeof updateCommissionSchema>;
export type CommissionCancellation = z.infer<typeof commissionCancellationSchema>;
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
