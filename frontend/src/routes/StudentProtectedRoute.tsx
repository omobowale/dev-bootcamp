import type { ReactElement } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useStudentAuth } from "../context/StudentAuthContext";

export function StudentProtectedRoute({ children }: { children: ReactElement }) {
  const location = useLocation();
  const { isAuthenticated } = useStudentAuth();

  if (!isAuthenticated) {
    return <Navigate to="/student/login" state={{ from: location }} replace />;
  }

  return children;
}
