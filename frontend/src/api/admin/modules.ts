import { apiClient } from "../client";
import type { AdminClassSession, AdminClassSessionInput, AdminModule, AdminTopic } from "../../types/admin";

export async function adminGetModules(courseId: number): Promise<AdminModule[]> {
  const response = await apiClient.get<AdminModule[]>(`/api/admin/courses/${courseId}/modules`);
  return response.data;
}

export async function adminCreateModule(
  courseId: number,
  input: { title: string; description: string | null; position: number },
): Promise<AdminModule> {
  const response = await apiClient.post<AdminModule>(`/api/admin/courses/${courseId}/modules`, input);
  return response.data;
}

export async function adminUpdateModule(
  moduleId: number,
  input: { title: string; description: string | null; position: number },
): Promise<AdminModule> {
  const response = await apiClient.put<AdminModule>(`/api/admin/modules/${moduleId}`, input);
  return response.data;
}

export async function adminDeleteModule(moduleId: number): Promise<void> {
  await apiClient.delete(`/api/admin/modules/${moduleId}`);
}

export async function adminReorderModules(courseId: number, orderedModuleIds: number[]): Promise<AdminModule[]> {
  const response = await apiClient.put<AdminModule[]>(
    `/api/admin/courses/${courseId}/modules/reorder`,
    orderedModuleIds,
  );
  return response.data;
}

export async function adminCreateTopic(moduleId: number, input: { title: string; position: number }): Promise<AdminTopic> {
  const response = await apiClient.post<AdminTopic>(`/api/admin/modules/${moduleId}/topics`, input);
  return response.data;
}

export async function adminUpdateTopic(
  topicId: number,
  input: { title: string; position: number },
): Promise<AdminTopic> {
  const response = await apiClient.put<AdminTopic>(`/api/admin/topics/${topicId}`, input);
  return response.data;
}

export async function adminDeleteTopic(topicId: number): Promise<void> {
  await apiClient.delete(`/api/admin/topics/${topicId}`);
}

export async function adminReorderTopics(moduleId: number, orderedTopicIds: number[]): Promise<AdminTopic[]> {
  const response = await apiClient.put<AdminTopic[]>(`/api/admin/modules/${moduleId}/topics/reorder`, orderedTopicIds);
  return response.data;
}

export async function adminGetClassSession(id: number): Promise<AdminClassSession> {
  const response = await apiClient.get<AdminClassSession>(`/api/admin/class-sessions/${id}`);
  return response.data;
}

export async function adminCreateClassSession(
  moduleId: number,
  input: AdminClassSessionInput,
): Promise<AdminClassSession> {
  const response = await apiClient.post<AdminClassSession>(`/api/admin/modules/${moduleId}/class-sessions`, input);
  return response.data;
}

export async function adminUpdateClassSession(
  id: number,
  input: AdminClassSessionInput,
): Promise<AdminClassSession> {
  const response = await apiClient.put<AdminClassSession>(`/api/admin/class-sessions/${id}`, input);
  return response.data;
}

export async function adminDeleteClassSession(id: number): Promise<void> {
  await apiClient.delete(`/api/admin/class-sessions/${id}`);
}

export async function adminReorderClassSessions(
  moduleId: number,
  orderedClassSessionIds: number[],
): Promise<AdminClassSession[]> {
  const response = await apiClient.put<AdminClassSession[]>(
    `/api/admin/modules/${moduleId}/class-sessions/reorder`,
    orderedClassSessionIds,
  );
  return response.data;
}
