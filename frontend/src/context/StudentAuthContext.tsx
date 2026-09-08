import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { queryClient } from "../lib/queryClient";
import { studentLogin, acceptStudentInvite, type StudentLoginResponse } from "../api/student/auth";

interface StudentSession {
  email: string;
  name: string;
}

interface StudentAuthContextValue {
  student: StudentSession | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  acceptInvite: (token: string, password: string) => Promise<void>;
  logout: () => void;
}

const StudentAuthContext = createContext<StudentAuthContextValue | undefined>(undefined);

const TOKEN_KEY = "student_token";
const SESSION_KEY = "student_session";

function persistSession(response: StudentLoginResponse): StudentSession {
  const session: StudentSession = { email: response.email, name: response.name };
  localStorage.setItem(TOKEN_KEY, response.token);
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
}

export function StudentAuthProvider({ children }: { children: ReactNode }) {
  const [student, setStudent] = useState<StudentSession | null>(() => {
    const stored = localStorage.getItem(SESSION_KEY);
    try {
      return stored && localStorage.getItem(TOKEN_KEY) ? (JSON.parse(stored) as StudentSession) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    const expired = () => {
      queryClient.clear();
      setStudent(null);
      sessionStorage.setItem("student-auth-expired", "true");
    };
    window.addEventListener("student:auth:expired", expired);
    return () => window.removeEventListener("student:auth:expired", expired);
  }, []);

  const login = async (email: string, password: string) => {
    const response = await studentLogin(email, password);
    setStudent(persistSession(response));
  };

  const acceptInvite = async (token: string, password: string) => {
    const response = await acceptStudentInvite(token, password);
    setStudent(persistSession(response));
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(SESSION_KEY);
    queryClient.clear();
    setStudent(null);
  };

  const value = useMemo(
    () => ({ student, isAuthenticated: student !== null, login, acceptInvite, logout }),
    [student],
  );

  return <StudentAuthContext.Provider value={value}>{children}</StudentAuthContext.Provider>;
}

export function useStudentAuth(): StudentAuthContextValue {
  const context = useContext(StudentAuthContext);
  if (!context) {
    throw new Error("useStudentAuth must be used within a StudentAuthProvider");
  }
  return context;
}
