import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Redirect to login on 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// --- Auth ---
export const authApi = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
};

// --- Sprints ---
export const sprintApi = {
  getAll: () => api.get('/sprints'),
  getActive: () => api.get('/sprints/active'),
  getById: (id) => api.get(`/sprints/${id}`),
  create: (data) => api.post('/sprints', data),
  updateStatus: (id, status) => api.put(`/sprints/${id}/status?status=${status}`),
};

// --- Daily Updates ---
export const updateApi = {
  save: (data) => api.post('/updates', data),
  getMyUpdates: (sprintId) => api.get(`/updates/my/${sprintId}`),
  getMyToday: (sprintId) => api.get(`/updates/my/today/${sprintId}`),
  getDashboard: (sprintId, date) =>
    api.get(`/updates/dashboard/${sprintId}`, { params: date ? { date } : {} }),
  getSprintSummary: (sprintId) => api.get(`/updates/summary/${sprintId}`),
  managerEdit: (id, data) => api.put(`/updates/${id}/manager`, data),
  exportExcel: (sprintId) =>
    api.get(`/updates/export/${sprintId}`, { responseType: 'blob' }),
};

export default api;
