export const COURSE_LEVELS = ["Beginner", "Intermediate", "Advanced"] as const;

export type CourseLevelOption = (typeof COURSE_LEVELS)[number];
