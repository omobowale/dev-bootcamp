export type CohortStatus = "OPEN" | "CLOSED" | "FULL";

export interface Cohort {
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
  status: CohortStatus;
  privateTutorial: boolean;
}
