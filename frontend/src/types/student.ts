export interface StudentMe {
  studentId: string;
  fullName: string;
  email: string;
}

export interface StudentEnrollment {
  courseId: number;
  courseTitle: string;
  courseSlug: string;
  courseImage: string | null;
  cohortId: number;
  cohortName: string;
  privateTutorial: boolean;
  enrolledAt: string;
}

export interface Certificate {
  verificationId: string;
  studentName: string;
  studentCode: string;
  courseTitle: string;
  completionDate: string;
}

export interface AdminStudent {
  id: number;
  studentId: string;
  fullName: string;
  email: string;
  status: "INVITED" | "ACTIVE";
  enrolledCourseTitles: string[];
  createdAt: string;
}

export interface StudentClassListItem {
  id: number;
  moduleId: number;
  moduleTitle: string;
  title: string;
  position: number;
  scheduledAt: string | null;
}

export interface StudentLessonSection {
  title: string;
  body: string | null;
}

export interface StudentQuizSummary {
  quizId: number;
  passingPercentage: number;
  maxAttempts: number | null;
  questionCount: number;
  attemptsUsed: number;
  bestPercentage: number | null;
  bestPassed: boolean | null;
  canAttempt: boolean;
}

export type AssignmentSubmissionStatus = "SUBMITTED" | "UNDER_REVIEW" | "REVIEWED" | "NEEDS_RESUBMISSION";

export interface StudentSubmission {
  responseText: string | null;
  attachmentUrl: string | null;
  attachmentFilename: string | null;
  status: AssignmentSubmissionStatus;
  submittedAt: string;
  score: number | null;
  feedback: string | null;
  reviewedAt: string | null;
}

export interface StudentAssignment {
  id: number;
  title: string;
  learningObjective: string | null;
  instructions: string | null;
  tasks: string | null;
  submissionRequirements: string | null;
  maxScore: number;
  dueAt: string | null;
  rubric: string | null;
  allowedAttachmentTypes: string | null;
  mySubmission: StudentSubmission | null;
}

export interface StudentClassSession {
  id: number;
  title: string;
  objectives: string | null;
  scheduledAt: string | null;
  meetingLink: string | null;
  recordingUrl: string | null;
  sections: StudentLessonSection[];
  quiz: StudentQuizSummary | null;
  assignment: StudentAssignment | null;
  completed: boolean;
}

export interface CourseProgress {
  classesTotal: number;
  classesCompleted: number;
  quizzesTotal: number;
  quizzesPassed: number;
  assignmentsTotal: number;
  assignmentsSubmitted: number;
  assignmentsReviewed: number;
  attendanceTotal: number | null;
  attendancePresent: number | null;
  overallPercentage: number;
  courseComplete: boolean;
}

export interface StudentQuizOption {
  position: number;
  text: string;
}

export interface StudentQuizQuestion {
  id: number;
  text: string;
  points: number;
  options: StudentQuizOption[];
}

export interface QuizAnswerSubmission {
  questionId: number;
  selectedOptionPosition: number | null;
}

export interface StartQuizAttempt {
  attemptId: number;
  quizId: number;
  passingPercentage: number;
  questions: StudentQuizQuestion[];
}

export interface QuizAnswerResult {
  questionId: number;
  text: string;
  points: number;
  explanation: string | null;
  options: RevealedQuizOption[];
  selectedOptionPosition: number | null;
  correct: boolean;
}

export interface RevealedQuizOption {
  text: string;
  correct: boolean;
}

export interface QuizAttemptResult {
  attemptId: number;
  score: number;
  totalPossible: number;
  percentage: number;
  passed: boolean;
  passingPercentage: number;
  answers: QuizAnswerResult[];
}
