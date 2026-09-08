import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminGetAttendance, adminSaveAttendance } from "../../api/admin/attendance";
import type { AttendanceEntry } from "../../types/admin";
import { QUERY_KEYS } from "../../constants/queryKeys";

export function useAdminAttendance(classSessionId: number) {
  return useQuery({
    queryKey: QUERY_KEYS.admin.attendance.byClassSession(classSessionId),
    queryFn: () => adminGetAttendance(classSessionId),
    enabled: classSessionId > 0,
  });
}

export function useSaveAttendance(classSessionId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    meta: { notify: true },
    mutationFn: (entries: AttendanceEntry[]) => adminSaveAttendance(classSessionId, entries),
    onSuccess: (data) => {
      queryClient.setQueryData(QUERY_KEYS.admin.attendance.byClassSession(classSessionId), data);
    },
  });
}
