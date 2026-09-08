import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  adminArchiveCourse,
  adminCreateCourse,
  adminGetCertificates,
  adminGetCompletionCriteria,
  adminGetCourse,
  adminGetCourses,
  adminUpdateCompletionCriteria,
  adminUpdateCourse,
} from "../../api/admin/courses";
import { QUERY_KEYS } from "../../constants/queryKeys";
import type { AdminCourseInput, CourseCompletionCriteriaInput } from "../../types/admin";

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

export function useCompletionCriteria(courseId: number) {
  return useQuery({
    queryKey: QUERY_KEYS.admin.completionCriteria.byCourse(courseId),
    queryFn: () => adminGetCompletionCriteria(courseId),
    enabled: courseId > 0,
  });
}

export function useUpdateCompletionCriteria(courseId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    meta: { notify: true },
    mutationFn: (input: CourseCompletionCriteriaInput) => adminUpdateCompletionCriteria(courseId, input),
    onSuccess: (data) => {
      queryClient.setQueryData(QUERY_KEYS.admin.completionCriteria.byCourse(courseId), data);
    },
  });
}

export function useAdminCertificates(courseId: number) {
  return useQuery({
    queryKey: QUERY_KEYS.admin.certificates.byCourse(courseId),
    queryFn: () => adminGetCertificates(courseId),
    enabled: courseId > 0,
  });
}
