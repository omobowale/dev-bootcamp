import { apiClient } from "../client";
import type { StudentEnrollment, StudentMe } from "../../types/student";

export async function getStudentMe(): Promise<StudentMe> {
  const response = await apiClient.get<StudentMe>("/api/student/me");
  return response.data;
}

export async function getStudentEnrollments(): Promise<StudentEnrollment[]> {
  const response = await apiClient.get<StudentEnrollment[]>("/api/student/enrollments");
  return response.data;
}
