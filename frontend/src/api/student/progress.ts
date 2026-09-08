import { apiClient } from "../client";
import type { CourseProgress } from "../../types/student";

export async function getCourseProgress(courseId: number, cohortId?:number): Promise<CourseProgress> {
  const response = await apiClient.get<CourseProgress>(`/api/student/courses/${courseId}/progress`, {params:{cohortId}});
  return response.data;
}

export async function markClassComplete(classSessionId: number): Promise<void> {
  await apiClient.post(`/api/student/classes/${classSessionId}/complete`);
}
