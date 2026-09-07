export type ExperienceLevel = "BEGINNER" | "INTERMEDIATE" | "ADVANCED";

export interface RegistrationRequest {
  fullName: string;
  email: string;
  whatsappNumber: string;
  courseId: number;
  cohortId: number;
  experienceLevel: ExperienceLevel | null;
  referralSource: string | null;
  consentGiven: boolean;
  preferredTime: string | null;
}

export interface RegistrationResponse {
  registrationNumber: string;
  fullName: string;
  email: string;
  courseTitle: string;
  cohortName: string;
  privateTutorial: boolean;
  preferredTime: string | null;
  status: string;
}
