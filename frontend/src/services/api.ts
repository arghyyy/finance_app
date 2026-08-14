import axios from 'axios';

const api = axios.create({
  baseURL: '/api/v1',
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor: attach JWT
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: auto-refresh on 401
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        try {
          const { data } = await axios.post('/api/v1/auth/refresh', { refresh_token: refreshToken });
          localStorage.setItem('access_token', data.access_token);
          localStorage.setItem('refresh_token', data.refresh_token);
          original.headers.Authorization = `Bearer ${data.access_token}`;
          return api(original);
        } catch {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

/* ─── Auth ─── */
export const authApi = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  register: (data: { email: string; password: string; full_name: string; age: number }) =>
    api.post('/auth/register', data),
  refresh: (refresh_token: string) =>
    api.post('/auth/refresh', { refresh_token }),
};

/* ─── Users ─── */
export const usersApi = {
  me: () => api.get('/users/me'),
  updateMe: (data: any) => api.put('/users/me', data),
  getDependents: () => api.get('/users/me/dependents'),
  addDependent: (data: { name: string; relation: string; birth_year?: number }) =>
    api.post('/users/me/dependents', data),
  updateDependent: (id: string, data: any) => api.put(`/users/me/dependents/${id}`, data),
  deleteDependent: (id: string) => api.delete(`/users/me/dependents/${id}`),
};

/* ─── Goals ─── */
export const goalsApi = {
  list: () => api.get('/goals'),
  create: (data: { goal_type: string; label: string; target_amount: number; target_date?: string; priority?: number }) =>
    api.post('/goals', data),
  update: (id: string, data: { label?: string; target_amount?: number; target_date?: string }) =>
    api.put(`/goals/${id}`, data),
  delete: (id: string) => api.delete(`/goals/${id}`),
  topUp: (id: string, amount: number) => api.post(`/goals/${id}/top-up`, { amount }),
};

/* ─── Statements / Transactions ─── */
export const statementsApi = {
  upload: (bankName: string, file: File) => {
    const fd = new FormData();
    fd.append('bank_name', bankName);
    fd.append('file', file);
    return api.post('/statements/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
  list: () => api.get('/statements'),
  get: (id: string) => api.get(`/statements/${id}`),
};

/* ─── Transactions ─── */
export const transactionsApi = {
  list: () => api.get('/statements/transactions'),
  get: (id: string) => api.get(`/statements/transactions/${id}`),
  create: (data: { date?: string; description?: string; category?: string; amount: number; type?: string; account_id?: string }) =>
    api.post('/statements/transactions', data),
  update: (id: string, data: any) => api.put(`/statements/transactions/${id}`, data),
  remove: (id: string) => api.delete(`/statements/transactions/${id}`),
  removeAll: () => api.delete(`/statements/transactions`),
  bulkSave: (account_id: string | null, transactions: any[]) =>
    api.post('/statements/bulk-save', { account_id, transactions }),
};

/* ─── Accounts ─── */
export const accountsApi = {
  list: () => api.get('/accounts/'),
  get: (id: string) => api.get(`/accounts/${id}`),
  create: (data: any) => api.post('/accounts/', data),
  update: (id: string, data: any) => api.put(`/accounts/${id}`, data),
  remove: (id: string) => api.delete(`/accounts/${id}`),
};

/* ─── Cashflows ─── */
export const cashflowsApi = {
  list: () => api.get('/cashflows'),
  get: (month: string) => api.get(`/cashflows/${month}`),
  create: (data: { month: string; total_income?: number; total_expense?: number; fixed_costs?: number; discretionary?: number; savings?: number }) =>
    api.post('/cashflows', data),
  update: (month: string, data: any) => api.put(`/cashflows/${month}`, data),
  remove: (month: string) => api.delete(`/cashflows/${month}`),
};

/* ─── Dashboard ─── */
export const dashboardApi = {
  get: () => api.get('/dashboard'),
};

/* ─── Emergency Fund ─── */
export const emergencyFundApi = {
  get: () => api.get('/emergency-fund'),
  update: (data: any) => api.put('/emergency-fund', data),
  topUp: (amount: number) => api.post('/emergency-fund/top-up', { amount }),
};

/* ─── Investments ─── */
export const investmentsApi = {
  getPortfolios: () => api.get('/investments/portfolios'),
  rebalance: (targetAllocations: Record<string, number>) =>
    api.post('/investments/rebalance', { target_allocations: targetAllocations }),
};

/* ─── Research ─── */
export const researchApi = {
  compare: (data: { asset_type: string; symbols?: string[] }) =>
    api.post('/research/compare', data),
  newsFeed: (params?: { category?: string; sentiment?: string; limit?: number }) =>
    api.get('/research/news/feed', { params }),
  topStories: (limit?: number) => api.get('/research/top-stories', { params: { limit } }),
};

/* ─── Budgets ─── */
export const budgetsApi = {
  list: (month_year?: string) => api.get('/budgets', { params: { month_year } }),
  create: (data: { category: string; month_year: string; target_amount: number; alert_threshold?: number }) =>
    api.post('/budgets', data),
  update: (id: string, data: any) => api.put(`/budgets/${id}`, data),
  delete: (id: string) => api.delete(`/budgets/${id}`),
};

export default api;
