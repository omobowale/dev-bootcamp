import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminGetTerms, adminUpdateTerms } from "../../api/admin/settings";
import { QUERY_KEYS } from "../../constants/queryKeys";

export function useAdminTerms() {
  return useQuery({
    queryKey: QUERY_KEYS.admin.settings.terms,
    queryFn: adminGetTerms,
  });
}

export function useUpdateTerms() {
  const queryClient = useQueryClient();
  return useMutation({
    meta: { notify: true },
    mutationFn: (content: string) => adminUpdateTerms(content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.admin.settings.terms });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.settings.terms });
    },
  });
}
