// === src/services/api.js ===
import axios from 'axios';

// Base API configuration
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

// Create axios instance with proper configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Enhanced rate limiting state
let requestQueue = [];
let isProcessingQueue = false;
const REQUEST_DELAY = 500; // Increased to 500ms
const MAX_REQUESTS_PER_MINUTE = 30; // Limit requests per minute
const MAX_RETRY_ATTEMPTS = 3;

// Request deduplication map
const activeRequests = new Map();

// Request interceptor with improved rate limiting
api.interceptors.request.use(
  async (config) => {
    // Add auth token
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Create request key for deduplication
    const requestKey = `${config.method}-${config.url}-${JSON.stringify(config.data)}`;
    
    // Check if same request is already in progress
    if (activeRequests.has(requestKey)) {
      throw new axios.Cancel('Duplicate request cancelled');
    }
    
    // Add to active requests
    activeRequests.set(requestKey, Date.now());
    config.requestKey = requestKey;

    // Enhanced rate limiting
    await enforceRateLimit();

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Enhanced rate limiting function
const enforceRateLimit = async () => {
  const now = Date.now();
  const oneMinuteAgo = now - 60000;
  
  // Clean old requests from queue
  requestQueue = requestQueue.filter(time => time > oneMinuteAgo);
  
  // If we're at the limit, wait
  if (requestQueue.length >= MAX_REQUESTS_PER_MINUTE) {
    const oldestRequest = Math.min(...requestQueue);
    const waitTime = (oldestRequest + 60000) - now;
    console.log(`Rate limit reached. Waiting ${waitTime}ms...`);
    await new Promise(resolve => setTimeout(resolve, waitTime));
  }
  
  // Add current request to queue
  requestQueue.push(now);
  
  // Add delay between requests
  if (requestQueue.length > 1) {
    await new Promise(resolve => setTimeout(resolve, REQUEST_DELAY));
  }
};

// Response interceptor with proper retry logic
api.interceptors.response.use(
  (response) => {
    // Remove from active requests on success
    if (response.config.requestKey) {
      activeRequests.delete(response.config.requestKey);
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Remove from active requests on error
    if (originalRequest?.requestKey) {
      activeRequests.delete(originalRequest.requestKey);
    }
    
    // Skip retry for cancelled requests
    if (axios.isCancel(error)) {
      return Promise.reject(error);
    }
    
    // Handle 429 (Rate Limit) errors with exponential backoff
    if (error.response?.status === 429 && !originalRequest._retryCount) {
      originalRequest._retryCount = 0;
    }
    
    if (error.response?.status === 429 && originalRequest._retryCount < MAX_RETRY_ATTEMPTS) {
      originalRequest._retryCount++;
      
      // Calculate exponential backoff delay
      const retryAfter = error.response.headers['retry-after'];
      const baseDelay = retryAfter ? parseInt(retryAfter) * 1000 : 1000;
      const exponentialDelay = baseDelay * Math.pow(2, originalRequest._retryCount - 1);
      const jitter = Math.random() * 1000; // Add randomness to prevent thundering herd
      const delay = exponentialDelay + jitter;
      
      console.log(`Rate limited. Retrying after ${delay}ms... (attempt ${originalRequest._retryCount}/${MAX_RETRY_ATTEMPTS})`);
      
      await new Promise(resolve => setTimeout(resolve, delay));
      
      // Remove the retry flag to allow fresh request
      delete originalRequest._retryCount;
      
      return api(originalRequest);
    }
    
    // Handle 401 (Unauthorized) errors
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');
      window.location.href = '/';
    }
    
    return Promise.reject(error);
  }
);

// === Authentication API ===
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  googleAuth: (token) => api.post('/auth/oauth/google', { token }),
  linkedinAuth: (token) => api.post('/auth/oauth/linkedin', { token }),
  logout: () => api.post('/auth/logout'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, newPassword) => 
    api.post('/auth/reset-password', { token, newPassword }),
  verifyEmail: (token) => api.get(`/auth/verify-email/${token}`),
};

// === User Management API ===
export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (profileData) => api.put('/users/profile', profileData),
  uploadAvatar: (formData) => 
    api.post('/users/upload-avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  uploadDegree: (formData) => 
    api.post('/users/upload-degree', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  deleteAccount: () => api.delete('/users/account'),
};

// === Projects API ===
export const projectAPI = {
  getProjects: (filters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });
    return api.get(`/projects?${params.toString()}`);
  },
  getFeaturedProjects: () => api.get('/projects/featured'),
  getProject: (projectId) => api.get(`/projects/${projectId}`),
  createProject: (projectData) => api.post('/projects', projectData),
  updateProject: (projectId, projectData) => 
    api.put(`/projects/${projectId}`, projectData),
  deleteProject: (projectId) => api.delete(`/projects/${projectId}`),
  incrementViews: (projectId) => api.post(`/projects/${projectId}/view`),
  uploadProjectMedia: (projectId, formData) => 
    api.post(`/projects/${projectId}/upload-media`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
};

// === Graduate Dashboard API ===
export const graduateAPI = {
  getDashboard: () => api.get('/graduate/dashboard'),
  getMyProjects: () => api.get('/graduate/projects'),
  getProjectAnalytics: (projectId) => 
    api.get(`/graduate/analytics/${projectId}`),
  getMessages: () => api.get('/graduate/messages'),
};

// === Investor Portal API ===
export const investorAPI = {
  getDashboard: () => api.get('/investor/dashboard'),
  bookmarkProject: (projectId) => 
    api.post(`/investor/bookmark/${projectId}`),
  getBookmarks: () => api.get('/investor/bookmarks'),
  expressInterest: (interestData) => 
    api.post('/investor/express-interest', interestData),
  contactGraduate: (contactData) => 
    api.post('/investor/contact-graduate', contactData),
  getConversations: () => api.get('/investor/conversations'),
};

// === Admin Panel API ===
export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getUsers: (filters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });
    return api.get(`/admin/users?${params.toString()}`);
  },
  updateUserStatus: (userId, status) => 
    api.put(`/admin/users/${userId}/status`, { status }),
  getPendingProjects: () => api.get('/admin/projects/pending'),
  approveProject: (projectId, approved, reason = '') => 
    api.put(`/admin/projects/${projectId}/approve`, { approved, reason }),
  getAnalytics: () => api.get('/admin/analytics'),
  generateReport: (reportType, filters = {}) => 
    api.get('/admin/reports', { params: { type: reportType, ...filters } }),
};

