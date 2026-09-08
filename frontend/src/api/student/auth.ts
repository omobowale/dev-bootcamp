import { apiClient } from "../client";

export interface StudentLoginResponse {
  token: string;
  email: string;
  name: string;
  role: string;
}

export async function studentLogin(email: string, password: string): Promise<StudentLoginResponse> {
  const response = await apiClient.post<StudentLoginResponse>("/api/student/auth/login", { email, password });
  return response.data;
}

export async function acceptStudentInvite(token: string, password: string): Promise<StudentLoginResponse> {
  const response = await apiClient.post<StudentLoginResponse>("/api/student/auth/invite/accept", { token, password });
  return response.data;
}
