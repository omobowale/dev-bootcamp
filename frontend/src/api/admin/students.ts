import { apiClient } from "../client";
import type { AdminStudent } from "../../types/student";

export async function adminGetStudents(): Promise<AdminStudent[]> {
  const response = await apiClient.get<AdminStudent[]>("/api/admin/students");
  return response.data;
}
