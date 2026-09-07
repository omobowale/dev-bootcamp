import { useQuery } from "@tanstack/react-query";
import { getPrivateTutorialOptions } from "../api/courses";
import { QUERY_KEYS } from "../constants/queryKeys";

export function usePrivateTutorialOptions() {
  return useQuery({
    queryKey: QUERY_KEYS.courses.privateTutorials,
    queryFn: getPrivateTutorialOptions,
  });
}
