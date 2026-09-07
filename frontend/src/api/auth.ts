import { apiClient } from "./client";

export interface LoginResponse {
  token: string;
  email: string;
  name: string;
  role: string;
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  const response = await apiClient.post<LoginResponse>("/api/admin/login", { email, password });
  return response.data;
}
