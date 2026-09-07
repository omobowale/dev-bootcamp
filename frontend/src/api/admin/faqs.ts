import { apiClient } from "../client";
import type { AdminFaq } from "../../types/admin";

export interface AdminFaqInput {
  courseId: number | null;
  question: string;
  answer: string;
  position: number;
}

export async function adminGetFaqs(courseId?: number): Promise<AdminFaq[]> {
  const response = await apiClient.get<AdminFaq[]>("/api/admin/faqs", {
    params: courseId ? { courseId } : undefined,
  });
  return response.data;
}

export async function adminCreateFaq(input: AdminFaqInput): Promise<AdminFaq> {
  const response = await apiClient.post<AdminFaq>("/api/admin/faqs", input);
  return response.data;
}

export async function adminUpdateFaq(id: number, input: AdminFaqInput): Promise<AdminFaq> {
  const response = await apiClient.put<AdminFaq>(`/api/admin/faqs/${id}`, input);
  return response.data;
}

export async function adminDeleteFaq(id: number): Promise<void> {
  await apiClient.delete(`/api/admin/faqs/${id}`);
}
