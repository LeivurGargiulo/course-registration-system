import type { RegistrationStep } from "@/lib/types";

interface ProgressStepperProps {
  steps: RegistrationStep[];
  currentStep: number;
}

export default function ProgressStepper({ steps, currentStep }: ProgressStepperProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6 shadow-sm">
      <h2 className="text-lg sm:text-xl font-semibold text-slate-900 mb-4 sm:mb-6">Proceso de Inscripción</h2>
      
      {/* Mobile: Vertical stepper */}
      <div className="sm:hidden">
        <div className="flex flex-col space-y-4">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full font-medium text-sm ${
                  step.isComplete
                    ? "bg-emerald-600 text-white"
                    : step.isActive
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-200 text-slate-600"
                }`}
              >
                {step.isComplete ? (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  step.id
                )}
              </div>
              <div className="ml-3 flex-1">
                <p
                  className={`text-sm font-medium ${
                    step.isActive ? "text-slate-900" : "text-slate-600"
                  }`}
                >
                  {step.title}
                </p>
                <p className="text-xs text-slate-500">{step.subtitle}</p>
              </div>
              {step.isActive && (
                <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
              )}
            </div>
          ))}
        </div>
      </div>
      
      {/* Desktop: Horizontal stepper */}
      <div className="hidden sm:flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center flex-1">
            <div className="flex items-center">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full font-medium ${
                  step.isComplete
                    ? "bg-emerald-600 text-white"
                    : step.isActive
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-200 text-slate-600"
                }`}
              >
                {step.isComplete ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  step.id
                )}
              </div>
              <div className="ml-3">
                <p
                  className={`text-sm font-medium ${
                    step.isActive ? "text-slate-900" : "text-slate-600"
                  }`}
                >
                  {step.title}
                </p>
                <p className="text-xs text-slate-500">{step.subtitle}</p>
              </div>
            </div>
            {index < steps.length - 1 && (
              <div className="flex-1 h-px bg-slate-300 mx-4">
                <div
                  className={`h-px transition-all duration-300 ${
                    step.isComplete ? "bg-emerald-600" : "bg-slate-300"
                  }`}
                  style={{
                    width: step.isComplete ? "100%" : "0%",
                  }}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}