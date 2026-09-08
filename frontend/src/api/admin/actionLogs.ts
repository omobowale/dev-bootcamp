import { apiClient } from "../client";
import type { AdminActionLog, PagedResponse } from "../../types/admin";

export interface AdminActionLogFilters {
  entityType?: string;
  search?: string;
  page?: number;
  size?: number;
}

export async function adminGetActionLogs(filters: AdminActionLogFilters): Promise<PagedResponse<AdminActionLog>> {
  const response = await apiClient.get<PagedResponse<AdminActionLog>>("/api/admin/action-logs", {
    params: {
      entityType: filters.entityType || undefined,
      search: filters.search || undefined,
      page: filters.page ?? 0,
      size: filters.size ?? 30,
    },
  });
  return response.data;
}
