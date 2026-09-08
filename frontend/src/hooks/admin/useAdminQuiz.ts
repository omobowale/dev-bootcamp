import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  adminCreateQuiz,
  adminCreateQuizQuestion,
  adminDeleteQuizQuestion,
  adminGetQuiz,
  adminGetQuizAttempts,
  adminReorderQuizQuestions,
  adminUpdateQuizQuestion,
  adminUpdateQuizSettings,
} from "../../api/admin/quizzes";
import type { AdminQuizQuestionInput } from "../../types/admin";
import { QUERY_KEYS } from "../../constants/queryKeys";

export function useAdminQuiz(classSessionId: number) {
  return useQuery({
    queryKey: QUERY_KEYS.admin.quizzes.byClassSession(classSessionId),
    queryFn: () => adminGetQuiz(classSessionId),
    enabled: classSessionId > 0,
  });
}

function useInvalidateQuiz(classSessionId: number) {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.admin.quizzes.byClassSession(classSessionId) });
}

export function useCreateQuiz(classSessionId: number) {
  const invalidate = useInvalidateQuiz(classSessionId);
  return useMutation({
    meta: { notify: true },
    mutationFn: () => adminCreateQuiz(classSessionId),
    onSuccess: invalidate,
  });
}

export function useUpdateQuizSettings(classSessionId: number) {
  const invalidate = useInvalidateQuiz(classSessionId);
  return useMutation({
    meta: { notify: true },
    mutationFn: (vars: { quizId: number; input: { passingPercentage: number; maxAttempts: number | null } }) =>
      adminUpdateQuizSettings(vars.quizId, vars.input),
    onSuccess: invalidate,
  });
}

export function useCreateQuizQuestion(classSessionId: number) {
  const invalidate = useInvalidateQuiz(classSessionId);
  return useMutation({
    meta: { notify: true },
    mutationFn: (vars: { quizId: number; input: AdminQuizQuestionInput }) =>
      adminCreateQuizQuestion(vars.quizId, vars.input),
    onSuccess: invalidate,
  });
}

export function useUpdateQuizQuestion(classSessionId: number) {
  const invalidate = useInvalidateQuiz(classSessionId);
  return useMutation({
    meta: { notify: true },
    mutationFn: (vars: { id: number; input: AdminQuizQuestionInput }) =>
      adminUpdateQuizQuestion(vars.id, vars.input),
    onSuccess: invalidate,
  });
}

export function useDeleteQuizQuestion(classSessionId: number) {
  const invalidate = useInvalidateQuiz(classSessionId);
  return useMutation({
    meta: { notify: true },
    mutationFn: (id: number) => adminDeleteQuizQuestion(id),
    onSuccess: invalidate,
  });
}

export function useReorderQuizQuestions(classSessionId: number) {
  const invalidate = useInvalidateQuiz(classSessionId);
  return useMutation({
    meta: { notify: true },
    mutationFn: (vars: { quizId: number; orderedQuestionIds: number[] }) =>
      adminReorderQuizQuestions(vars.quizId, vars.orderedQuestionIds),
    onSuccess: invalidate,
  });
}

export function useAdminQuizAttempts(quizId: number) {
  return useQuery({
    queryKey: QUERY_KEYS.admin.quizzes.attempts(quizId),
    queryFn: () => adminGetQuizAttempts(quizId),
    enabled: quizId > 0,
  });
}
