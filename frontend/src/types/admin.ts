import type { WhatsIncludedItem } from "./course";

export interface PagedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export type RegistrationStatus = "NEW" | "CONTACTED" | "WHATSAPP_ADDED" | "CONFIRMED" | "CANCELLED";

export interface AdminRegistrationListItem {
  id: number;
  registrationNumber: string;
  fullName: string;
  email: string;
  courseTitle: string;
  cohortName: string;
  privateTutorial: boolean;
  status: RegistrationStatus;
  createdAt: string;
}

export interface AdminRegistrationDetail {
  id: number;
  registrationNumber: string;
  fullName: string;
  email: string;
  whatsappNumber: string;
  courseId: number;
  courseTitle: string;
  cohortId: number;
  cohortName: string;
  privateTutorial: boolean;
  preferredTime: string | null;
  experienceLevel: string | null;
  referralSource: string | null;
  consentGiven: boolean;
  status: RegistrationStatus;
  createdAt: string;
  updatedAt: string;
  studentId: string | null;
}

export interface AdminActionLog {
  action: string;
  details: string | null;
  adminName: string;
  createdAt: string;
}

export interface DashboardMetrics {
  totalCourses: number;
  publishedCourses: number;
  totalCohorts: number;
  openCohorts: number;
  totalRegistrations: number;
  registrationsByStatus: Record<RegistrationStatus, number>;
  recentRegistrations: AdminRegistrationListItem[];
}

export interface AdminCourse {
  id: number;
  title: string;
  slug: string;
  shortDescription: string | null;
  description: string | null;
  image: string | null;
  level: string | null;
  duration: string | null;
  mode: string | null;
  price: number | null;
  discountPrice: number | null;
  requirements: string | null;
  targetAudience: string | null;
  certificateAvailable: boolean;
  published: boolean;
  instructorName: string | null;
  instructorBio: string | null;
  instructorAvatarUrl: string | null;
  projects: string | null;
  whatsIncluded: WhatsIncludedItem[];
  aiSkillsDescription: string | null;
}

export type AdminCourseInput = Omit<AdminCourse, "id">;

export interface AdminModule {
  id: number;
  courseId: number;
  title: string;
  description: string | null;
  position: number;
  topics: AdminTopic[];
}

export interface AdminTopic {
  id: number;
  moduleId: number;
  title: string;
  position: number;
}

export interface AdminCohort {
  id: number;
  courseId: number;
  name: string;
  startDate: string | null;
  endDate: string | null;
  schedule: string | null;
  time: string | null;
  mode: string | null;
  location: string | null;
  capacity: number | null;
  status: "OPEN" | "CLOSED" | "FULL";
  privateTutorial: boolean;
}

export type AdminCohortInput = Omit<AdminCohort, "id" | "courseId">;

export interface AdminFaq {
  id: number;
  courseId: number | null;
  question: string;
  answer: string;
  position: number;
}
