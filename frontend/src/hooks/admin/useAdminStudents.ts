import { useQuery } from "@tanstack/react-query";
import { adminGetStudents } from "../../api/admin/students";
import { QUERY_KEYS } from "../../constants/queryKeys";

export function useAdminStudents() {
  return useQuery({
    queryKey: QUERY_KEYS.admin.students.all,
    queryFn: adminGetStudents,
  });
}
