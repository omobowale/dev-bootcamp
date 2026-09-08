import { useMutation, useQueryClient } from "@tanstack/react-query";
import { submitAssignment } from "../../api/student/assignments";

export function useSubmitAssignment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (vars: { assignmentId: number; responseText: string; attachment: File | null }) =>
      submitAssignment(vars.assignmentId, vars.responseText, vars.attachment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["student", "classes"] });
    },
  });
}
