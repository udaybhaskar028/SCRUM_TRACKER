import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://129.159.231.133:8080/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

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

// --- Teams ---
export const teamApi = {
  create: (data) => api.post('/teams', data),
  getMyTeams: () => api.get('/teams/my'),
  getMemberships: () => api.get('/teams/memberships'),
  joinByCode: (data) => api.post('/teams/join', data),
  addMemberByEmail: (data) => api.post('/teams/add-member', data),
  getMembers: (teamId) => api.get(`/teams/${teamId}/members`),
  getUnassigned: () => api.get('/teams/unassigned'),
  removeMember: (teamId, userId) => api.delete(`/teams/${teamId}/members/${userId}`),
  hasTeam: () => api.get('/teams/has-team'),
  getAllTeams: () => api.get('/teams/all'),
};

// --- Notes (Sticky) ---
export const noteApi = {
  getAll: () => api.get('/notes'),
  create: (data) => api.post('/notes', data),
  update: (id, data) => api.put(`/notes/${id}`, data),
  delete: (id) => api.delete(`/notes/${id}`),
};

// --- Profile ---
export const profileApi = {
  get: () => api.get('/profile'),
  update: (data) => api.put('/profile', data),
  changePassword: (data) => api.put('/profile/change-password', data),
};

export default api;
