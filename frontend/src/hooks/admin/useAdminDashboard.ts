import { useQuery } from "@tanstack/react-query";
import { adminGetDashboard } from "../../api/admin/dashboard";
import { QUERY_KEYS } from "../../constants/queryKeys";

export function useAdminDashboard() {
  return useQuery({
    queryKey: QUERY_KEYS.admin.dashboard,
    queryFn: adminGetDashboard,
  });
}
