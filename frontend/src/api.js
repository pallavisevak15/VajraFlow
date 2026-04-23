import axios from 'axios';

// Detect if we are in development or production
// In production (Vercel/etc), you should set VITE_API_URL in your environment variables.
// If not set, it defaults to the current origin (useful if served by the same backend).
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Automatically add the token to every request if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;
