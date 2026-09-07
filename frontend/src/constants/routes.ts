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
} as const;

export function adminCourseOutlinePath(courseId: number): string {
  return `/admin/courses/${courseId}/outline`;
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
