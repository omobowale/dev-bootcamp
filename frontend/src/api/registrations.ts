import { apiClient } from "./client";
import type { RegistrationRequest, RegistrationResponse } from "../types/registration";

export async function createRegistration(payload: RegistrationRequest): Promise<RegistrationResponse> {
  const response = await apiClient.post<RegistrationResponse>("/api/registrations", payload);
  return response.data;
}
