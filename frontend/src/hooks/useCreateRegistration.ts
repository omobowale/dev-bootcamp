import { useMutation } from "@tanstack/react-query";
import { createRegistration } from "../api/registrations";

export function useCreateRegistration() {
  return useMutation({
    mutationFn: createRegistration,
  });
}
