import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  adminCreateManualEnrollment,
  adminGetRegistration,
  adminGetRegistrationActivity,
  adminGetRegistrations,
  adminUpdateRegistrationStatus,
  type AdminRegistrationFilters,
} from "../../api/admin/registrations";
import { QUERY_KEYS } from "../../constants/queryKeys";
import type { ManualEnrollmentInput, RegistrationStatus } from "../../types/admin";

export function useAdminRegistrations(filters: AdminRegistrationFilters) {
  return useQuery({
    queryKey: QUERY_KEYS.admin.registrations.list(filters),
    queryFn: () => adminGetRegistrations(filters),
  });
}

export function useAdminRegistration(id: number | undefined) {
  return useQuery({
    queryKey: QUERY_KEYS.admin.registrations.detail(id ?? -1),
    queryFn: () => adminGetRegistration(id as number),
    enabled: id !== undefined,
  });
}

export function useAdminRegistrationActivity(id: number | undefined) {
  return useQuery({
    queryKey: QUERY_KEYS.admin.registrations.activity(id ?? -1),
    queryFn: () => adminGetRegistrationActivity(id as number),
    enabled: id !== undefined,
  });
}

export function useUpdateRegistrationStatus(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    meta: { notify: true },
    mutationFn: (status: RegistrationStatus) => adminUpdateRegistrationStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.admin.registrations.all });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.admin.registrations.activity(id) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.admin.dashboard });
    },
  });
}

export function useCreateManualEnrollment() {
  const queryClient = useQueryClient();
  return useMutation({
    meta: { notify: true },
    mutationFn: (input: ManualEnrollmentInput) => adminCreateManualEnrollment(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.admin.registrations.all });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.admin.students.all });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.admin.dashboard });
    },
  });
}
