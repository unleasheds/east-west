import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

export const packagesApi = {
  getAll: (params?: { type?: string; destination?: string }) =>
    api.get('/packages', { params }).then((r) => r.data),
  getById: (id: string) => api.get(`/packages/${id}`).then((r) => r.data),
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

export default api;
