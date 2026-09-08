export const ROUTES = {
  home: "/",
  courses: "/courses",
  courseDetail: "/courses/:slug",
  register: "/register",
  registrationSuccess: "/registration/success",
  about: "/about",
  terms: "/terms",
  privateTutorials: "/private-tutorials",
  adminLogin: "/admin/login",
  admin: "/admin",
  adminCourses: "/admin/courses",
  adminNewCourse: "/admin/courses/new",
  adminCohorts: "/admin/cohorts",
  adminRegistrations: "/admin/registrations",
  adminFaqs: "/admin/faqs",
  adminTerms: "/admin/settings/terms",
  adminStudents: "/admin/students",
  studentLogin: "/student/login",
  student: "/student",
  studentCourseClasses: "/student/courses/:courseId/classes",
  studentClassSessionDetail: "/student/classes/:classSessionId",
  adminClassSessionNew: "/admin/courses/:courseId/modules/:moduleId/classes/new",
  adminClassSessionEdit: "/admin/courses/:courseId/modules/:moduleId/classes/:classSessionId",
} as const;

export function adminCourseOutlinePath(courseId: number): string {
  return `/admin/courses/${courseId}/outline`;
}

export function adminClassSessionNewPath(courseId: number, moduleId: number): string {
  return `/admin/courses/${courseId}/modules/${moduleId}/classes/new`;
}

export function adminClassSessionEditPath(courseId: number, moduleId: number, classSessionId: number): string {
  return `/admin/courses/${courseId}/modules/${moduleId}/classes/${classSessionId}`;
}

export function studentCourseClassesPath(courseId: number): string {
  return `/student/courses/${courseId}/classes`;
}

export function studentClassSessionDetailPath(classSessionId: number): string {
  return `/student/classes/${classSessionId}`;
}

export function adminCourseEditPath(courseId: number): string {
  return `/admin/courses/${courseId}/edit`;
}

export function adminRegistrationDetailPath(id: number): string {
  return `/admin/registrations/${id}`;
}

export function courseDetailPath(slug: string): string {
  return `/courses/${slug}`;
}

export function registerPath(courseSlug?: string): string {
  return courseSlug ? `/register?course=${encodeURIComponent(courseSlug)}` : "/register";
}

export function studentInvitePath(token: string): string {
  return `/student/invite/${token}`;
}
