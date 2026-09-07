import { apiClient } from "./client";
import type { Cohort } from "../types/cohort";
import type { CourseDetail, CourseListItem, PrivateTutorialOption } from "../types/course";

export async function getCourses(level?: string): Promise<CourseListItem[]> {
  const response = await apiClient.get<CourseListItem[]>("/api/courses", {
    params: level ? { level } : undefined,
  });
  return response.data;
}

export async function getCourseBySlug(slug: string): Promise<CourseDetail> {
  const response = await apiClient.get<CourseDetail>(`/api/courses/${encodeURIComponent(slug)}`);
  return response.data;
}

export async function getCourseCohorts(courseId: number): Promise<Cohort[]> {
  const response = await apiClient.get<Cohort[]>(`/api/courses/${courseId}/cohorts`);
  return response.data;
}

export async function getPrivateTutorialOptions(): Promise<PrivateTutorialOption[]> {
  const response = await apiClient.get<PrivateTutorialOption[]>("/api/courses/private-tutorials");
  return response.data;
}
