import { useQuery } from "@tanstack/react-query";
import { getTerms } from "../api/settings";
import { QUERY_KEYS } from "../constants/queryKeys";

export function useTerms() {
  return useQuery({
    queryKey: QUERY_KEYS.settings.terms,
    queryFn: getTerms,
  });
}
