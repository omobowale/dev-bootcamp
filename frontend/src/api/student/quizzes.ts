import { apiClient } from "../client";
import type { QuizAnswerSubmission, QuizAttemptResult, StartQuizAttempt } from "../../types/student";

export async function startQuizAttempt(quizId: number): Promise<StartQuizAttempt> {
  const response = await apiClient.post<StartQuizAttempt>(`/api/student/quizzes/${quizId}/attempts`);
  return response.data;
}

export async function submitQuizAttempt(
  attemptId: number,
  answers: QuizAnswerSubmission[],
): Promise<QuizAttemptResult> {
  const response = await apiClient.post<QuizAttemptResult>(`/api/student/quiz-attempts/${attemptId}/submit`, {
    answers,
  });
  return response.data;
}

export async function getQuizAttemptResult(attemptId: number): Promise<QuizAttemptResult> {
  const response = await apiClient.get<QuizAttemptResult>(`/api/student/quiz-attempts/${attemptId}`);
  return response.data;
}
