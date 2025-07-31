import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Course, Commission } from "@shared/schema";
import type { RegistrationFormData } from "@/lib/types";

interface FinalConfirmationProps {
  course: Course;
  commission: Commission;
  formData: RegistrationFormData;
  onPrevious: () => void;
}

export default function FinalConfirmation({ 
  course, 
  commission, 
  formData, 
  onPrevious 
}: FinalConfirmationProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitted, setIsSubmitted] = useState(false);

  const submitRegistration = useMutation({
    mutationFn: async (data: RegistrationFormData) => {
      const response = await apiRequest("POST", "/api/registrations", data);
      return response.json();
    },
    onSuccess: (data) => {
      setIsSubmitted(true);
      toast({
        title: "¡Inscripción completada!",
        description: "Te hemos enviado un correo de confirmación con todos los detalles.",
      });
      // Invalidate relevant queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/courses"] });
      queryClient.invalidateQueries({ queryKey: ["/api/courses", course.id, "commissions"] });
    },
    onError: (error) => {
      console.error("Registration error:", error);
      toast({
        title: "Error en la inscripción",
        description: "Hubo un problema al procesar tu inscripción. Por favor, intenta nuevamente.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    submitRegistration.mutate(formData);
  };

  if (isSubmitted) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="border-emerald-200 bg-emerald-50">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">¡Inscripción Completada!</h2>
            <p className="text-slate-600 mb-6">
              Tu inscripción al curso <strong>{course.name}</strong> ha sido confirmada exitosamente.
            </p>
            <div className="bg-white rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-slate-900 mb-2">Detalles de tu inscripción:</h3>
              <div className="text-sm text-slate-600 space-y-1">
                <p><strong>Curso:</strong> {course.name}</p>
                <p><strong>Comisión:</strong> {commission.code}</p>
                <p><strong>Horario:</strong> {commission.days} {commission.time}</p>
                <p><strong>Profesor:</strong> {commission.instructor}</p>
                <p><strong>Inicio:</strong> {commission.startDate}</p>
              </div>
            </div>
            <p className="text-sm text-slate-500">
              Recibirás un correo de confirmación en <strong>{formData.email}</strong> con toda la información del curso.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle>Resumen de Inscripción</CardTitle>
          <p className="text-sm text-slate-600">Revisa toda la información antes de confirmar</p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Course and Commission Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-slate-900 mb-3">Detalles del Curso</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">Curso:</span>
                  <span className="font-medium text-slate-900">{course.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Nivel:</span>
                  <Badge className="h-5">
                    {course.level}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Duración:</span>
                  <span className="font-medium text-slate-900">{course.duration}</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-slate-900 mb-3">Detalles de la Comisión</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">Comisión:</span>
                  <span className="font-medium text-slate-900">{commission.code}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Horario:</span>
                  <span className="font-medium text-slate-900">{commission.days}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Hora:</span>
                  <span className="font-medium text-slate-900">{commission.time}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Profesor:</span>
                  <span className="font-medium text-slate-900">{commission.instructor}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Inicio:</span>
                  <span className="font-medium text-slate-900">{commission.startDate}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Personal Information */}
          <div className="border-t border-slate-200 pt-6">
            <h4 className="font-semibold text-slate-900 mb-3">Información Personal</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600">Nombre:</span>
                <span className="font-medium text-slate-900">{formData.fullName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Pronombres:</span>
                <span className="font-medium text-slate-900">{formData.pronouns}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Email:</span>
                <span className="font-medium text-slate-900">{formData.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Discord:</span>
                <span className="font-medium text-slate-900">{formData.discordUsername}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Important Information */}
      <Card className="bg-slate-50">
        <CardContent className="p-6">
          <div className="flex items-start space-x-3">
            <svg className="w-6 h-6 text-primary mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div>
              <h4 className="font-medium text-slate-900 mb-1">Información importante</h4>
              <p className="text-sm text-slate-600">
                Una vez completada la inscripción, recibirás un correo de confirmación con todos los detalles del curso. 
                Si necesitas realizar cambios, contacta a nuestro equipo de soporte.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Button 
          variant="outline" 
          onClick={onPrevious}
          disabled={submitRegistration.isPending}
          className="flex-1"
        >
          <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          Volver
        </Button>
        <Button 
          onClick={handleSubmit}
          disabled={submitRegistration.isPending}
          className="flex-1"
        >
          {submitRegistration.isPending ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Procesando...
            </>
          ) : (
            <>
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Completar Inscripción
            </>
          )}
        </Button>
      </div>
    </div>
  );
}