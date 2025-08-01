import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { Plus, Edit2, Trash2, AlertTriangle, Clock, Users } from "lucide-react";
import type { CourseWithCommissions, Registration, Commission, InsertCommission } from "@shared/schema";

export default function AdminDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  
  // Commission form state
  const [isCommissionDialogOpen, setIsCommissionDialogOpen] = useState(false);
  const [editingCommission, setEditingCommission] = useState<Commission | null>(null);
  const [commissionForm, setCommissionForm] = useState<Partial<InsertCommission>>({
    courseId: '',
    code: '',
    days: '',
    time: '',
    instructor: '',
    maxCapacity: 20,
    startDate: '',
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      // In development, we'll allow access without authentication
      console.log("Development mode: allowing admin access");
    }
  }, [isAuthenticated, authLoading, toast]);

  // Fetch courses
  const { data: courses, isLoading: coursesLoading } = useQuery<CourseWithCommissions[]>({
    queryKey: ["/api/courses"],
  });

  // Fetch registrations with error handling
  const { data: registrations, isLoading: registrationsLoading, error: registrationsError } = useQuery<Registration[]>({
    queryKey: ["/api/admin/registrations"],
    retry: false,
    enabled: isAuthenticated,
  });

  // Fetch low enrollment commissions
  const { data: lowEnrollmentCommissions } = useQuery<Commission[]>({
    queryKey: ["/api/admin/commissions/low-enrollment"],
    retry: false,
    enabled: isAuthenticated,
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

  // Commission mutations
  const createCommissionMutation = useMutation({
    mutationFn: async (commissionData: InsertCommission) => {
      return await apiRequest("/api/admin/commissions", "POST", commissionData);
    },
    onSuccess: () => {
      toast({
        title: "Comisión creada",
        description: "La comisión se ha creado exitosamente",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/courses"] });
      setIsCommissionDialogOpen(false);
      setCommissionForm({
        courseId: '',
        code: '',
        days: '',
        time: '',
        instructor: '',
        maxCapacity: 20,
        startDate: '',
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error as Error)) {
        toast({
          title: "No autorizado",
          description: "Tu sesión ha expirado. Redirigiendo al login...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/login";
        }, 1500);
        return;
      }
      toast({
        title: "Error",
        description: (error as Error).message || "Error al crear la comisión",
        variant: "destructive",
      });
    },
  });

  const updateCommissionMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Commission> }) => {
      return await apiRequest(`/api/admin/commissions/${id}`, "PUT", data);
    },
    onSuccess: () => {
      toast({
        title: "Comisión actualizada",
        description: "La comisión se ha actualizado exitosamente",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/courses"] });
      setEditingCommission(null);
      setIsCommissionDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: (error as Error).message || "Error al actualizar la comisión",
        variant: "destructive",
      });
    },
  });

  const deleteCommissionMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest(`/api/admin/commissions/${id}`, "DELETE");
    },
    onSuccess: () => {
      toast({
        title: "Comisión eliminada",
        description: "La comisión se ha eliminado exitosamente",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/courses"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: (error as Error).message || "Error al eliminar la comisión",
        variant: "destructive",
      });
    },
  });

  const handleCreateCommission = () => {
    if (!commissionForm.courseId || !commissionForm.code || !commissionForm.days || 
        !commissionForm.time || !commissionForm.instructor || !commissionForm.startDate) {
      toast({
        title: "Campos requeridos",
        description: "Por favor complete todos los campos obligatorios",
        variant: "destructive",
      });
      return;
    }

    createCommissionMutation.mutate(commissionForm as InsertCommission);
  };

  const handleEditCommission = (commission: Commission) => {
    setEditingCommission(commission);
    setCommissionForm({
      courseId: commission.courseId,
      code: commission.code,
      days: commission.days, 
      time: commission.time,
      instructor: commission.instructor,
      maxCapacity: commission.maxCapacity,
      startDate: commission.startDate,
    });
    setIsCommissionDialogOpen(true);
  };

  const handleUpdateCommission = () => {
    if (!editingCommission) return;
    
    updateCommissionMutation.mutate({
      id: editingCommission.id,
      data: commissionForm as Partial<Commission>
    });
  };

  const handleDeleteCommission = (id: string) => {
    if (confirm("¿Estás seguro de que quieres eliminar esta comisión?")) {
      deleteCommissionMutation.mutate(id);
    }
  };

  // Handle authorization errors
  useEffect(() => {
    if (registrationsError && isUnauthorizedError(registrationsError as Error)) {
      // In development, we'll log the error but continue
      console.log("Development mode: ignoring auth error");
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
  if (!authLoading && !isAuthenticated) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertDescription>
            No se pudo cargar la información de usuario.
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
    <div className="container mx-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Panel de Administración</h1>
          <p className="text-slate-600 text-sm sm:text-base">
            Bienvenido/a {user?.firstName || user?.email} - Gestiona cursos, comisiones e inscripciones
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:space-x-2">
          <Button variant="outline" onClick={() => window.location.href = "/api/logout"} className="text-sm sm:text-base">
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
            </svg>
            Salir
          </Button>
          <Button variant="outline" onClick={() => window.location.href = "/"} className="text-sm sm:text-base">
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9.586l7.293 7.293a1 1 0 01-1.414 1.414L9.707 14.707z" clipRule="evenodd" />
            </svg>
            Volver al sitio
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        <Card>
          <CardContent className="p-3 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-primary/10 rounded-lg flex items-center justify-center mb-2 sm:mb-0 sm:mr-3">
                <svg className="w-3 h-3 sm:w-4 sm:h-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-lg sm:text-2xl font-bold text-slate-900">{confirmedRegistrations}</p>
                <p className="text-xs sm:text-sm text-slate-600">Inscripciones confirmadas</p>
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
      <Tabs defaultValue="courses" className="space-y-4 sm:space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="courses" className="text-xs sm:text-sm">Cursos</TabsTrigger>
          <TabsTrigger value="commissions" className="text-xs sm:text-sm">Comisiones</TabsTrigger> 
          <TabsTrigger value="registrations" className="text-xs sm:text-sm">Inscripciones</TabsTrigger>
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
                                  <div className="flex items-center space-x-1 mt-2">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleEditCommission(commission)}
                                    >
                                      <Edit2 className="w-3 h-3" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleDeleteCommission(commission.id)}
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </Button>
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

        {/* Commission Management Tab */}
        <TabsContent value="commissions">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Gestión de Comisiones</CardTitle>
              <Dialog open={isCommissionDialogOpen} onOpenChange={setIsCommissionDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => {
                    setEditingCommission(null);
                    setCommissionForm({
                      courseId: '',
                      code: '',
                      days: '',
                      time: '',
                      instructor: '',
                      maxCapacity: 20,
                      startDate: '',
                    });
                  }}>
                    <Plus className="w-4 h-4 mr-2" />
                    Nueva Comisión
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[525px]">
                  <DialogHeader>
                    <DialogTitle>
                      {editingCommission ? "Editar Comisión" : "Crear Nueva Comisión"}
                    </DialogTitle>
                    <DialogDescription>
                      {editingCommission 
                        ? "Modifica los datos de la comisión existente."
                        : "Crea una nueva comisión para un curso existente."
                      }
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="course" className="text-right">
                        Curso
                      </Label>
                      <Select
                        value={commissionForm.courseId}
                        onValueChange={(value) => setCommissionForm({...commissionForm, courseId: value})}
                      >
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Selecciona un curso" />
                        </SelectTrigger>
                        <SelectContent>
                          {courses?.map((course) => (
                            <SelectItem key={course.id} value={course.id}>
                              {course.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="code" className="text-right">
                        Código
                      </Label>
                      <Input
                        id="code"
                        value={commissionForm.code}
                        onChange={(e) => setCommissionForm({...commissionForm, code: e.target.value})}
                        placeholder="M1LN01"
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="days" className="text-right">
                        Días
                      </Label>
                      <Input
                        id="days"
                        value={commissionForm.days}
                        onChange={(e) => setCommissionForm({...commissionForm, days: e.target.value})}
                        placeholder="Martes y Jueves"
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="time" className="text-right">
                        Horario
                      </Label>
                      <Input
                        id="time"
                        value={commissionForm.time}
                        onChange={(e) => setCommissionForm({...commissionForm, time: e.target.value})}
                        placeholder="19:00 - 21:00"
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="instructor" className="text-right">
                        Instructor
                      </Label>
                      <Input
                        id="instructor"
                        value={commissionForm.instructor}
                        onChange={(e) => setCommissionForm({...commissionForm, instructor: e.target.value})}
                        placeholder="Nombre del instructor"
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="capacity" className="text-right">
                        Capacidad
                      </Label>
                      <Input
                        id="capacity"
                        type="number"
                        min="5"
                        max="30"
                        value={commissionForm.maxCapacity}
                        onChange={(e) => setCommissionForm({...commissionForm, maxCapacity: parseInt(e.target.value)})}
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="startDate" className="text-right">
                        Fecha Inicio
                      </Label>
                      <Input
                        id="startDate"
                        value={commissionForm.startDate}
                        onChange={(e) => setCommissionForm({...commissionForm, startDate: e.target.value})}
                        placeholder="15 de marzo"
                        className="col-span-3"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      onClick={editingCommission ? handleUpdateCommission : handleCreateCommission}
                      disabled={createCommissionMutation.isPending || updateCommissionMutation.isPending}
                    >
                      {createCommissionMutation.isPending || updateCommissionMutation.isPending ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      ) : null}
                      {editingCommission ? "Actualizar" : "Crear"} Comisión
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {/* Low enrollment warning */}
              {lowEnrollmentCommissions && lowEnrollmentCommissions.length > 0 && (
                <Alert className="mb-4 border-amber-200 bg-amber-50">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  <AlertDescription className="text-amber-800">
                    <strong>Atención:</strong> Hay {lowEnrollmentCommissions.length} comisión(es) con inscripciones por debajo del mínimo (5 estudiantes).
                  </AlertDescription>
                </Alert>
              )}

              {courses && courses.length > 0 ? (
                <div className="space-y-6">
                  {courses.map((course) => (
                    <div key={course.id} className="border border-slate-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h4 className="text-lg font-semibold text-slate-900">{course.name}</h4>
                          <p className="text-sm text-slate-600">{course.level} - {course.duration}</p>
                        </div>
                        <Badge className="bg-blue-100 text-blue-800">
                          {course.commissions.length} comisiones
                        </Badge>
                      </div>
                      
                      {course.commissions.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {course.commissions.map((commission) => {
                            const status = getAvailabilityStatus(commission.currentEnrollment, commission.maxCapacity);
                            const isLowEnrollment = commission.currentEnrollment < 5;
                            
                            return (
                              <div key={commission.id} className={`border rounded-lg p-4 ${isLowEnrollment ? 'border-amber-200 bg-amber-50' : 'border-slate-200 bg-white'}`}>
                                <div className="flex items-center justify-between mb-2">
                                  <span className="font-semibold text-slate-900">{commission.code}</span>
                                  <div className="flex items-center space-x-2">
                                    {isLowEnrollment && (
                                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                                    )}
                                    <div className={`w-2 h-2 rounded-full ${status.color}`}></div>
                                  </div>
                                </div>
                                
                                <div className="space-y-2 text-sm text-slate-600 mb-3">
                                  <div className="flex items-center">
                                    <Clock className="w-3 h-3 mr-1" />
                                    {commission.days} - {commission.time}
                                  </div>
                                  <div>
                                    <strong>Instructor:</strong> {commission.instructor}
                                  </div>
                                  <div className="flex items-center">
                                    <Users className="w-3 h-3 mr-1" />
                                    {commission.currentEnrollment}/{commission.maxCapacity} inscriptos
                                  </div>
                                  <div>
                                    <strong>Inicio:</strong> {commission.startDate}
                                  </div>
                                </div>
                                
                                <div className="flex items-center justify-between">
                                  <Badge className={`${status.color.replace('bg-', 'bg-opacity-20 text-')} text-xs`}>
                                    {status.label}
                                  </Badge>
                                  <div className="flex items-center space-x-1">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleEditCommission(commission)}
                                    >
                                      <Edit2 className="w-3 h-3" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleDeleteCommission(commission.id)}
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="text-center py-6 text-slate-500">
                          <p>No hay comisiones para este curso</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-slate-400 mb-2">
                    <Clock className="w-8 h-8 mx-auto" />
                  </div>
                  <h3 className="text-lg font-medium text-slate-900 mb-1">No hay cursos disponibles</h3>
                  <p className="text-slate-600">Necesitas cursos antes de crear comisiones.</p>
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


      </Tabs>
    </div>
  );
}