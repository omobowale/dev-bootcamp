import { apiClient } from "../client";
import type { StudentSubmission } from "../../types/student";

export async function submitAssignment(
  assignmentId: number,
  responseText: string,
  attachment: File | null,
): Promise<StudentSubmission> {
  const form = new FormData();
  if (responseText) form.append("responseText", responseText);
  if (attachment) form.append("attachment", attachment);

  const response = await apiClient.post<StudentSubmission>(
    `/api/student/assignments/${assignmentId}/submit`,
    form,
    { headers: { "Content-Type": "multipart/form-data" } },
  );
  return response.data;
}
