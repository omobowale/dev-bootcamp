import { apiClient } from "./client";
import type { Faq } from "../types/course";

export async function getGlobalFaqs(): Promise<Faq[]> {
  const response = await apiClient.get<Faq[]>("/api/faqs");
  return response.data;
}
