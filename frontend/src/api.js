import axios from 'axios';

// In production, VITE_API_URL is set to https://api.ieeesbcectl.in
// In local dev, Vite's proxy handles /api -> http://localhost:3000
const BASE_URL = import.meta.env.VITE_API_URL || '';

const api = axios.create({
  baseURL: BASE_URL,
});

// Attach JWT from localStorage to every request automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// If a 401 comes back, the token is gone/expired — clear and redirect
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('adminToken');
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

export default api;
