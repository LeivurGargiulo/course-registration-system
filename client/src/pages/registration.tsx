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
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-primary rounded-lg p-2">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h1 className="text-lg font-semibold text-slate-900">DevCourses</h1>
                <p className="text-sm text-slate-600">Educación inclusiva</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => window.location.href = "/admin"}
                className="flex items-center space-x-2 px-3 py-2 text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors duration-200"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                </svg>
                <span>Admin</span>
              </button>
              <button className="text-slate-600 hover:text-slate-900">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ProgressStepper steps={steps} currentStep={currentStep} />

        <div className="mt-8">
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
      </main>
    </div>
  );
}
