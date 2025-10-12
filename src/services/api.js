import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const response = await axios.post(`${API_URL}/auth/refresh`, {
          refreshToken,
        });

        const { accessToken } = response.data;
        localStorage.setItem('accessToken', accessToken);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Redirect to login
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  verifyOtp: (data) => api.post('/auth/verify-otp', data),
  requestOtp: (data) => api.post('/auth/request-otp', data),
  refreshToken: (refreshToken) => api.post('/auth/refresh', { refreshToken }),
  googleLogin: () => `${API_URL}/auth/google`,
  linkedinLogin: () => `${API_URL}/auth/linkedin`,
};

// User API
export const userAPI = {
  getProfile: () => api.get('/users/me'),
  updateProfile: (data) => api.put('/users/me', data),
  uploadAvatar: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/users/me/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  getDashboardStats: () => api.get('/users/me/dashboard'),
  exportData: () => api.get('/users/me/export'),
  requestDeletion: () => api.delete('/users/me'),
};

// CV API
export const cvAPI = {
  uploadCv: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/cv/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  getCvs: () => api.get('/cv'),
  getCvById: (id) => api.get(`/cv/${id}`),
  downloadCv: (id) => api.get(`/cv/${id}/download`),
  deleteCv: (id) => api.delete(`/cv/${id}`),
  reParse: (id) => api.post(`/cv/${id}/parse`),
  fixCv: (id, data) => api.post(`/cv/${id}/fix`, data),
  scanCv: (id) => api.post(`/cv/${id}/scan`),
  translateCv: (id, data) => api.post(`/cv/${id}/translate`, data),
};

// AI API
export const aiAPI = {
  generateCoverLetter: (data) => api.post('/ai/cover-letter', data),
  generateInterviewPrep: (data) => api.post('/ai/interview-prep', data),
  getTasks: (limit) => api.get('/ai/tasks', { params: { limit } }),
  getTask: (id) => api.get(`/ai/tasks/${id}`),
};

// Jobs API
export const jobsAPI = {
  getJobs: (params) => api.get('/jobs', { params }),
  getMatchedJobs: (limit) => api.get('/jobs/matched', { params: { limit } }),
  getJobById: (id) => api.get(`/jobs/${id}`),
  createJob: (data) => api.post('/jobs', data),
};

// Applications API
export const applicationsAPI = {
  createApplication: (data) => api.post('/applications', data),
  submitApplication: (id) => api.post(`/applications/${id}/submit`),
  getApplications: () => api.get('/applications'),
  getApplicationById: (id) => api.get(`/applications/${id}`),
  updateApplication: (id, data) => api.put(`/applications/${id}`, data),
  deleteApplication: (id) => api.delete(`/applications/${id}`),
};

// Admin API
export const adminAPI = {
  getUsers: (params) => api.get('/admin/users', { params }),
  getAllTasks: (params) => api.get('/admin/tasks', { params }),
  getStats: () => api.get('/admin/stats'),
  retryTask: (id) => api.post(`/admin/tasks/${id}/retry`),
};

export default api;

