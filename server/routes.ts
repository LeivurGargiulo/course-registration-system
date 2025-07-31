import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertRegistrationSchema, insertCommissionSchema, updateCommissionSchema, commissionCancellationSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Course routes
  app.get("/api/courses", async (req, res) => {
    try {
      const courses = await storage.getCourses();
      res.json(courses);
    } catch (error) {
      console.error("Error fetching courses:", error);
      res.status(500).json({ message: "Failed to fetch courses" });
    }
  });

  app.get("/api/courses/:courseId/commissions", async (req, res) => {
    try {
      const { courseId } = req.params;
      const commissions = await storage.getCommissionsByCourse(courseId);
      res.json(commissions);
    } catch (error) {
      console.error("Error fetching commissions:", error);
      res.status(500).json({ message: "Failed to fetch commissions" });
    }
  });

  // Registration routes
  app.post("/api/registrations", async (req, res) => {
    try {
      const validatedData = insertRegistrationSchema.parse(req.body);
      
      // Check if commission exists and has capacity
      const commission = await storage.getCommission(validatedData.commissionId);
      if (!commission) {
        return res.status(404).json({ message: "Comisión no encontrada" });
      }
      
      if (commission.currentEnrollment >= commission.maxCapacity) {
        return res.status(400).json({ message: "La comisión está completa" });
      }

      const registration = await storage.createRegistration(validatedData);
      res.status(201).json(registration);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Datos inválidos", 
          errors: error.errors 
        });
      }
      console.error("Error creating registration:", error);
      res.status(500).json({ message: "Error al crear la inscripción" });
    }
  });

  // Admin routes (protected)
  app.get("/api/admin/registrations", isAuthenticated, async (req, res) => {
    try {
      const registrations = await storage.getRegistrations();
      res.json(registrations);
    } catch (error) {
      console.error("Error fetching registrations:", error);
      res.status(500).json({ message: "Failed to fetch registrations" });
    }
  });

  // Admin commission management
  app.post("/api/admin/commissions", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertCommissionSchema.parse(req.body);
      
      // Check for schedule conflicts
      const hasConflict = await storage.checkScheduleConflict(
        validatedData.courseId,
        validatedData.days,
        validatedData.time
      );
      
      if (hasConflict) {
        return res.status(400).json({ 
          message: "Ya existe una comisión con el mismo horario para este curso" 
        });
      }

      const commission = await storage.createCommission(validatedData);
      res.status(201).json(commission);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Datos inválidos", 
          errors: error.errors 
        });
      }
      console.error("Error creating commission:", error);
      res.status(500).json({ message: "Error al crear la comisión" });
    }
  });

  app.put("/api/admin/commissions/:id", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const validatedData = updateCommissionSchema.parse({ ...req.body, id });
      
      // Check for schedule conflicts if schedule data is being updated
      if (validatedData.days || validatedData.time) {
        const existing = await storage.getCommission(id);
        if (!existing) {
          return res.status(404).json({ message: "Comisión no encontrada" });
        }
        
        const hasConflict = await storage.checkScheduleConflict(
          existing.courseId,
          validatedData.days || existing.days,
          validatedData.time || existing.time,
          id
        );
        
        if (hasConflict) {
          return res.status(400).json({ 
            message: "Ya existe una comisión con el mismo horario para este curso" 
          });
        }
      }

      const commission = await storage.updateCommission(id, validatedData);
      res.json(commission);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Datos inválidos", 
          errors: error.errors 
        });
      }
      console.error("Error updating commission:", error);
      res.status(500).json({ message: "Error al actualizar la comisión" });
    }
  });

  app.delete("/api/admin/commissions/:id", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const commission = await storage.getCommission(id);
      
      if (!commission) {
        return res.status(404).json({ message: "Comisión no encontrada" });
      }
      
      if (commission.currentEnrollment > 0) {
        return res.status(400).json({ 
          message: "No se puede eliminar una comisión con estudiantes inscriptos" 
        });
      }

      await storage.deleteCommission(id);
      res.json({ message: "Comisión eliminada exitosamente" });
    } catch (error) {
      console.error("Error deleting commission:", error);
      res.status(500).json({ message: "Error al eliminar la comisión" });
    }
  });

  // Commission cancellation
  app.post("/api/admin/commissions/:id/cancel", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const validatedData = commissionCancellationSchema.parse({ ...req.body, id });
      
      const commission = await storage.getCommission(id);
      if (!commission) {
        return res.status(404).json({ message: "Comisión no encontrada" });
      }
      
      await storage.updateCommission(id, {
        isActive: false,
        cancelReason: validatedData.reason
      });
      
      res.json({ message: "Comisión cancelada exitosamente" });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Datos inválidos", 
          errors: error.errors 
        });
      }
      console.error("Error cancelling commission:", error);
      res.status(500).json({ message: "Error al cancelar la comisión" });
    }
  });

  // Low enrollment commissions
  app.get("/api/admin/commissions/low-enrollment", isAuthenticated, async (req, res) => {
    try {
      const threshold = parseInt(req.query.threshold as string) || 5;
      const commissions = await storage.getCommissionsWithLowEnrollment(threshold);
      res.json(commissions);
    } catch (error) {
      console.error("Error fetching low enrollment commissions:", error);
      res.status(500).json({ message: "Failed to fetch low enrollment commissions" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}