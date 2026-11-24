const API_BASE_URL = 'http://localhost:8001/api';

export const getAuthToken = () => localStorage.getItem('token');
export const setAuthToken = (token) => {
  if (token) localStorage.setItem('token', token);
  else localStorage.removeItem('token');
};

export const getStoredUser = () => {
  try {
    const u = localStorage.getItem('user');
    return u ? JSON.parse(u) : null;
  } catch {
    return null;
  }
};

export const setStoredUser = (user) => {
  if (user) localStorage.setItem('user', JSON.stringify(user));
  else localStorage.removeItem('user');
};

async function request(endpoint, options = {}) {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    if (response.status === 401) {
      setAuthToken(null);
      setStoredUser(null);
      // Optional event or redirect
      window.dispatchEvent(new Event('auth:unauthorized'));
    }
    const validationMsg = data.errors ? Object.values(data.errors).flat().join(', ') : null;
    const errorMsg = validationMsg || data.message || 'Terjadi kesalahan sistem';
    throw new Error(errorMsg);
  }

  return data;
}

export const api = {
  // Auth
  login: async (email, password) => {
    const res = await request('/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (res.token) setAuthToken(res.token);
    if (res.user) setStoredUser(res.user);
    return res;
  },
  logout: async () => {
    try {
      await request('/logout', { method: 'POST' });
    } finally {
      setAuthToken(null);
      setStoredUser(null);
    }
  },
  me: () => request('/me'),

  // Dashboard
  getDashboard: () => request('/dashboard'),

  // Products
  getProducts: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/products${q ? `?${q}` : ''}`);
  },
  getPosProducts: (search = '') => {
    return request(`/products/pos${search ? `?search=${encodeURIComponent(search)}` : ''}`);
  },
  getLowStockProducts: () => request('/products/low-stock'),
  createProduct: (data) => request('/products', { method: 'POST', body: JSON.stringify(data) }),
  updateProduct: (id, data) => request(`/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteProduct: (id) => request(`/products/${id}`, { method: 'DELETE' }),

  // Categories
  getCategories: () => request('/categories'),
  createCategory: (data) => request('/categories', { method: 'POST', body: JSON.stringify(data) }),
  deleteCategory: (id) => request(`/categories/${id}`, { method: 'DELETE' }),

  // Suppliers
  getSuppliers: () => request('/suppliers'),
  createSupplier: (data) => request('/suppliers', { method: 'POST', body: JSON.stringify(data) }),
  updateSupplier: (id, data) => request(`/suppliers/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteSupplier: (id) => request(`/suppliers/${id}`, { method: 'DELETE' }),

  // Sales (POS)
  getSales: () => request('/sales'),
  getSale: (id) => request(`/sales/${id}`),
  createSale: (saleData) => request('/sales', { method: 'POST', body: JSON.stringify(saleData) }),

  // Purchases (Kulakan)
  getPurchases: () => request('/purchases'),
  createPurchase: (data) => request('/purchases', { method: 'POST', body: JSON.stringify(data) }),

  // Expenses (Operasional)
  getExpenses: () => request('/expenses'),
  createExpense: (data) => request('/expenses', { method: 'POST', body: JSON.stringify(data) }),
  deleteExpense: (id) => request(`/expenses/${id}`, { method: 'DELETE' }),

  // Reports
  getCashFlowReport: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/report/cashflow${q ? `?${q}` : ''}`);
  },
  setInitialCapital: (data) => request('/report/capital', { method: 'POST', body: JSON.stringify(data) }),

  // Users
  getUsers: () => request('/users'),
  createUser: (data) => request('/users', { method: 'POST', body: JSON.stringify(data) }),
  updateUser: (id, data) => request(`/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteUser: (id) => request(`/users/${id}`, { method: 'DELETE' }),
};
