import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getCourseProgress, markClassComplete } from "../../api/student/progress";
import { QUERY_KEYS } from "../../constants/queryKeys";

export function useCourseProgress(courseId: number) {
  return useQuery({
    queryKey: QUERY_KEYS.student.progress(courseId),
    queryFn: () => getCourseProgress(courseId),
    enabled: courseId > 0,
  });
}

export function useMarkClassComplete() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (classSessionId: number) => markClassComplete(classSessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["student", "classes"] });
      queryClient.invalidateQueries({ queryKey: ["student", "courses"] });
    },
  });
}
