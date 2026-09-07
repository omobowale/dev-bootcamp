import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { queryClient } from "../lib/queryClient";
import { login as loginRequest, type LoginResponse } from "../api/auth";

interface AdminSession {
  email: string;
  name: string;
  role: string;
}

interface AuthContextValue {
  admin: AdminSession | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const TOKEN_KEY = "admin_token";
const ADMIN_KEY = "admin_session";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<AdminSession | null>(() => {
    const stored = localStorage.getItem(ADMIN_KEY);
    try { return stored && localStorage.getItem(TOKEN_KEY) ? (JSON.parse(stored) as AdminSession) : null; } catch { return null; }
  });

  useEffect(() => {
    const expired = () => { queryClient.clear(); setAdmin(null); sessionStorage.setItem('auth-expired', 'true'); };
    window.addEventListener('auth:expired', expired);
    return () => window.removeEventListener('auth:expired', expired);
  }, []);
  const login = async (email: string, password: string) => {
    const response: LoginResponse = await loginRequest(email, password);
    const session: AdminSession = { email: response.email, name: response.name, role: response.role };
    localStorage.setItem(TOKEN_KEY, response.token);
    localStorage.setItem(ADMIN_KEY, JSON.stringify(session));
    setAdmin(session);
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(ADMIN_KEY);
    queryClient.clear();
    setAdmin(null);
  };

  const value = useMemo(
    () => ({ admin, isAuthenticated: admin !== null, login, logout }),
    [admin],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
