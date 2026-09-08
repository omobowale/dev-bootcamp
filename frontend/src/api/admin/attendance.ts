import { apiClient } from "../client";
import type { AdminAttendanceRow, AttendanceEntry } from "../../types/admin";

export async function adminGetAttendance(classSessionId: number): Promise<AdminAttendanceRow[]> {
  const response = await apiClient.get<AdminAttendanceRow[]>(`/api/admin/class-sessions/${classSessionId}/attendance`);
  return response.data;
}

export async function adminSaveAttendance(
  classSessionId: number,
  entries: AttendanceEntry[],
): Promise<AdminAttendanceRow[]> {
  const response = await apiClient.put<AdminAttendanceRow[]>(
    `/api/admin/class-sessions/${classSessionId}/attendance`,
    { entries },
  );
  return response.data;
}
