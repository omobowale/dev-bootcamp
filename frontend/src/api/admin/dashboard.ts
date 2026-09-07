import { apiClient } from "../client";
import type { DashboardMetrics } from "../../types/admin";

export async function adminGetDashboard(): Promise<DashboardMetrics> {
  const response = await apiClient.get<DashboardMetrics>("/api/admin/dashboard");
  return response.data;
}
