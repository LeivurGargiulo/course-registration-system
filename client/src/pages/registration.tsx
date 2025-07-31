import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import ProgressStepper from "../components/registration/progress-stepper";
import CourseSelection from "../components/registration/course-selection";
import CommissionSelection from "../components/registration/commission-selection";
import PersonalInfoForm from "../components/registration/personal-info-form";
import FinalConfirmation from "../components/registration/final-confirmation";
import type { RegistrationFormData, RegistrationStep } from "@/lib/types";
import type { Course, Commission } from "@shared/schema";

export default function Registration() {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedCommission, setSelectedCommission] = useState<Commission | null>(null);
  const [formData, setFormData] = useState<RegistrationFormData>({
    courseId: "",
    commissionId: "",
    fullName: "",
    pronouns: "",
    email: "",
    discordUsername: "",
    communityAffiliation: "",
    dataConsent: false,
    newsletter: false,
  });

  const steps: RegistrationStep[] = [
    {
      id: 1,
      title: "Selección de Curso",
      subtitle: "Elige tu programa",
      isComplete: currentStep > 1,
      isActive: currentStep === 1,
    },
    {
      id: 2,
      title: "Comisión",
      subtitle: "Horarios disponibles",
      isComplete: currentStep > 2,
      isActive: currentStep === 2,
    },
    {
      id: 3,
      title: "Información Personal",
      subtitle: "Datos de contacto",
      isComplete: currentStep > 3,
      isActive: currentStep === 3,
    },
    {
      id: 4,
      title: "Confirmación",
      subtitle: "Finalizar inscripción",
      isComplete: false,
      isActive: currentStep === 4,
    },
  ];

  const handleCourseSelect = (course: Course) => {
    setSelectedCourse(course);
    setFormData(prev => ({ ...prev, courseId: course.id }));
    setCurrentStep(2);
    toast({
      title: "Curso seleccionado",
      description: `Has seleccionado ${course.name}`,
    });
  };

  const handleCommissionSelect = (commission: Commission) => {
    setSelectedCommission(commission);
    setFormData(prev => ({ ...prev, commissionId: commission.id }));
    setCurrentStep(3);
    toast({
      title: "Comisión seleccionada",
      description: `Comisión ${commission.code} - ${commission.days} ${commission.time}`,
    });
  };

  const handlePersonalInfoComplete = (personalData: Partial<RegistrationFormData>) => {
    setFormData(prev => ({ ...prev, ...personalData }));
    setCurrentStep(4);
    toast({
      title: "Información personal completada",
      description: "Revisa los datos antes de confirmar tu inscripción",
    });
  };

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
      <div className="container mx-auto px-4 py-6 sm:py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2 px-2">
              Inscripción a Cursos de Desarrollo Web
            </h1>
            <p className="text-slate-600 text-sm sm:text-base px-4">
              Completa el proceso de inscripción en 4 sencillos pasos
            </p>
          </div>

          {/* Progress Stepper */}
          <ProgressStepper steps={steps} currentStep={currentStep} />

          {/* Step Content */}
          <div className="mt-6 sm:mt-8">
            {currentStep === 1 && (
              <CourseSelection onCourseSelect={handleCourseSelect} />
            )}

            {currentStep === 2 && selectedCourse && (
              <CommissionSelection
                course={selectedCourse}
                onCommissionSelect={handleCommissionSelect}
                onPrevious={handlePreviousStep}
              />
            )}

            {currentStep === 3 && selectedCourse && selectedCommission && (
              <PersonalInfoForm
                formData={formData}
                onComplete={handlePersonalInfoComplete}
                onPrevious={handlePreviousStep}
              />
            )}

            {currentStep === 4 && selectedCourse && selectedCommission && (
              <FinalConfirmation
                course={selectedCourse}
                commission={selectedCommission}
                formData={formData}
                onPrevious={handlePreviousStep}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}