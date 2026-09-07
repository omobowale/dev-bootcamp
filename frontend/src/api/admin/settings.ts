import { apiClient } from "../client";
import type { TermsContent } from "../../types/settings";

export async function adminGetTerms(): Promise<TermsContent> {
  const response = await apiClient.get<TermsContent>("/api/admin/settings/terms");
  return response.data;
}

export async function adminUpdateTerms(content: string): Promise<TermsContent> {
  const response = await apiClient.put<TermsContent>("/api/admin/settings/terms", { content });
  return response.data;
}
