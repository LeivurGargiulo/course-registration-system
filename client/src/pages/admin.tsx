import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import type { CourseWithCommissions, Registration } from "@shared/schema";

export default function AdminDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user, isLoading: authLoading, isAuthenticated, isAdmin } = useAuth();

  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (!authLoading && (!isAuthenticated || !isAdmin)) {
      toast({
        title: "Acceso denegado",
        description: "Necesitas permisos de administrador para acceder a esta página",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/login?message=" + encodeURIComponent("Necesitas permisos de administrador");
      }, 1000);
      return;
    }
  }, [isAuthenticated, isAdmin, authLoading, toast]);

  // Fetch courses
  const { data: courses, isLoading: coursesLoading } = useQuery<CourseWithCommissions[]>({
    queryKey: ["/api/courses"],
  });

  // Fetch registrations with error handling
  const { data: registrations, isLoading: registrationsLoading, error: registrationsError } = useQuery<Registration[]>({
    queryKey: ["/api/admin/registrations"],
    retry: false,
    enabled: isAuthenticated && isAdmin,
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return <Badge className="bg-emerald-100 text-emerald-800">Confirmada</Badge>;
      case "pending":
        return <Badge className="bg-amber-100 text-amber-800">Pendiente</Badge>;
      case "cancelled":
        return <Badge className="bg-red-100 text-red-800">Cancelada</Badge>;
      default:
        return <Badge className="bg-slate-100 text-slate-800">{status}</Badge>;
    }
  };

  const getAvailabilityStatus = (current: number, max: number) => {
    const percentage = (current / max) * 100;
    if (percentage >= 90) return { color: "bg-red-500", label: "Completa" };
    if (percentage >= 70) return { color: "bg-amber-500", label: "Casi completa" };
    return { color: "bg-emerald-500", label: "Disponible" };
  };

  // Handle authorization errors
  useEffect(() => {
    if (registrationsError && isUnauthorizedError(registrationsError as Error)) {
      toast({
        title: "No autorizado",
        description: "Tu sesión ha expirado. Redirigiendo al login...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/login";
      }, 1500);
    }
  }, [registrationsError, toast]);

  if (authLoading || coursesLoading || registrationsLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  // Show error if not authenticated or not admin
  if (!authLoading && (!isAuthenticated || !isAdmin)) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertDescription>
            Acceso denegado. Necesitas permisos de administrador para ver esta página.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const totalRegistrations = registrations?.length || 0;
  const confirmedRegistrations = registrations?.filter(r => r.status === "confirmed").length || 0;
  const totalCourses = courses?.length || 0;
  const activeCourses = courses?.filter(c => c.isActive).length || 0;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Panel de Administración</h1>
          <p className="text-slate-600">
            Bienvenido/a {user?.firstName || user?.username} - Gestiona cursos, comisiones e inscripciones
          </p>
        </div>
        <div className="space-x-2">
          <Button variant="outline" onClick={() => window.location.href = "/api/auth/logout"}>
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
            </svg>
            Cerrar sesión
          </Button>
          <Button variant="outline" onClick={() => window.location.href = "/"}>
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9.586l7.293 7.293a1 1 0 01-1.414 1.414L9.707 14.707z" clipRule="evenodd" />
            </svg>
            Volver al sitio
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{confirmedRegistrations}</p>
                <p className="text-sm text-slate-600">Inscripciones confirmadas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-4 h-4 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM5 8a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2H5z" />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{totalRegistrations}</p>
                <p className="text-sm text-slate-600">Total inscripciones</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                  <path fillRule="evenodd" d="M4 5a2 2 0 012-2v1a2 2 0 00-2 2v6a2 2 0 002 2h8a2 2 0 002-2V6a2 2 0 00-2-2V3a2 2 0 012-2 2 2 0 012 2v8a4 4 0 01-4 4H6a4 4 0 01-4-4V5z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{activeCourses}</p>
                <p className="text-sm text-slate-600">Cursos activos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{totalCourses}</p>
                <p className="text-sm text-slate-600">Total cursos</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="courses" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="courses">Cursos</TabsTrigger>
          <TabsTrigger value="registrations">Inscripciones</TabsTrigger>
          <TabsTrigger value="analytics">Analíticas</TabsTrigger>
        </TabsList>

        {/* Courses Tab */}
        <TabsContent value="courses">
          <Card>
            <CardHeader>
              <CardTitle>Gestión de Cursos</CardTitle>
            </CardHeader>
            <CardContent>
              {courses && courses.length > 0 ? (
                <div className="space-y-4">
                  {courses.map((course) => (
                    <div key={course.id} className="border border-slate-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="text-lg font-semibold text-slate-900">{course.name}</h4>
                          <p className="text-sm text-slate-600">{course.description}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={course.isActive ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-800"}>
                            {course.isActive ? "Activo" : "Inactivo"}
                          </Badge>
                          <Badge className="bg-blue-100 text-blue-800">{course.level}</Badge>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-slate-600 mb-4">
                        <div>
                          <span className="font-medium">Duración:</span> {course.duration}
                        </div>
                        <div>
                          <span className="font-medium">Inicio:</span> {course.startDate}
                        </div>
                        <div>
                          <span className="font-medium">Semanas:</span> {course.totalWeeks}
                        </div>
                        <div>
                          <span className="font-medium">Comisiones:</span> {course.commissions.length}
                        </div>
                      </div>

                      {course.commissions.length > 0 && (
                        <div>
                          <Separator className="my-3" />
                          <h5 className="font-medium text-slate-900 mb-2">Comisiones</h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {course.commissions.map((commission) => {
                              const status = getAvailabilityStatus(commission.currentEnrollment, commission.maxCapacity);
                              return (
                                <div key={commission.id} className="bg-slate-50 rounded-lg p-3">
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="font-medium text-slate-900">{commission.code}</span>
                                    <div className="flex items-center space-x-2">
                                      <div className={`w-2 h-2 rounded-full ${status.color}`}></div>
                                      <span className="text-xs text-slate-600">{status.label}</span>
                                    </div>
                                  </div>
                                  <div className="text-xs text-slate-600 space-y-1">
                                    <div>{commission.days} - {commission.time}</div>
                                    <div>Profesor: {commission.instructor}</div>
                                    <div>Inscriptos: {commission.currentEnrollment}/{commission.maxCapacity}</div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-slate-400 mb-2">
                    <svg className="w-8 h-8 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm2 6a2 2 0 104 0 2 2 0 00-4 0zm6 0a2 2 0 104 0 2 2 0 00-4 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-slate-900 mb-1">No hay cursos disponibles</h3>
                  <p className="text-slate-600">Los cursos aparecerán aquí una vez creados.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Registrations Tab */}
        <TabsContent value="registrations">
          <Card>
            <CardHeader>
              <CardTitle>Inscripciones Recientes</CardTitle>
            </CardHeader>
            <CardContent>
              {registrations && registrations.length > 0 ? (
                <div className="space-y-4">
                  {registrations.slice(0, 10).map((registration) => (
                    <div key={registration.id} className="border border-slate-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="font-medium text-slate-900">{registration.fullName}</h4>
                            {getStatusBadge(registration.status)}
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-slate-600">
                            <div>
                              <span className="font-medium">Email:</span> {registration.email}
                            </div>
                            <div>
                              <span className="font-medium">Pronombres:</span> {registration.pronouns}
                            </div>
                            <div>
                              <span className="font-medium">Discord:</span> {registration.discordUsername}
                            </div>
                            <div>
                              <span className="font-medium">Fecha:</span> {new Date(registration.createdAt || '').toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-slate-400 mb-2">
                    <svg className="w-8 h-8 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM5 8a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2H5z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-slate-900 mb-1">No hay inscripciones</h3>
                  <p className="text-slate-600">Las inscripciones aparecerán aquí una vez completadas.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Resumen de Inscripciones</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg">
                    <span className="text-emerald-800 font-medium">Confirmadas</span>
                    <span className="text-2xl font-bold text-emerald-900">{confirmedRegistrations}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                    <span className="text-amber-800 font-medium">Pendientes</span>
                    <span className="text-2xl font-bold text-amber-900">
                      {registrations?.filter(r => r.status === "pending").length || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    <span className="text-red-800 font-medium">Canceladas</span>
                    <span className="text-2xl font-bold text-red-900">
                      {registrations?.filter(r => r.status === "cancelled").length || 0}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Información de la Comunidad</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {registrations && registrations.length > 0 ? (
                    <>
                      <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                        <span className="text-purple-800 font-medium">Comunidad TTNb</span>
                        <span className="text-2xl font-bold text-purple-900">
                          {registrations.filter(r => r.communityAffiliation === "si").length}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                        <span className="text-blue-800 font-medium">Newsletter</span>
                        <span className="text-2xl font-bold text-blue-900">
                          {registrations.filter(r => r.newsletter).length}
                        </span>
                      </div>
                    </>
                  ) : (
                    <p className="text-slate-600 text-center py-4">No hay datos disponibles</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}