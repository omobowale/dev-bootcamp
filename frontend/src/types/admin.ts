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
  classSessions: AdminClassSession[];
}

export interface AdminTopic {
  id: number;
  moduleId: number;
  title: string;
  position: number;
}

export interface LessonSectionInput {
  title: string;
  body: string | null;
}

export interface AdminClassSession {
  id: number;
  moduleId: number;
  topicId: number | null;
  title: string;
  objectives: string | null;
  scheduledAt: string | null;
  meetingLink: string | null;
  recordingUrl: string | null;
  position: number;
  sections: LessonSectionInput[];
}

export type AdminClassSessionInput = Omit<AdminClassSession, "id" | "moduleId">;

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

export interface AdminQuizOption {
  text: string;
  correct: boolean;
}

export interface AdminQuizQuestion {
  id: number;
  quizId: number;
  text: string;
  points: number;
  explanation: string | null;
  position: number;
  options: AdminQuizOption[];
}

export type AdminQuizQuestionInput = Omit<AdminQuizQuestion, "id" | "quizId">;

export interface AdminQuiz {
  id: number;
  classSessionId: number;
  passingPercentage: number;
  maxAttempts: number | null;
  questions: AdminQuizQuestion[];
}

export interface AdminQuizAttempt {
  id: number;
  studentId: string;
  studentName: string;
  score: number | null;
  totalPossible: number | null;
  percentage: number | null;
  passed: boolean | null;
  startedAt: string;
  submittedAt: string | null;
}

export type AssignmentSubmissionStatus = "SUBMITTED" | "UNDER_REVIEW" | "REVIEWED" | "NEEDS_RESUBMISSION";

export interface AdminAssignment {
  id: number;
  classSessionId: number;
  title: string;
  learningObjective: string | null;
  instructions: string | null;
  tasks: string | null;
  submissionRequirements: string | null;
  maxScore: number;
  dueAt: string | null;
  rubric: string | null;
  allowedAttachmentTypes: string | null;
}

export type AdminAssignmentInput = Omit<AdminAssignment, "id" | "classSessionId">;

export interface AdminSubmission {
  id: number;
  studentId: string;
  studentName: string;
  responseText: string | null;
  attachmentUrl: string | null;
  attachmentFilename: string | null;
  status: AssignmentSubmissionStatus;
  submittedAt: string;
  score: number | null;
  feedback: string | null;
  reviewedAt: string | null;
}

export type AttendanceStatus = "PRESENT" | "ABSENT";

export interface AdminAttendanceRow {
  studentId: number;
  studentCode: string;
  studentName: string;
  status: AttendanceStatus | null;
  checkInTime: string | null;
  checkOutTime: string | null;
  notes: string | null;
}

export interface AttendanceEntry {
  studentId: number;
  status: AttendanceStatus;
  checkInTime: string | null;
  checkOutTime: string | null;
  notes: string | null;
}

export interface CourseCompletionCriteria {
  courseId: number;
  requireAllClassesCompleted: boolean;
  requireAllQuizzesPassed: boolean;
  requireAllAssignmentsReviewed: boolean;
  minAttendancePercentage: number | null;
}

export type CourseCompletionCriteriaInput = Omit<CourseCompletionCriteria, "courseId">;

export interface AdminCertificate {
  studentCode: string;
  studentName: string;
  verificationId: string;
  completionDate: string;
  issuedAt: string;
}
