import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getQuizAttemptResult, startQuizAttempt, submitQuizAttempt } from "../../api/student/quizzes";
import type { QuizAnswerSubmission } from "../../types/student";
import { QUERY_KEYS } from "../../constants/queryKeys";

export function useStartQuizAttempt() {
  return useMutation({
    mutationFn: (quizId: number) => startQuizAttempt(quizId),
  });
}

export function useSubmitQuizAttempt() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (vars: { attemptId: number; answers: QuizAnswerSubmission[] }) =>
      submitQuizAttempt(vars.attemptId, vars.answers),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["student", "classes"] });
    },
  });
}

export function useQuizAttemptResult(attemptId: number) {
  return useQuery({
    queryKey: QUERY_KEYS.student.quizAttemptResult(attemptId),
    queryFn: () => getQuizAttemptResult(attemptId),
    enabled: attemptId > 0,
  });
}
