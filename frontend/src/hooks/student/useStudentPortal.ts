import { useQuery } from "@tanstack/react-query";
import { getStudentEnrollments, getStudentMe } from "../../api/student/portal";
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
