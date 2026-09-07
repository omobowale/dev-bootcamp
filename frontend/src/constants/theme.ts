export const THEME_STORAGE_KEY = "theme_preference";

export const THEME_OPTIONS = ["light", "dark", "system"] as const;

export type ThemePreference = (typeof THEME_OPTIONS)[number];
export type ResolvedTheme = "light" | "dark";
