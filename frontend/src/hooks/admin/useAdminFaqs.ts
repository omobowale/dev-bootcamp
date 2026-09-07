import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminCreateFaq, adminDeleteFaq, adminGetFaqs, adminUpdateFaq, type AdminFaqInput } from "../../api/admin/faqs";
import { QUERY_KEYS } from "../../constants/queryKeys";

export function useAdminFaqs(courseId?: number) {
  return useQuery({
    queryKey: courseId ? QUERY_KEYS.admin.faqs.byCourse(courseId) : QUERY_KEYS.admin.faqs.global,
    queryFn: () => adminGetFaqs(courseId),
  });
}

function useInvalidateFaqs(courseId?: number) {
  const queryClient = useQueryClient();
  return () =>
    queryClient.invalidateQueries({
      queryKey: courseId ? QUERY_KEYS.admin.faqs.byCourse(courseId) : QUERY_KEYS.admin.faqs.global,
    });
}

export function useCreateFaq(courseId?: number) {
  const invalidate = useInvalidateFaqs(courseId);
  return useMutation({
    meta: { notify: true },
    mutationFn: (input: AdminFaqInput) => adminCreateFaq(input),
    onSuccess: invalidate,
  });
}

export function useUpdateFaq(courseId?: number) {
  const invalidate = useInvalidateFaqs(courseId);
  return useMutation({
    meta: { notify: true },
    mutationFn: (vars: { id: number; input: AdminFaqInput }) => adminUpdateFaq(vars.id, vars.input),
    onSuccess: invalidate,
  });
}

export function useDeleteFaq(courseId?: number) {
  const invalidate = useInvalidateFaqs(courseId);
  return useMutation({
    meta: { notify: true },
    mutationFn: (id: number) => adminDeleteFaq(id),
    onSuccess: invalidate,
  });
}
