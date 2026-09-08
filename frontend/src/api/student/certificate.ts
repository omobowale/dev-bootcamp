import { apiClient } from "../client";
import type { Certificate } from "../../types/student";

export async function getMyCertificate(courseId: number): Promise<Certificate | null> {
  // 204 No Content means no certificate has been issued yet — the normal state before
  // completion, not an error (see StudentPortalController).
  const response = await apiClient.get<Certificate>(`/api/student/courses/${courseId}/certificate`);
  return response.status === 204 ? null : response.data;
}

export async function issueMyCertificate(courseId: number): Promise<Certificate> {
  const response = await apiClient.post<Certificate>(`/api/student/courses/${courseId}/certificate`);
  return response.data;
}
