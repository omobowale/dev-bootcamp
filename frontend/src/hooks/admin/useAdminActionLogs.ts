import { useQuery } from "@tanstack/react-query";
import { adminGetActionLogs, type AdminActionLogFilters } from "../../api/admin/actionLogs";
import { QUERY_KEYS } from "../../constants/queryKeys";

export function useAdminActionLogs(filters: AdminActionLogFilters) {
  return useQuery({
    queryKey: QUERY_KEYS.admin.actionLogs.list(filters),
    queryFn: () => adminGetActionLogs(filters),
  });
}
