import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  register: async (email, password) => {
    const response = await api.post('/auth/register', { email, password });
    return response.data;
  },

  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

// Plants API calls (will be used in future sprints)
export const plantsAPI = {
  getAll: async () => {
    const response = await api.get('/plants');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/plants/${id}`);
    return response.data;
  },

  create: async (plantData) => {
    const response = await api.post('/plants', plantData);
    return response.data;
  },

  update: async (id, plantData) => {
    const response = await api.put(`/plants/${id}`, plantData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/plants/${id}`);
    return response.data;
  },
};

export default api;
