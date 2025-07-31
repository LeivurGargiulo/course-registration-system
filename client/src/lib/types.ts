export interface RegistrationFormData {
  courseId: string;
  commissionId: string;
  fullName: string;
  pronouns: string;
  email: string;
  discordUsername: string;
  communityAffiliation: "si" | "no" | "prefiero-no-decir" | "";
  dataConsent: boolean;
  newsletter: boolean;
}

export interface RegistrationStep {
  id: number;
  title: string;
  subtitle: string;
  isComplete: boolean;
  isActive: boolean;
}

export interface RegistrationSummary {
  courseName: string;
  commissionCode: string;
  schedule: string;
  duration: string;
  instructor: string;
  startDate: string;
}

export interface FormErrors {
  [key: string]: string;
}
