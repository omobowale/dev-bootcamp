import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

// Student and admin sessions are two independent principal types (see the backend's
// JwtAuthenticationFilter) sharing this one axios instance — the token key to use is decided by
// the request URL, not by which session happens to be logged in, so an admin and a student can
// even be logged in in two different tabs without their tokens colliding.
function isStudentRequest(url: string | undefined): boolean {
  return !!url && url.startsWith("/api/student") && !url.startsWith("/api/student/auth");
}

apiClient.interceptors.request.use((config) => {
  const tokenKey = isStudentRequest(config.url) ? "student_token" : "admin_token";
  const token = localStorage.getItem(tokenKey);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(response => response, error => {
  if (error.response?.status === 401 && !error.config?.url?.includes('/login')) {
    if (isStudentRequest(error.config?.url) && localStorage.getItem('student_token')) {
      localStorage.removeItem('student_token');
      localStorage.removeItem('student_session');
      window.dispatchEvent(new Event('student:auth:expired'));
    } else if (!isStudentRequest(error.config?.url) && localStorage.getItem('admin_token')) {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_session');
      window.dispatchEvent(new Event('auth:expired'));
    }
  }
  return Promise.reject(error);
});
