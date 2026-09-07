import type { ExperienceLevel } from "../types/registration";

export const EXPERIENCE_LEVELS: { value: ExperienceLevel; label: string }[] = [
  { value: "BEGINNER", label: "Beginner" },
  { value: "INTERMEDIATE", label: "Intermediate" },
  { value: "ADVANCED", label: "Advanced" },
];

export const REFERRAL_SOURCES = [
  "WhatsApp",
  "Social media",
  "Friend or colleague referral",
  "Search engine",
  "Other",
] as const;

