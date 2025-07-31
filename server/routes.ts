import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertRegistrationSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all courses with commissions
  app.get("/api/courses", async (_req, res) => {
    try {
      const courses = await storage.getCourses();
      res.json(courses);
    } catch (error) {
      console.error("Error fetching courses:", error);
      res.status(500).json({ message: "Error interno del servidor" });
    }
  });

  // Get course by ID
  app.get("/api/courses/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const course = await storage.getCourse(id);
      
      if (!course) {
        return res.status(404).json({ message: "Curso no encontrado" });
      }
      
      res.json(course);
    } catch (error) {
      console.error("Error fetching course:", error);
      res.status(500).json({ message: "Error interno del servidor" });
    }
  });

  // Get commissions for a course
  app.get("/api/courses/:courseId/commissions", async (req, res) => {
    try {
      const { courseId } = req.params;
      const commissions = await storage.getCommissionsByCourse(courseId);
      res.json(commissions);
    } catch (error) {
      console.error("Error fetching commissions:", error);
      res.status(500).json({ message: "Error interno del servidor" });
    }
  });

  // Get commission by ID
  app.get("/api/commissions/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const commission = await storage.getCommission(id);
      
      if (!commission) {
        return res.status(404).json({ message: "Comisión no encontrada" });
      }
      
      res.json(commission);
    } catch (error) {
      console.error("Error fetching commission:", error);
      res.status(500).json({ message: "Error interno del servidor" });
    }
  });

  // Create registration
  app.post("/api/registrations", async (req, res) => {
    try {
      // Validate request body
      const validationResult = insertRegistrationSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({
          message: "Datos de inscripción inválidos",
          errors: validationResult.error.issues,
        });
      }

      const registrationData = validationResult.data;

      // Check if commission exists and has available spots
      const commission = await storage.getCommission(registrationData.commissionId);
      if (!commission) {
        return res.status(404).json({ message: "Comisión no encontrada" });
      }

      if (commission.currentEnrollment >= commission.maxCapacity) {
        return res.status(400).json({ message: "No hay cupos disponibles en esta comisión" });
      }

      // Check if course exists
      const course = await storage.getCourse(registrationData.courseId);
      if (!course) {
        return res.status(404).json({ message: "Curso no encontrado" });
      }

      // Create registration
      const registration = await storage.createRegistration(registrationData);
      
      res.status(201).json({
        message: "Inscripción completada exitosamente",
        registration,
      });
    } catch (error) {
      console.error("Error creating registration:", error);
      res.status(500).json({ message: "Error interno del servidor" });
    }
  });

  // Get all registrations (admin endpoint)
  app.get("/api/registrations", async (_req, res) => {
    try {
      const registrations = await storage.getRegistrations();
      res.json(registrations);
    } catch (error) {
      console.error("Error fetching registrations:", error);
      res.status(500).json({ message: "Error interno del servidor" });
    }
  });

  // Health check endpoint
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  const httpServer = createServer(app);
  return httpServer;
}
