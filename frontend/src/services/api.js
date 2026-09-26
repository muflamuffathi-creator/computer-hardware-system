import axios from 'axios';

// Prefer explicit environment override set by Vite: VITE_API_BASE_URL
// In dev, fall back to a relative `/api` so Vite's dev-server proxy forwards requests to the backend.
const envApiBaseUrl = import.meta.env.VITE_API_BASE_URL;
// In development prefer the relative `/api` so Vite's dev-server proxy handles requests
// and we avoid cross-origin issues if an absolute VITE_API_BASE_URL is misconfigured.
const API_BASE_URL = import.meta.env.DEV ? '/api' : (envApiBaseUrl || '/api');

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request Interceptor to add JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor to handle authentication failures
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        // Attempt to refresh token: prefer cookie-based, but include current access
        // token in Authorization header in case the server only supports header refresh.
        const currentToken = localStorage.getItem('token') || '';
        const refreshResp = await axios.post(`${API_BASE_URL}/auth/refresh`, {}, {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${currentToken}`,
          },
        });
        const newToken = refreshResp.data?.token;
        if (newToken) {
          localStorage.setItem('token', newToken);
          // set authorization header for the original request and retry
          originalRequest.headers = originalRequest.headers || {};
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        }
      } catch (refreshErr) {
        // refresh failed, fall through to clearing auth
      }
    }

    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      // Clear user data on unauthorized or forbidden error
      localStorage.removeItem('token');
      localStorage.removeItem('email');
      localStorage.removeItem('role');
      localStorage.removeItem('user_name');
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('auth-unauthorized'));
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password }, { withCredentials: true });
    return response.data;
  },
  register: async (firstName, lastName, email, password) => {
    const response = await api.post('/auth/register', { firstName, lastName, email, password });
    return response.data;
  },
  logout: async () => {
    // Ask server to revoke refresh token and clear cookie, then clear local storage
    try {
      await api.post('/auth/logout', null, { withCredentials: true });
    } catch (e) {
      // ignore logout failures on client side
    }
    localStorage.removeItem('token');
    localStorage.removeItem('email');
    localStorage.removeItem('role');
    localStorage.removeItem('user_name');
  }
};

export const productsAPI = {
  getAll: (params) => api.get('/products', { params }),
  getById: (id) => api.get(`/products/${id}`),
  getCategories: () => api.get('/categories'),
  getBrands: () => api.get('/brands'),
  
  // Admin Operations
  create: (product) => api.post('/admin/products', product),
  update: (id, product) => api.put(`/admin/products/${id}`, product),
  delete: (id) => api.delete(`/admin/products/${id}`)
};

export const categoryAPI = {
  getAll: () => api.get('/categories'),
  create: (category) => api.post('/admin/categories', category),
  update: (id, category) => api.put(`/admin/categories/${id}`, category),
  delete: (id) => api.delete(`/admin/categories/${id}`)
};

export const brandAPI = {
  getAll: () => api.get('/brands'),
  create: (brand) => api.post('/admin/brands', brand),
  update: (id, brand) => api.put(`/admin/brands/${id}`, brand),
  delete: (id) => api.delete(`/admin/brands/${id}`)
};

export const cartAPI = {
  get: () => api.get('/cart'),
  add: (productId, quantity = 1) => api.post('/cart/add', { productId, quantity }),
  update: (productId, quantity) => api.put('/cart/update', { productId, quantity }),
  remove: (productId) => api.delete(`/cart/remove/${productId}`),
  clear: () => api.post('/cart/clear')
};

export const ordersAPI = {
  checkout: (shippingAddress, billingAddress) => api.post('/orders', { shippingAddress, billingAddress }),
  getMyOrders: () => api.get('/orders'),
  getById: (id) => api.get(`/orders/${id}`),
  cancelOrder: (id) => api.put(`/orders/${id}/cancel`),
  
  // Admin Operations
  getAll: () => api.get('/admin/orders'),
  updateStatus: (id, status) => api.put(`/admin/orders/${id}/status`, { status })
};

export const pcBuilderAPI = {
  saveBuild: (buildName, components) => api.post('/builds', {
    buildName,
    cpuId: components.cpu?.productId || null,
    motherboardId: components.motherboard?.productId || null,
    ramId: components.ram?.productId || null,
    gpuId: components.gpu?.productId || null,
    coolerId: components.cooler?.productId || null,
    psuId: components.psu?.productId || null,
    caseId: components.pcCase?.productId || null,
    storageId: components.storage?.productId || null,
  }),
  getMyBuilds: () => api.get('/builds'),
  deleteBuild: (id) => api.delete(`/builds/${id}`),
  checkCompatibility: (components) => api.post('/compatibility-check', {
    cpuId: components.cpu?.productId || null,
    motherboardId: components.motherboard?.productId || null,
    ramId: components.ram?.productId || null,
    gpuId: components.gpu?.productId || null,
    coolerId: components.cooler?.productId || null,
    psuId: components.psu?.productId || null,
    caseId: components.pcCase?.productId || null,
    storageId: components.storage?.productId || null,
  })
};

export const aiAPI = {
  chat: (message) => api.post('/chat', { message }, { withCredentials: true }),
  getHistory: () => api.get('/chat/history', { withCredentials: true }),
  clearHistory: () => api.delete('/chat/history', { withCredentials: true }),
  checkBackend: () => api.get('/products')
};

export default api;
