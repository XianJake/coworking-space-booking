import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  signup: (data) => api.post('/auth/signup', data),
  login: (data) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/profile'),
};

// Space APIs
export const spaceAPI = {
  getAllSpaces: () => api.get('/spaces'),
  getSpaceById: (id) => api.get(`/spaces/${id}`),
  checkAvailability: (params) => api.get('/spaces/availability', { params }),
  createSpace: (data) => api.post('/spaces', data),
  updateSpace: (id, data) => api.put(`/spaces/${id}`, data),
};

// Booking APIs
export const bookingAPI = {
  createBooking: (data) => api.post('/bookings', data),
  getUserBookings: () => api.get('/bookings/my-bookings'),
  getAllBookings: (params) => api.get('/bookings', { params }),
  getBookingById: (id) => api.get(`/bookings/${id}`),
  updateBookingStatus: (id, data) => api.put(`/bookings/${id}/status`, data),
  cancelBooking: (id) => api.put(`/bookings/${id}/cancel`),
};

// Payment APIs
export const paymentAPI = {
  processDeposit: (data) => api.post('/payments/deposit', data),
  processBalance: (data) => api.post('/payments/balance', data),
  getBookingPayments: (bookingId) => api.get(`/payments/booking/${bookingId}`),
  getUserPayments: () => api.get('/payments/my-payments'),
};

// Membership APIs
export const membershipAPI = {
  getAllPlans: () => api.get('/membership/plans'),
  subscribe: (data) => api.post('/membership/subscribe', data),
  cancel: () => api.post('/membership/cancel'),
};

export default api;
