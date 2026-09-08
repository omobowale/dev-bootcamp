import { apiClient } from "../client";
import type { AdminCourseMaterial, MaterialMetaInput } from "../../types/admin";

export async function adminGetMaterials(classSessionId: number): Promise<AdminCourseMaterial[]> {
  const response = await apiClient.get<AdminCourseMaterial[]>(`/api/admin/class-sessions/${classSessionId}/materials`);
  return response.data;
}

export async function adminUploadMaterial(
  classSessionId: number,
  title: string,
  description: string,
  file: File,
): Promise<AdminCourseMaterial> {
  const form = new FormData();
  form.append("title", title);
  if (description) form.append("description", description);
  form.append("file", file);

  const response = await apiClient.post<AdminCourseMaterial>(
    `/api/admin/class-sessions/${classSessionId}/materials`,
    form,
    { headers: { "Content-Type": "multipart/form-data" } },
  );
  return response.data;
}

export async function adminUpdateMaterial(id: number, input: MaterialMetaInput): Promise<AdminCourseMaterial> {
  const response = await apiClient.put<AdminCourseMaterial>(`/api/admin/materials/${id}`, input);
  return response.data;
}

export async function adminDeleteMaterial(id: number): Promise<void> {
  await apiClient.delete(`/api/admin/materials/${id}`);
}

export async function adminReorderMaterials(
  classSessionId: number,
  orderedMaterialIds: number[],
): Promise<AdminCourseMaterial[]> {
  const response = await apiClient.put<AdminCourseMaterial[]>(
    `/api/admin/class-sessions/${classSessionId}/materials/reorder`,
    orderedMaterialIds,
  );
  return response.data;
}
