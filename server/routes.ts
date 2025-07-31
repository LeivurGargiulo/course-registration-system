import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertRegistrationSchema, loginSchema, passwordResetRequestSchema, passwordResetSchema } from "@shared/schema";
import { AuthService, requireAuth, requireAdmin, loadUser, configureSession } from "./auth";
import { emailService } from "./email";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Configure session middleware
  app.use(await configureSession());
  
  // Load user middleware
  app.use(loadUser);

  // Authentication routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const validationResult = loginSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({
          message: "Datos de login inválidos",
          errors: validationResult.error.issues,
        });
      }

      const { username, password } = validationResult.data;
      const user = await AuthService.authenticateUser(username, password);

      if (!user) {
        return res.status(401).json({ message: "Usuario o contraseña incorrectos" });
      }

      // Create session
      req.session.userId = user.id;

      res.json({ 
        message: "Login exitoso", 
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          firstName: user.firstName,
          lastName: user.lastName,
          profileImageUrl: user.profileImageUrl,
        }
      });
    } catch (error) {
      console.error("Error in login:", error);
      res.status(500).json({ message: "Error interno del servidor" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.error("Error destroying session:", err);
        return res.status(500).json({ message: "Error al cerrar sesión" });
      }
      res.json({ message: "Sesión cerrada exitosamente" });
    });
  });

  app.get("/api/auth/user", requireAuth, async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ message: "Usuario no encontrado" });
    }

    res.json({
      id: req.user.id,
      username: req.user.username,
      email: req.user.email,
      role: req.user.role,
      firstName: req.user.firstName,
      lastName: req.user.lastName,
      profileImageUrl: req.user.profileImageUrl,
    });
  });

  // Password reset routes
  app.post("/api/auth/forgot-password", async (req, res) => {
    try {
      const validationResult = passwordResetRequestSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({
          message: "Email inválido",
          errors: validationResult.error.issues,
        });
      }

      const { email } = validationResult.data;
      const resetToken = await AuthService.generatePasswordResetToken(email);

      if (resetToken) {
        await emailService.sendPasswordResetEmail(email, resetToken);
      }

      // Always return success to prevent email enumeration
      res.json({ message: "Si el email existe, recibirás un enlace para restablecer tu contraseña" });
    } catch (error) {
      console.error("Error in forgot password:", error);
      res.status(500).json({ message: "Error interno del servidor" });
    }
  });

  app.post("/api/auth/reset-password", async (req, res) => {
    try {
      const validationResult = passwordResetSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({
          message: "Datos inválidos",
          errors: validationResult.error.issues,
        });
      }

      const { token, password } = validationResult.data;
      const success = await AuthService.resetPassword(token, password);

      if (!success) {
        return res.status(400).json({ message: "Token inválido o expirado" });
      }

      res.json({ message: "Contraseña restablecida exitosamente" });
    } catch (error) {
      console.error("Error in reset password:", error);
      res.status(500).json({ message: "Error interno del servidor" });
    }
  });

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

  // Admin routes (protected)
  app.get("/api/admin/registrations", requireAuth, requireAdmin, async (_req, res) => {
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
