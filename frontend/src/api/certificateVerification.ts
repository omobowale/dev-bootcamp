import { apiClient } from "./client";

export interface VerifiedCertificate {
  verificationId: string;
  studentName: string;
  courseTitle: string;
  completionDate: string;
}

export async function verifyCertificate(verificationId: string): Promise<VerifiedCertificate> {
  const response = await apiClient.get<VerifiedCertificate>(
    `/api/certificates/verify/${encodeURIComponent(verificationId)}`,
  );
  return response.data;
}
