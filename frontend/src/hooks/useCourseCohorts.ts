import { useQuery } from "@tanstack/react-query";
import { getCourseCohorts } from "../api/courses";
import { QUERY_KEYS } from "../constants/queryKeys";

export function useCourseCohorts(courseId: number | undefined) {
  return useQuery({
    queryKey: QUERY_KEYS.courses.cohorts(courseId ?? -1),
    queryFn: () => getCourseCohorts(courseId as number),
    enabled: Boolean(courseId),
  });
}
