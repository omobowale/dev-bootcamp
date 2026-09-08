import { apiClient } from "../client";
import type { AdminQuiz, AdminQuizAttempt, AdminQuizQuestion, AdminQuizQuestionInput } from "../../types/admin";

export async function adminGetQuiz(classSessionId: number): Promise<AdminQuiz | null> {
  // 204 No Content means this class doesn't have a quiz yet — the normal state for a class
  // that hasn't had one set up, not an error (see AdminQuizController).
  const response = await apiClient.get<AdminQuiz>(`/api/admin/class-sessions/${classSessionId}/quiz`);
  return response.status === 204 ? null : response.data;
}

export async function adminCreateQuiz(classSessionId: number): Promise<AdminQuiz> {
  const response = await apiClient.post<AdminQuiz>(`/api/admin/class-sessions/${classSessionId}/quiz`);
  return response.data;
}

export async function adminUpdateQuizSettings(
  quizId: number,
  input: { passingPercentage: number; maxAttempts: number | null },
): Promise<AdminQuiz> {
  const response = await apiClient.put<AdminQuiz>(`/api/admin/quizzes/${quizId}/settings`, input);
  return response.data;
}

export async function adminCreateQuizQuestion(
  quizId: number,
  input: AdminQuizQuestionInput,
): Promise<AdminQuizQuestion> {
  const response = await apiClient.post<AdminQuizQuestion>(`/api/admin/quizzes/${quizId}/questions`, input);
  return response.data;
}

export async function adminUpdateQuizQuestion(
  id: number,
  input: AdminQuizQuestionInput,
): Promise<AdminQuizQuestion> {
  const response = await apiClient.put<AdminQuizQuestion>(`/api/admin/quiz-questions/${id}`, input);
  return response.data;
}

export async function adminDeleteQuizQuestion(id: number): Promise<void> {
  await apiClient.delete(`/api/admin/quiz-questions/${id}`);
}

export async function adminReorderQuizQuestions(
  quizId: number,
  orderedQuestionIds: number[],
): Promise<AdminQuizQuestion[]> {
  const response = await apiClient.put<AdminQuizQuestion[]>(
    `/api/admin/quizzes/${quizId}/questions/reorder`,
    orderedQuestionIds,
  );
  return response.data;
}

export async function adminGetQuizAttempts(quizId: number): Promise<AdminQuizAttempt[]> {
  const response = await apiClient.get<AdminQuizAttempt[]>(`/api/admin/quizzes/${quizId}/attempts`);
  return response.data;
}
