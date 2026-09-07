import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  adminArchiveCourse,
  adminCreateCourse,
  adminGetCourse,
  adminGetCourses,
  adminUpdateCourse,
} from "../../api/admin/courses";
import { QUERY_KEYS } from "../../constants/queryKeys";
import type { AdminCourseInput } from "../../types/admin";

export function useAdminCourses() {
  return useQuery({
    queryKey: QUERY_KEYS.admin.courses.all,
    queryFn: adminGetCourses,
  });
}

export function useAdminCourse(id: number | undefined) {
  return useQuery({
    queryKey: QUERY_KEYS.admin.courses.detail(id ?? -1),
    queryFn: () => adminGetCourse(id as number),
    enabled: id !== undefined,
  });
}

export function useCreateCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    meta: { notify: true },
    mutationFn: (input: AdminCourseInput) => adminCreateCourse(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.admin.courses.all }),
  });
}

export function useUpdateCourse(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    meta: { notify: true },
    mutationFn: (input: AdminCourseInput) => adminUpdateCourse(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.admin.courses.all });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.admin.courses.detail(id) });
    },
  });
}

export function useArchiveCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    meta: { notify: true },
    mutationFn: (id: number) => adminArchiveCourse(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.admin.courses.all }),
  });
}
