import { useMutation, useQueryClient } from "@tanstack/react-query";
import { submitAssignment } from "../../api/student/assignments";

export function useSubmitAssignment() {
  const queryClient = useQueryClient();
  return useMutation({
    meta: { notify: true },
    mutationFn: (vars: { onUploadProgress?: (percent: number) => void; version?: number; assignmentId: number; responseText: string; attachment: File | null }) =>
      submitAssignment(vars.assignmentId, vars.responseText, vars.attachment, vars.version, vars.onUploadProgress),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["student"] });
    },
  });
}
