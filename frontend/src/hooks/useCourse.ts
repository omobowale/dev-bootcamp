import { useQuery } from "@tanstack/react-query";
import { getCourseBySlug } from "../api/courses";
import { QUERY_KEYS } from "../constants/queryKeys";

export function useCourse(slug: string | undefined) {
  return useQuery({
    queryKey: QUERY_KEYS.courses.detail(slug ?? ""),
    queryFn: () => getCourseBySlug(slug as string),
    enabled: Boolean(slug),
  });
}
