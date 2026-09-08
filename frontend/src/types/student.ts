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
