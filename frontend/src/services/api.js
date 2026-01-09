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

  forgotPassword: async (email) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  resetPassword: async (token, newPassword) => {
    const response = await api.post('/auth/reset-password', {
      token,
      new_password: newPassword
    });
    return response.data;
  },
};

// Plants API calls
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

// Watering API calls
export const wateringAPI = {
  getSchedule: async (plantId) => {
    const response = await api.get(`/plants/${plantId}/watering/schedule`);
    return response.data;
  },

  createSchedule: async (plantId, scheduleData) => {
    const response = await api.post(`/plants/${plantId}/watering/schedule`, scheduleData);
    return response.data;
  },

  updateSchedule: async (plantId, scheduleData) => {
    const response = await api.put(`/plants/${plantId}/watering/schedule`, scheduleData);
    return response.data;
  },

  deleteSchedule: async (plantId) => {
    const response = await api.delete(`/plants/${plantId}/watering/schedule`);
    return response.data;
  },

  recordWatering: async (plantId, wateringData) => {
    const response = await api.post(`/plants/${plantId}/watering/water`, wateringData);
    return response.data;
  },

  getHistory: async (plantId, limit = 50) => {
    const response = await api.get(`/plants/${plantId}/watering/history?limit=${limit}`);
    return response.data;
  },
};

// Feeding API calls
export const feedingAPI = {
  getSchedule: async (plantId) => {
    const response = await api.get(`/plants/${plantId}/feeding/schedule`);
    return response.data;
  },

  createSchedule: async (plantId, scheduleData) => {
    const response = await api.post(`/plants/${plantId}/feeding/schedule`, scheduleData);
    return response.data;
  },

  updateSchedule: async (plantId, scheduleData) => {
    const response = await api.put(`/plants/${plantId}/feeding/schedule`, scheduleData);
    return response.data;
  },

  deleteSchedule: async (plantId) => {
    const response = await api.delete(`/plants/${plantId}/feeding/schedule`);
    return response.data;
  },

  recordFeeding: async (plantId, feedingData) => {
    const response = await api.post(`/plants/${plantId}/feeding/feed`, feedingData);
    return response.data;
  },

  getHistory: async (plantId, limit = 50) => {
    const response = await api.get(`/plants/${plantId}/feeding/history?limit=${limit}`);
    return response.data;
  },
};

// Diagnosis API calls
export const diagnosisAPI = {
  uploadDiagnosis: async (plantId, formData) => {
    const response = await api.post(`/plants/${plantId}/diagnosis`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getPlantDiagnoses: async (plantId, limit = 50) => {
    const response = await api.get(`/plants/${plantId}/diagnosis?limit=${limit}`);
    return response.data;
  },

  getDiagnosis: async (photoId) => {
    const response = await api.get(`/diagnosis/${photoId}`);
    return response.data;
  },

  deleteDiagnosis: async (photoId) => {
    const response = await api.delete(`/diagnosis/${photoId}`);
    return response.data;
  },
};

// Notifications API calls
export const notificationsAPI = {
  getAll: async (unreadOnly = false) => {
    const response = await api.get('/notifications', {
      params: { unread_only: unreadOnly }
    });
    return response.data;
  },

  getUnreadCount: async () => {
    const response = await api.get('/notifications/unread-count');
    return response.data;
  },

  markRead: async (notificationIds) => {
    const response = await api.post('/notifications/mark-read', {
      notification_ids: notificationIds
    });
    return response.data;
  },

  markAllRead: async () => {
    const response = await api.post('/notifications/mark-all-read');
    return response.data;
  },

  delete: async (notificationId) => {
    const response = await api.delete(`/notifications/${notificationId}`);
    return response.data;
  },

  getPreferences: async () => {
    const response = await api.get('/notifications/preferences');
    return response.data;
  },

  updatePreferences: async (preferences) => {
    const response = await api.put('/notifications/preferences', preferences);
    return response.data;
  },

  registerPushToken: async (tokenData) => {
    const response = await api.post('/notifications/tokens', tokenData);
    return response.data;
  },

  getPushTokens: async () => {
    const response = await api.get('/notifications/tokens');
    return response.data;
  },

  unregisterPushToken: async (deviceId) => {
    const response = await api.delete(`/notifications/tokens/${deviceId}`);
    return response.data;
  },
};

export default api;
