import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  adminCreateModule,
  adminCreateTopic,
  adminDeleteModule,
  adminDeleteTopic,
  adminGetModules,
  adminReorderModules,
  adminReorderTopics,
  adminUpdateModule,
  adminUpdateTopic,
} from "../../api/admin/modules";
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
