import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  adminDeleteMaterial,
  adminGetMaterials,
  adminReorderMaterials,
  adminUpdateMaterial,
  adminUploadMaterial,
} from "../../api/admin/materials";
import type { MaterialMetaInput } from "../../types/admin";
import { QUERY_KEYS } from "../../constants/queryKeys";

export function useAdminMaterials(classSessionId: number) {
  return useQuery({
    queryKey: QUERY_KEYS.admin.materials.byClassSession(classSessionId),
    queryFn: () => adminGetMaterials(classSessionId),
    enabled: classSessionId > 0,
  });
}

export function useUploadMaterial(classSessionId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    meta: { notify: true },
    mutationFn: ({ title, description, file }: { title: string; description: string; file: File }) =>
      adminUploadMaterial(classSessionId, title, description, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.admin.materials.byClassSession(classSessionId) });
    },
  });
}

export function useUpdateMaterial(classSessionId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    meta: { notify: true },
    mutationFn: ({ id, input }: { id: number; input: MaterialMetaInput }) => adminUpdateMaterial(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.admin.materials.byClassSession(classSessionId) });
    },
  });
}

export function useDeleteMaterial(classSessionId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    meta: { notify: true },
    mutationFn: (id: number) => adminDeleteMaterial(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.admin.materials.byClassSession(classSessionId) });
    },
  });
}

export function useReorderMaterials(classSessionId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    meta: { notify: true },
    mutationFn: (orderedMaterialIds: number[]) => adminReorderMaterials(classSessionId, orderedMaterialIds),
    onSuccess: (data) => {
      queryClient.setQueryData(QUERY_KEYS.admin.materials.byClassSession(classSessionId), data);
    },
  });
}
