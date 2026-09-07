import { useQuery } from "@tanstack/react-query";
import { getCourses } from "../api/courses";
import { QUERY_KEYS } from "../constants/queryKeys";

export function useCourses(level?: string) {
  return useQuery({
    queryKey: QUERY_KEYS.courses.list(level),
    queryFn: () => getCourses(level),
  });
}
