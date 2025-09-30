import axios from "axios";

const API_BASE_URL = import.meta.env.PROD
  ? import.meta.env.VITE_API_URL // production
  : import.meta.env.VITE_BACKEND_URL; // development

if (!API_BASE_URL) {
  console.error("API_BASE_URL is undefined! Check your Vite env variables.");
}

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
