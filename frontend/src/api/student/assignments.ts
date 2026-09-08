import { apiClient } from "../client";
import type { StudentSubmission } from "../../types/student";

export async function submitAssignment(
  assignmentId: number,
  responseText: string,
  attachment: File | null,
  version?: number,
  onUploadProgress?: (percent: number) => void,
): Promise<StudentSubmission> {
  const form = new FormData();
  if (version !== undefined) form.append("version",String(version));
  if (responseText) form.append("responseText", responseText);
  if (attachment) form.append("attachment", attachment);

  const response = await apiClient.post<StudentSubmission>(
    `/api/student/assignments/${assignmentId}/submit`,
    form,
    { onUploadProgress: event => onUploadProgress?.(Math.round((event.progress ?? 0) * 100)) },
  );
  return response.data;
}
