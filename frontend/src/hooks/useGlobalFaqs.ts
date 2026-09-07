import { useQuery } from "@tanstack/react-query";
import { getGlobalFaqs } from "../api/faqs";
import { QUERY_KEYS } from "../constants/queryKeys";

export function useGlobalFaqs() {
  return useQuery({
    queryKey: QUERY_KEYS.faqs.global,
    queryFn: getGlobalFaqs,
  });
}
