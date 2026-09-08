import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  adminCreateClassSession,
  adminCreateModule,
  adminCreateTopic,
  adminDeleteClassSession,
  adminDeleteModule,
  adminDeleteTopic,
  adminGetClassSession,
  adminGetModules,
  adminReorderClassSessions,
  adminReorderModules,
  adminReorderTopics,
  adminUpdateClassSession,
  adminUpdateModule,
  adminUpdateTopic,
} from "../../api/admin/modules";
import type { AdminClassSessionInput } from "../../types/admin";
import { QUERY_KEYS } from "../../constants/queryKeys";

export function useAdminModules(courseId: number) {
  return useQuery({
    queryKey: QUERY_KEYS.admin.modules.byCourse(courseId),
    queryFn: () => adminGetModules(courseId),
  });
}

function useInvalidateModules(courseId: number) {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.admin.modules.byCourse(courseId) });
}

export function useCreateModule(courseId: number) {
  const invalidate = useInvalidateModules(courseId);
  return useMutation({
    meta: { notify: true },
    mutationFn: (input: { title: string; description: string | null; position: number }) =>
      adminCreateModule(courseId, input),
    onSuccess: invalidate,
  });
}

export function useUpdateModule(courseId: number) {
  const invalidate = useInvalidateModules(courseId);
  return useMutation({
    meta: { notify: true },
    mutationFn: (vars: { moduleId: number; input: { title: string; description: string | null; position: number } }) =>
      adminUpdateModule(vars.moduleId, vars.input),
    onSuccess: invalidate,
  });
}

export function useDeleteModule(courseId: number) {
  const invalidate = useInvalidateModules(courseId);
  return useMutation({
    meta: { notify: true },
    mutationFn: (moduleId: number) => adminDeleteModule(moduleId),
    onSuccess: invalidate,
  });
}

export function useReorderModules(courseId: number) {
  const invalidate = useInvalidateModules(courseId);
  return useMutation({
    meta: { notify: true },
    mutationFn: (orderedModuleIds: number[]) => adminReorderModules(courseId, orderedModuleIds),
    onSuccess: invalidate,
  });
}

export function useCreateTopic(courseId: number) {
  const invalidate = useInvalidateModules(courseId);
  return useMutation({
    meta: { notify: true },
    mutationFn: (vars: { moduleId: number; input: { title: string; position: number } }) =>
      adminCreateTopic(vars.moduleId, vars.input),
    onSuccess: invalidate,
  });
}

export function useUpdateTopic(courseId: number) {
  const invalidate = useInvalidateModules(courseId);
  return useMutation({
    meta: { notify: true },
    mutationFn: (vars: { topicId: number; input: { title: string; position: number } }) =>
      adminUpdateTopic(vars.topicId, vars.input),
    onSuccess: invalidate,
  });
}

export function useDeleteTopic(courseId: number) {
  const invalidate = useInvalidateModules(courseId);
  return useMutation({
    meta: { notify: true },
    mutationFn: (topicId: number) => adminDeleteTopic(topicId),
    onSuccess: invalidate,
  });
}

export function useReorderTopics(courseId: number) {
  const invalidate = useInvalidateModules(courseId);
  return useMutation({
    meta: { notify: true },
    mutationFn: (vars: { moduleId: number; orderedTopicIds: number[] }) =>
      adminReorderTopics(vars.moduleId, vars.orderedTopicIds),
    onSuccess: invalidate,
  });
}

export function useAdminClassSession(id: number) {
  return useQuery({
    queryKey: QUERY_KEYS.admin.classSessions.detail(id),
    queryFn: () => adminGetClassSession(id),
    enabled: id > 0,
  });
}

export function useCreateClassSession(courseId: number) {
  const invalidate = useInvalidateModules(courseId);
  return useMutation({
    meta: { notify: true },
    mutationFn: (vars: { moduleId: number; input: AdminClassSessionInput }) =>
      adminCreateClassSession(vars.moduleId, vars.input),
    onSuccess: invalidate,
  });
}

export function useUpdateClassSession(courseId: number) {
  const invalidate = useInvalidateModules(courseId);
  return useMutation({
    meta: { notify: true },
    mutationFn: (vars: { id: number; input: AdminClassSessionInput }) =>
      adminUpdateClassSession(vars.id, vars.input),
    onSuccess: invalidate,
  });
}

export function useDeleteClassSession(courseId: number) {
  const invalidate = useInvalidateModules(courseId);
  return useMutation({
    meta: { notify: true },
    mutationFn: (id: number) => adminDeleteClassSession(id),
    onSuccess: invalidate,
  });
}

export function useReorderClassSessions(courseId: number) {
  const invalidate = useInvalidateModules(courseId);
  return useMutation({
    meta: { notify: true },
    mutationFn: (vars: { moduleId: number; orderedClassSessionIds: number[] }) =>
      adminReorderClassSessions(vars.moduleId, vars.orderedClassSessionIds),
    onSuccess: invalidate,
  });
}
