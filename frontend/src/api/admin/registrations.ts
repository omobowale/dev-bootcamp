import { apiClient } from "../client";
import type {
  AdminActionLog,
  AdminRegistrationDetail,
  AdminRegistrationListItem,
  ManualEnrollmentInput,
  PagedResponse,
  RegistrationStatus,
} from "../../types/admin";

export interface AdminRegistrationFilters {
  status?: RegistrationStatus | "";
  courseId?: number;
  cohortId?: number;
  search?: string;
  page?: number;
  size?: number;
}

export async function adminGetRegistrations(
  filters: AdminRegistrationFilters,
): Promise<PagedResponse<AdminRegistrationListItem>> {
  const response = await apiClient.get<PagedResponse<AdminRegistrationListItem>>("/api/admin/registrations", {
    params: {
      status: filters.status || undefined,
      courseId: filters.courseId,
      cohortId: filters.cohortId,
      search: filters.search || undefined,
      page: filters.page ?? 0,
      size: filters.size ?? 20,
    },
  });
  return response.data;
}

export async function adminGetRegistration(id: number): Promise<AdminRegistrationDetail> {
  const response = await apiClient.get<AdminRegistrationDetail>(`/api/admin/registrations/${id}`);
  return response.data;
}

export async function adminGetRegistrationActivity(id: number): Promise<AdminActionLog[]> {
  const response = await apiClient.get<AdminActionLog[]>(`/api/admin/registrations/${id}/activity`);
  return response.data;
}

export async function adminUpdateRegistrationStatus(
  id: number,
  status: RegistrationStatus,
): Promise<AdminRegistrationDetail> {
  const response = await apiClient.put<AdminRegistrationDetail>(`/api/admin/registrations/${id}/status`, { status });
  return response.data;
}

export async function adminCreateManualEnrollment(input: ManualEnrollmentInput): Promise<AdminRegistrationDetail> {
  const response = await apiClient.post<AdminRegistrationDetail>("/api/admin/registrations/manual", input);
  return response.data;
}
