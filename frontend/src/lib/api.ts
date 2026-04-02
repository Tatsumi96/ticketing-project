import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    const isAuthRequest = original.url?.includes('/auth/login/') || original.url?.includes('/auth/token/refresh/');

    if (error.response?.status === 401 && !original._retry && !isAuthRequest) {
      original._retry = true;
      const refresh = localStorage.getItem('refresh_token');

      if (refresh) {
        try {
          console.debug('Token expiré, tentative de rafraîchissement...');
          const { data } = await axios.post(`${API_URL}/auth/token/refresh/`, { refresh });
          
          localStorage.setItem('access_token', data.access);
          if (data.refresh) {
            localStorage.setItem('refresh_token', data.refresh);
          }
          
          original.headers.Authorization = `Bearer ${data.access}`;
          console.debug('Rafraîchissement réussi, reprise de la requête.');
          return api(original);
        } catch (refreshError) {
          console.error('Échec du rafraîchissement du token:', refreshError);
          localStorage.clear();
          window.location.href = '/login';
        }
      } else {
        localStorage.clear();
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

// Auth
export const authApi = {
  login: (email: string, password: string) =>
    api.post('/auth/login/', { email, password }),
  register: (data: object) => api.post('/auth/register/', data),
  me: () => api.get('/auth/me/'),
  responsables: () => api.get('/auth/responsables/'),
};

// Tickets
export const ticketsApi = {
  list: (params?: object) => api.get('/tickets/', { params }),
  get: (id: number) => api.get(`/tickets/${id}/`),
  create: (data: FormData | object) => api.post('/tickets/', data, {
    headers: data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {},
  }),
  update: (id: number, data: object) => api.patch(`/tickets/${id}/`, data),
  assign: (id: number, responsable_id?: number) =>
    api.post(`/tickets/${id}/assign/`, { responsable_id }),
  resolve: (id: number) => api.post(`/tickets/${id}/resolve/`),
  reject: (id: number) => api.post(`/tickets/${id}/reject/`),
  stats: () => api.get('/tickets/stats/'),
};

// Comments
export const commentsApi = {
  list: (ticketId: number) => api.get(`/tickets/${ticketId}/comments/`),
  create: (ticketId: number, data: object) =>
    api.post(`/tickets/${ticketId}/comments/`, data),
};

// Categories
export const categoriesApi = {
  list: () => api.get('/categories/'),
};
