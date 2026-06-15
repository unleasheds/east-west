import axios from 'axios';

// In dev: Vite proxies /api → localhost:3001
// In production: VITE_API_URL points to the Railway backend service URL
const baseURL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api';

const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token from localStorage on every request
api.interceptors.request.use((config) => {
  try {
    const stored = localStorage.getItem('ew-store');
    if (stored) {
      const parsed = JSON.parse(stored) as { state?: { token?: string } };
      const token = parsed?.state?.token;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
  } catch {
    // ignore parse errors
  }
  return config;
});

export const packagesApi = {
  getAll: (params?: { type?: string; destination?: string }) =>
    api.get('/packages', { params }).then((r) => r.data),
  getById: (id: string) => api.get(`/packages/${id}`).then((r) => r.data),
  getBySlug: (slug: string) => api.get(`/packages/slug/${slug}`).then((r) => r.data),
};

export const tripsApi = {
  create: (data: object) => api.post('/trips', data).then((r) => r.data),
  getAll: () => api.get('/trips').then((r) => r.data),
};

export const usersApi = {
  upsert: (data: object) => api.post('/users', data).then((r) => r.data),
};

export const wishlistApi = {
  save: (data: { userId: string; packageId: string }) =>
    api.post('/wishlist', data).then((r) => r.data),
  remove: (id: string) => api.delete(`/wishlist/${id}`).then((r) => r.data),
  getByUser: (userId: string) => api.get(`/wishlist/${userId}`).then((r) => r.data),
};

export const authApi = {
  googleToken: (credential: string) =>
    api.post<{ token: string; user: import('../types').AuthUser }>('/auth/google/token', { credential }).then((r) => r.data),
  me: () =>
    api.get<import('../types').AuthUser>('/auth/me').then((r) => r.data),
};

export const settingsApi = {
  getAll: () => api.get<Record<string, any[]>>('/settings').then((r) => r.data),
  setList: (key: string, values: any[]) =>
    api.put(`/settings/${key}`, { values }).then((r) => r.data),
  addItem: (key: string, value: string) =>
    api.post(`/settings/${key}/items`, { value }).then((r) => r.data),
  removeItem: (key: string, item: string) =>
    api.delete(`/settings/${encodeURIComponent(key)}/items/${encodeURIComponent(item)}`).then((r) => r.data),
  renameItem: (key: string, oldItem: string, newItem: string) =>
    api.put(`/settings/${encodeURIComponent(key)}/items/${encodeURIComponent(oldItem)}`, { value: newItem }).then((r) => r.data),
};

export const adminApi = {
  // Packages
  getAllPackages: () => api.get('/packages/admin/all').then((r) => r.data),
  createPackage: (data: object) => api.post('/packages', data).then((r) => r.data),
  updatePackage: (id: string, data: object) => api.patch(`/packages/${id}`, data).then((r) => r.data),
  deletePackage: (id: string) => api.delete(`/packages/${id}`).then((r) => r.data),
  // Users
  getAllUsers: () => api.get('/users').then((r) => r.data),
  setAdmin: (id: string, isAdmin: boolean) => api.patch(`/users/${id}/admin`, { isAdmin }).then((r) => r.data),
  // Trips
  updateTripStatus: (id: string, status: string) => api.patch(`/trips/${id}/status`, { status }).then((r) => r.data),
};

export default api;
