import { db } from "./db";
import { courses, commissions } from "@shared/schema";

export async function seedDatabase() {
  try {
    console.log("Starting database seeding...");

    // Check if we already have data
    const existingCourses = await db.select().from(courses);
    if (existingCourses.length > 0) {
      console.log("Database already seeded, skipping...");
      return;
    }

    // Seed courses
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

    await db.insert(courses).values(sampleCourses);
    console.log("Courses seeded successfully");

    // Seed commissions
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

    await db.insert(commissions).values(sampleCommissions);
    console.log("Commissions seeded successfully");
    console.log("Database seeding completed!");

  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  }
}