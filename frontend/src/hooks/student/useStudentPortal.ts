import { useQuery } from "@tanstack/react-query";
import { getStudentClass, getStudentClassesForCourse, getStudentEnrollments, getStudentMe } from "../../api/student/portal";
import { QUERY_KEYS } from "../../constants/queryKeys";

export function useStudentMe() {
  return useQuery({
    queryKey: QUERY_KEYS.student.me,
    queryFn: getStudentMe,
  });
}

export function useStudentEnrollments() {
  return useQuery({
    queryKey: QUERY_KEYS.student.enrollments,
    queryFn: getStudentEnrollments,
  });
}

export function useStudentClassesForCourse(courseId: number) {
  return useQuery({
    queryKey: QUERY_KEYS.student.classesForCourse(courseId),
    queryFn: () => getStudentClassesForCourse(courseId),
    enabled: Number.isFinite(courseId),
  });
}

export function useStudentClass(classSessionId: number) {
  return useQuery({
    queryKey: QUERY_KEYS.student.classDetail(classSessionId),
    queryFn: () => getStudentClass(classSessionId),
    enabled: Number.isFinite(classSessionId),
  });
}
