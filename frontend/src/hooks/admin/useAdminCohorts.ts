import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminArchiveCohort, adminCreateCohort, adminGetCohorts, adminUpdateCohort } from "../../api/admin/cohorts";
import { QUERY_KEYS } from "../../constants/queryKeys";
import type { AdminCohortInput } from "../../types/admin";

export function useAdminCohorts() {
  return useQuery({
    queryKey: QUERY_KEYS.admin.cohorts.all,
    queryFn: adminGetCohorts,
  });
}

function useInvalidateCohorts() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.admin.cohorts.all });
}

export function useCreateCohort() {
  const invalidate = useInvalidateCohorts();
  return useMutation({
    meta: { notify: true },
    mutationFn: (vars: { courseId: number; input: AdminCohortInput }) =>
      adminCreateCohort(vars.courseId, vars.input),
    onSuccess: invalidate,
  });
}

export function useUpdateCohort() {
  const invalidate = useInvalidateCohorts();
  return useMutation({
    meta: { notify: true },
    mutationFn: (vars: { id: number; input: AdminCohortInput }) => adminUpdateCohort(vars.id, vars.input),
    onSuccess: invalidate,
  });
}

export function useArchiveCohort() {
  const invalidate = useInvalidateCohorts();
  return useMutation({
    meta: { notify: true },
    mutationFn: (id: number) => adminArchiveCohort(id),
    onSuccess: invalidate,
  });
}
