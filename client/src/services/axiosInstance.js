import axios from 'axios';

const API_BASE_URL = import.meta.env.PROD 
  ? import.meta.env.VITE_RENDER_URL   // production
  : import.meta.env.VITE_BACKEND_URL; // development

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  withCredentials: true, 
});

// Add auth token to headers if exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
