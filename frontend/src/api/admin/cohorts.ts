import { apiClient } from "../client";
import type { AdminCohort, AdminCohortInput } from "../../types/admin";

export async function adminGetCohorts(): Promise<AdminCohort[]> {
  const response = await apiClient.get<AdminCohort[]>("/api/admin/cohorts");
  return response.data;
}

export async function adminCreateCohort(courseId: number, input: AdminCohortInput): Promise<AdminCohort> {
  const response = await apiClient.post<AdminCohort>(`/api/admin/cohorts?courseId=${courseId}`, input);
  return response.data;
}

export async function adminUpdateCohort(id: number, input: AdminCohortInput): Promise<AdminCohort> {
  const response = await apiClient.put<AdminCohort>(`/api/admin/cohorts/${id}`, input);
  return response.data;
}

export async function adminArchiveCohort(id: number): Promise<void> {
  await apiClient.delete(`/api/admin/cohorts/${id}`);
}
