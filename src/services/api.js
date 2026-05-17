/**
 * API Service
 * Handles all HTTP requests to the backend API
 */

import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';

// Create axios instance with base URL
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
apiClient.interceptors.request.use(
  config => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

// Add response interceptor to handle errors
apiClient.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Clear token and redirect to login
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ============ Authentication APIs ============

export const authAPI = {
  register: (data) => apiClient.post('/auth/register', data),
  login: (email, password) => apiClient.post('/auth/login', { email, password }),
  getCurrentUser: () => apiClient.get('/auth/me'),
  logout: () => apiClient.post('/auth/logout'),
  deleteUser: (userId) => apiClient.delete(`/auth/${userId}`),
};

// ============ Land Records APIs ============

export const recordsAPI = {
  createRecord: (data) => apiClient.post('/records/create', data),
  getRecordReport: (params) => apiClient.get('/records/reports', { params }),
  getAllRecords: (params) => apiClient.get('/records/list', { params }),
  getRecordById: (id) => apiClient.get(`/records/${id}`),
  updateRecord: (id, data) => apiClient.put(`/records/${id}`, data),
  deleteRecord: (id) => apiClient.delete(`/records/${id}`),
  assignRecord: (id, data) => apiClient.put(`/records/${id}/assign`, data),
};

// ============ File APIs ============

export const filesAPI = {
  uploadDocument: (recordId, file) => {
    const formData = new FormData();
    formData.append('document', file);
    return apiClient.post(`/files/${recordId}/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  downloadDocument: (recordId, documentId) =>
    apiClient.get(`/files/${recordId}/download/${documentId}`, { responseType: 'blob' }),
  deleteDocument: (recordId, documentId) =>
    apiClient.delete(`/files/${recordId}/document/${documentId}`),
};

// ============ Audit APIs ============

export const auditAPI = {
  getAuditLogs: (params) => apiClient.get('/audit/logs', { params }),
  getEntityAuditTrail: (entityType, entityId) =>
    apiClient.get(`/audit/trail/${entityType}/${entityId}`),
  getAuditStatistics: (params) => apiClient.get('/audit/statistics', { params }),
};

export default apiClient;
