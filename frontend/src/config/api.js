// API configuration that works for both development and production
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const API_ENDPOINTS = {
  upload: `${API_BASE_URL}/api/upload`,
  chat: `${API_BASE_URL}/api/chat`,
};

export default API_BASE_URL;