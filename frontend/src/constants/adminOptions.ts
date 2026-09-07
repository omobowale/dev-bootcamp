import type { RegistrationStatus } from "../types/admin";

export const REGISTRATION_STATUSES: { value: RegistrationStatus; label: string }[] = [
  { value: "NEW", label: "New" },
  { value: "CONTACTED", label: "Contacted" },
  { value: "WHATSAPP_ADDED", label: "WhatsApp added" },
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "CANCELLED", label: "Cancelled" },
];

export const COHORT_STATUSES = ["OPEN", "CLOSED", "FULL"] as const;
