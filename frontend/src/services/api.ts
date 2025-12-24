import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach access token when present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    console.log('Request token:', token ? 'present' : 'missing');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Simple pass-through responses; errors bubble up to callers
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', {
      status: error.response?.status,
      message: error.response?.data?.message,
      url: error.config?.url,
    });
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  login: async (username: string, password: string) => {
    const response = await api.post('/auth/signin', { username, password });
    return response.data;
  },

  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },
};

// Project API
export const projectApi = {
  getAllProjects: async () => {
    const response = await api.get('/projects');
    return response.data;
  },
  
  getProject: async (id: string) => {
    const response = await api.get(`/projects/${id}`);
    return response.data;
  },
  
  createProject: async (project: { name: string; description?: string; color?: string }) => {
    const response = await api.post('/projects', project);
    return response.data;
  },
  
  updateProject: async (id: string, project: Partial<{ name: string; description?: string; color?: string }>) => {
    const response = await api.put(`/projects/${id}`, project);
    return response.data;
  },
  
  deleteProject: async (id: string) => {
    const response = await api.delete(`/projects/${id}`);
    return response.data;
  },
  
  getProjectProgress: async (id: string) => {
    const response = await api.get(`/projects/${id}/progress`);
    return response.data;
  },
};

// Task API
export const taskApi = {
  getProjectTasks: async (projectId: string) => {
    const response = await api.get(`/projects/${projectId}/tasks`);
    return response.data;
  },
  
  createTask: async (projectId: string, task: { title: string; description?: string; section?: string; dueDate?: string }) => {
    const response = await api.post(`/projects/${projectId}/tasks`, task);
    return response.data;
  },
  
  updateTask: async (projectId: string, taskId: string, task: any) => {
    const response = await api.put(`/projects/${projectId}/tasks/${taskId}`, task);
    return response.data;
  },
  
  deleteTask: async (projectId: string, taskId: string) => {
    const response = await api.delete(`/projects/${projectId}/tasks/${taskId}`);
    return response.data;
  },
  
  toggleTaskComplete: async (projectId: string, taskId: string) => {
    const response = await api.patch(`/projects/${projectId}/tasks/${taskId}/toggle`);
    return response.data;
  },
  
  updateTaskStatus: async (projectId: string, taskId: string) => {
    const response = await api.patch(`/projects/${projectId}/tasks/${taskId}/status`);
    return response.data;
  },
};

export default api;
