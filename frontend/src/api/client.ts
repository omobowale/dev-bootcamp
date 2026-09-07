import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("admin_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(response => response, error => {
  if (error.response?.status === 401 && !error.config?.url?.includes('/login') && localStorage.getItem('admin_token')) {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_session');
    window.dispatchEvent(new Event('auth:expired'));
  }
  return Promise.reject(error);
});
