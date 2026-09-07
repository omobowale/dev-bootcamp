import { apiClient } from "./client";
import type { TermsContent } from "../types/settings";

export async function getTerms(): Promise<TermsContent> {
  const response = await apiClient.get<TermsContent>("/api/settings/terms");
  return response.data;
}