// === File Upload Helpers ===
export const fileUploadAPI = {
  createFormData: (file, fieldName = 'file') => {
    const formData = new FormData();
    formData.append(fieldName, file);
    return formData;
  },
  createMultipleFormData: (files, fieldName = 'files') => {
    const formData = new FormData();
    files.forEach(file => {
      formData.append(fieldName, file);
    });
    return formData;
  },
};

// === Enhanced Error Handling ===
export const handleAPIError = (error) => {
  if (axios.isCancel(error)) {
    return {
      message: 'Request was cancelled',
      status: 0,
      cancelled: true,
    };
  }
  
  if (error.response) {
    const errorData = {
      message: error.response.data?.message || 'An error occurred',
      status: error.response.status,
      data: error.response.data,
    };
    
    switch (error.response.status) {
      case 429:
        errorData.message = 'Too many requests. Please wait a moment and try again.';
        break;
      case 401:
        errorData.message = 'Session expired. Please login again.';
        break;
      case 403:
        errorData.message = 'You do not have permission to perform this action.';
        break;
      case 404:
        errorData.message = 'Resource not found.';
        break;
      case 500:
        errorData.message = 'Server error. Please try again later.';
        break;
      default:
        break;
    }
    
    return errorData;
  } else if (error.request) {
    return {
      message: 'Network error. Please check your connection.',
      status: 0,
    };
  } else {
    return {
      message: error.message || 'An unexpected error occurred',
      status: -1,
    };
  }
};

// === Token Management ===
export const tokenManager = {
  setTokens: (authToken, refreshToken) => {
    localStorage.setItem('authToken', authToken);
    if (refreshToken) {
      localStorage.setItem('refreshToken', refreshToken);
    }
  },
  getToken: () => localStorage.getItem('authToken'),
  getRefreshToken: () => localStorage.getItem('refreshToken'),
  clearTokens: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
  },
};

// === Request Queue Management ===
export const requestQueueManager = {
  clearQueue: () => {
    requestQueue = [];
    activeRequests.clear();
  },
  getQueueStatus: () => ({
    queueLength: requestQueue.length,
    isProcessing: isProcessingQueue,
    activeRequests: activeRequests.size,
  }),
  setProcessingState: (state) => {
    isProcessingQueue = state;
  },
};

export default api;
