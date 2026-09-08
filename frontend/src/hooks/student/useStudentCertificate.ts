import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getMyCertificate, issueMyCertificate } from "../../api/student/certificate";
import { QUERY_KEYS } from "../../constants/queryKeys";

export function useMyCertificate(courseId: number) {
  return useQuery({
    queryKey: QUERY_KEYS.student.certificate(courseId),
    queryFn: () => getMyCertificate(courseId),
    enabled: courseId > 0,
  });
}

export function useIssueCertificate(courseId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => issueMyCertificate(courseId),
    onSuccess: (data) => {
      queryClient.setQueryData(QUERY_KEYS.student.certificate(courseId), data);
    },
  });
}
