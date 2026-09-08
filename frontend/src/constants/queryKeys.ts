import type { AdminRegistrationFilters } from "../api/admin/registrations";

export const QUERY_KEYS = {
  courses: {
    all: ["courses"] as const,
    list: (level?: string) => ["courses", "list", level ?? "all"] as const,
    detail: (slug: string) => ["courses", "detail", slug] as const,
    cohorts: (courseId: number) => ["courses", courseId, "cohorts"] as const,
    privateTutorials: ["courses", "private-tutorials"] as const,
  },
  faqs: {
    global: ["faqs", "global"] as const,
  },
  settings: {
    terms: ["settings", "terms"] as const,
  },
  student: {
    me: ["student", "me"] as const,
    enrollments: ["student", "enrollments"] as const,
    classesForCourse: (courseId: number) => ["student", "courses", courseId, "classes"] as const,
    classDetail: (classSessionId: number) => ["student", "classes", classSessionId] as const,
    quizAttemptResult: (attemptId: number) => ["student", "quiz-attempts", attemptId] as const,
    progress: (courseId: number) => ["student", "courses", courseId, "progress"] as const,
  },
  admin: {
    courses: {
      all: ["admin", "courses"] as const,
      detail: (id: number) => ["admin", "courses", id] as const,
    },
    modules: {
      byCourse: (courseId: number) => ["admin", "courses", courseId, "modules"] as const,
    },
    classSessions: {
      detail: (id: number) => ["admin", "class-sessions", id] as const,
    },
    quizzes: {
      byClassSession: (classSessionId: number) => ["admin", "class-sessions", classSessionId, "quiz"] as const,
      attempts: (quizId: number) => ["admin", "quizzes", quizId, "attempts"] as const,
    },
    assignments: {
      byClassSession: (classSessionId: number) => ["admin", "class-sessions", classSessionId, "assignment"] as const,
      submissions: (assignmentId: number) => ["admin", "assignments", assignmentId, "submissions"] as const,
    },
    attendance: {
      byClassSession: (classSessionId: number) => ["admin", "class-sessions", classSessionId, "attendance"] as const,
    },
    completionCriteria: {
      byCourse: (courseId: number) => ["admin", "courses", courseId, "completion-criteria"] as const,
    },
    cohorts: {
      all: ["admin", "cohorts"] as const,
    },
    registrations: {
      all: ["admin", "registrations"] as const,
      list: (filters: AdminRegistrationFilters) => ["admin", "registrations", "list", filters] as const,
      detail: (id: number) => ["admin", "registrations", id] as const,
      activity: (id: number) => ["admin", "registrations", id, "activity"] as const,
    },
    dashboard: ["admin", "dashboard"] as const,
    faqs: {
      global: ["admin", "faqs", "global"] as const,
      byCourse: (courseId: number) => ["admin", "faqs", "course", courseId] as const,
    },
    settings: {
      terms: ["admin", "settings", "terms"] as const,
    },
    students: {
      all: ["admin", "students"] as const,
    },
  },
};
