import type { Budget, Goal, Settings, Transaction, TransactionInput } from '@/types/finance';
import type { BudgetInput, GoalInput } from '@/context/FinanceContext';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

let currentToken: string | null = null;

export const setAuthToken = (token: string | null) => {
  currentToken = token;
};

export const getAuthToken = () => currentToken;

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');

  if (currentToken) {
    headers.set('Authorization', `Bearer ${currentToken}`);
  }

  const url = `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const errorMsg = data?.error || `HTTP error ${response.status}: ${response.statusText}`;
    throw new Error(errorMsg);
  }

  return data;
}

export interface ApiUser {
  id: string;
  email: string;
  user_metadata?: { name?: string };
}

export interface ApiSession {
  access_token: string;
  token_type?: string;
  expires_in?: number;
  user?: ApiUser;
}

export const api = {
  auth: {
    register: (name: string, email: string, password?: string) =>
      request<{ success: boolean; user: ApiUser; session: ApiSession }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password: password || 'DefaultP@ss123' }),
      }),
    login: (email: string, password?: string) =>
      request<{ success: boolean; user: ApiUser; session: ApiSession }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password: password || 'DefaultP@ss123' }),
      }),
    logout: () => request<{ success: boolean }>('/auth/logout', { method: 'POST' }),
    getMe: () => request<{ success: boolean; user: ApiUser; profile: Settings }>('/auth/me'),
    resetPassword: (email: string) =>
      request<{ success: boolean; message: string }>('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      }),
  },

  transactions: {
    list: (params?: Record<string, string>) => {
      const qs = params ? `?${new URLSearchParams(params).toString()}` : '';
      return request<{ success: boolean; data: Transaction[] }>(`/transactions${qs}`);
    },
    create: (input: TransactionInput) =>
      request<{ success: boolean; data: Transaction }>('/transactions', {
        method: 'POST',
        body: JSON.stringify(input),
      }),
    update: (id: string, input: Partial<TransactionInput>) =>
      request<{ success: boolean; data: Transaction }>(`/transactions/${id}`, {
        method: 'PUT',
        body: JSON.stringify(input),
      }),
    delete: (id: string) =>
      request<{ success: boolean }>(`/transactions/${id}`, {
        method: 'DELETE',
      }),
  },

  budgets: {
    list: (month?: string) => {
      const qs = month ? `?month=${month}` : '';
      return request<{ success: boolean; data: Budget[] }>(`/budgets${qs}`);
    },
    save: (input: BudgetInput) =>
      request<{ success: boolean; data: Budget }>('/budgets', {
        method: 'POST',
        body: JSON.stringify(input),
      }),
    delete: (id: string) =>
      request<{ success: boolean }>(`/budgets/${id}`, {
        method: 'DELETE',
      }),
  },

  goals: {
    list: () => request<{ success: boolean; data: Goal[] }>('/goals'),
    create: (input: GoalInput) =>
      request<{ success: boolean; data: Goal }>('/goals', {
        method: 'POST',
        body: JSON.stringify(input),
      }),
    update: (id: string, input: Partial<GoalInput>) =>
      request<{ success: boolean; data: Goal }>(`/goals/${id}`, {
        method: 'PUT',
        body: JSON.stringify(input),
      }),
    delete: (id: string) =>
      request<{ success: boolean }>(`/goals/${id}`, {
        method: 'DELETE',
      }),
    contribute: (id: string, amount: number) =>
      request<{ success: boolean; data: Goal }>(`/goals/${id}/contribute`, {
        method: 'POST',
        body: JSON.stringify({ amount }),
      }),
  },

  dashboard: {
    getSummary: (date?: string) => {
      const qs = date ? `?date=${date}` : '';
      return request<{ success: boolean; data: Record<string, unknown> }>(`/dashboard${qs}`);
    },
  },

  insights: {
    list: (date?: string) => {
      const qs = date ? `?date=${date}` : '';
      return request<{ success: boolean; data: Record<string, unknown>[] }>(`/insights${qs}`);
    },
    dismiss: (id: string) =>
      request<{ success: boolean }>(`/insights/${id}/dismiss`, { method: 'POST' }),
    restore: () =>
      request<{ success: boolean }>('/insights/restore', { method: 'POST' }),
  },

  user: {
    getProfile: () => request<{ success: boolean; data: Settings & { openingBalance: number } }>('/user/profile'),
    updateProfile: (patch: Partial<Settings & { openingBalance: number }>) =>
      request<{ success: boolean; data: Settings & { openingBalance: number } }>('/user/profile', {
        method: 'PUT',
        body: JSON.stringify(patch),
      }),
    loadDemoData: () => request<{ success: boolean; message: string }>('/user/demo-data', { method: 'POST' }),
    clearData: () => request<{ success: boolean; message: string }>('/user/data', { method: 'DELETE' }),
  },
};
