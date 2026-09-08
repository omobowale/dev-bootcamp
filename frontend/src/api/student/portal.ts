import { apiClient } from "../client";
import type { StudentClassListItem, StudentClassSession, StudentEnrollment, StudentMe } from "../../types/student";

export async function getStudentMe(): Promise<StudentMe> {
  const response = await apiClient.get<StudentMe>("/api/student/me");
  return response.data;
}

export async function getStudentEnrollments(): Promise<StudentEnrollment[]> {
  const response = await apiClient.get<StudentEnrollment[]>("/api/student/enrollments");
  return response.data;
}

export async function getStudentClassesForCourse(courseId: number, cohortId?: number): Promise<StudentClassListItem[]> {
  const response = await apiClient.get<StudentClassListItem[]>(`/api/student/courses/${courseId}/classes`, {params:{cohortId}});
  return response.data;
}

export async function getStudentClass(classSessionId: number): Promise<StudentClassSession> {
  const response = await apiClient.get<StudentClassSession>(`/api/student/classes/${classSessionId}`);
  return response.data;
}
