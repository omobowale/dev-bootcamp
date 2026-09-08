import { apiClient } from "../client";
import type { AdminAssignment, AdminAssignmentInput, AdminSubmission } from "../../types/admin";

export async function adminGetAssignment(classSessionId: number): Promise<AdminAssignment | null> {
  // 204 No Content means this class doesn't have an assignment yet — the normal state for a
  // class that hasn't had one set up, not an error (see AdminAssignmentController).
  const response = await apiClient.get<AdminAssignment>(`/api/admin/class-sessions/${classSessionId}/assignment`);
  return response.status === 204 ? null : response.data;
}

export async function adminCreateAssignment(classSessionId: number): Promise<AdminAssignment> {
  const response = await apiClient.post<AdminAssignment>(`/api/admin/class-sessions/${classSessionId}/assignment`);
  return response.data;
}

export async function adminUpdateAssignment(id: number, input: AdminAssignmentInput): Promise<AdminAssignment> {
  const response = await apiClient.put<AdminAssignment>(`/api/admin/assignments/${id}`, input);
  return response.data;
}

export async function adminGetSubmissions(assignmentId: number): Promise<AdminSubmission[]> {
  const response = await apiClient.get<AdminSubmission[]>(`/api/admin/assignments/${assignmentId}/submissions`);
  return response.data;
}

export async function adminReviewSubmission(
  submissionId: number,
  input: { status: string; score: number | null; feedback: string | null },
): Promise<AdminSubmission> {
  const response = await apiClient.put<AdminSubmission>(
    `/api/admin/assignment-submissions/${submissionId}/review`,
    input,
  );
  return response.data;
}
