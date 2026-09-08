import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  adminCreateAssignment,
  adminGetAssignment,
  adminGetSubmissions,
  adminReviewSubmission,
  adminUpdateAssignment,
} from "../../api/admin/assignments";
import type { AdminAssignmentInput, AssignmentSubmissionStatus } from "../../types/admin";
import { QUERY_KEYS } from "../../constants/queryKeys";

export function useAdminAssignment(classSessionId: number) {
  return useQuery({
    queryKey: QUERY_KEYS.admin.assignments.byClassSession(classSessionId),
    queryFn: () => adminGetAssignment(classSessionId),
    enabled: classSessionId > 0,
  });
}

function useInvalidateAssignment(classSessionId: number) {
  const queryClient = useQueryClient();
  return () =>
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.admin.assignments.byClassSession(classSessionId) });
}

export function useCreateAssignment(classSessionId: number) {
  const invalidate = useInvalidateAssignment(classSessionId);
  return useMutation({
    meta: { notify: true },
    mutationFn: () => adminCreateAssignment(classSessionId),
    onSuccess: invalidate,
  });
}

export function useUpdateAssignment(classSessionId: number) {
  const invalidate = useInvalidateAssignment(classSessionId);
  return useMutation({
    meta: { notify: true },
    mutationFn: (vars: { id: number; input: AdminAssignmentInput }) => adminUpdateAssignment(vars.id, vars.input),
    onSuccess: invalidate,
  });
}

export function useAdminSubmissions(assignmentId: number) {
  return useQuery({
    queryKey: QUERY_KEYS.admin.assignments.submissions(assignmentId),
    queryFn: () => adminGetSubmissions(assignmentId),
    enabled: assignmentId > 0,
  });
}

export function useReviewSubmission(assignmentId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    meta: { notify: true },
    mutationFn: (vars: { version: number; submissionId: number; status: AssignmentSubmissionStatus; score: number | null; feedback: string | null }) =>
      adminReviewSubmission(vars.submissionId, vars),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin","grading"] });
      return queryClient.invalidateQueries({ queryKey: QUERY_KEYS.admin.assignments.submissions(assignmentId) });
    },
  });
}
