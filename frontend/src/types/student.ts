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

export interface StudentClassSession {
  id: number;
  title: string;
  objectives: string | null;
  scheduledAt: string | null;
  meetingLink: string | null;
  recordingUrl: string | null;
  sections: StudentLessonSection[];
}
