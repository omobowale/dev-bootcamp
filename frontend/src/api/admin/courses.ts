import { apiClient } from "../client";
import type { AdminCourse, AdminCourseInput } from "../../types/admin";

export async function adminGetCourses(): Promise<AdminCourse[]> {
  const response = await apiClient.get<AdminCourse[]>("/api/admin/courses");
  return response.data;
}

export async function adminGetCourse(id: number): Promise<AdminCourse> {
  const response = await apiClient.get<AdminCourse>(`/api/admin/courses/${id}`);
  return response.data;
}

export async function adminCreateCourse(input: AdminCourseInput): Promise<AdminCourse> {
  const response = await apiClient.post<AdminCourse>("/api/admin/courses", input);
  return response.data;
}

export async function adminUpdateCourse(id: number, input: AdminCourseInput): Promise<AdminCourse> {
  const response = await apiClient.put<AdminCourse>(`/api/admin/courses/${id}`, input);
  return response.data;
}

export async function adminArchiveCourse(id: number): Promise<void> {
  await apiClient.delete(`/api/admin/courses/${id}`);
}
