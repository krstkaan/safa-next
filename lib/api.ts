import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auth token interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Types
export interface User {
  id: number;
  name: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface Requester {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface Approver {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface PrintRequest {
  id: number;
  requester_id: number;
  approver_id: number;
  color_copies: number;
  bw_copies: number;
  requested_at: string;
  created_at: string;
  updated_at: string;
  requester?: Requester;
  approver?: Approver;
}

export interface ApiResponse<T> {
  status: string;
  data: T;
  message: string;
}

export interface PaginationInfo {
  current_page: number;
  per_page: number;
  total: number;
  total_pages: number;
  has_next_page: boolean;
}

export interface PaginatedApiResponse<T> {
  status: string;
  data: T[];
  message: string;
  pagination: PaginationInfo;
}

export interface ApiError {
  status: string;
  message: string;
  errors?: any;
}

// Auth APIs
export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await api.post<ApiResponse<{ user: User; token: string }>>('/login', {
      email,
      password,
    });
    return response.data;
  },

  register: async (name: string, email: string, password: string, password_confirmation: string) => {
    const response = await api.post<ApiResponse<{ user: User; token: string }>>('/register', {
      name,
      email,
      password,
      password_confirmation,
    });
    return response.data;
  },

  logout: async () => {
    const response = await api.post<ApiResponse<null>>('/logout');
    return response.data;
  },

  getUser: async () => {
    const response = await api.get<ApiResponse<User>>('/user');
    return response.data;
  },
};

// Print Requests APIs
export const printRequestsAPI = {
  getAll: async (page: number = 1, limit: number = 10) => {
    const response = await api.get<PaginatedApiResponse<PrintRequest>>(`/print-requests?page=${page}&limit=${limit}`);
    return response.data;
  },

  getById: async (id: number) => {
    const response = await api.get<ApiResponse<PrintRequest>>(`/print-requests/${id}`);
    return response.data;
  },

  create: async (data: Omit<PrintRequest, 'id' | 'created_at' | 'updated_at' | 'requester' | 'approver'>) => {
    const response = await api.post<ApiResponse<PrintRequest>>('/print-requests', data);
    return response.data;
  },

  update: async (id: number, data: Omit<PrintRequest, 'id' | 'created_at' | 'updated_at' | 'requester' | 'approver'>) => {
    const response = await api.put<ApiResponse<PrintRequest>>(`/print-requests/${id}`, data);
    return response.data;
  },

  delete: async (id: number) => {
    const response = await api.delete<ApiResponse<null>>(`/print-requests/${id}`);
    return response.data;
  },
};

// Requesters APIs
export const requestersAPI = {
  getAll: async (page: number = 1, limit: number = 10) => {
    const response = await api.get<PaginatedApiResponse<Requester>>(`/requesters?page=${page}&limit=${limit}`);
    return response.data;
  },

  getAllUnpaginated: async () => {
    const response = await api.get<ApiResponse<Requester[]>>('/requesters');
    return response.data;
  },

  getById: async (id: number) => {
    const response = await api.get<ApiResponse<Requester>>(`/requesters/${id}`);
    return response.data;
  },

  create: async (data: { name: string }) => {
    const response = await api.post<ApiResponse<Requester>>('/requesters', data);
    return response.data;
  },

  update: async (id: number, data: { name: string }) => {
    const response = await api.put<ApiResponse<Requester>>(`/requesters/${id}`, data);
    return response.data;
  },

  delete: async (id: number) => {
    const response = await api.delete<ApiResponse<null>>(`/requesters/${id}`);
    return response.data;
  },
};

// Approvers APIs
export const approversAPI = {
  getAll: async (page: number = 1, limit: number = 10) => {
    const response = await api.get<PaginatedApiResponse<Approver>>(`/approvers?page=${page}&limit=${limit}`);
    return response.data;
  },

  getAllUnpaginated: async () => {
    const response = await api.get<ApiResponse<Approver[]>>('/approvers');
    return response.data;
  },

  getById: async (id: number) => {
    const response = await api.get<ApiResponse<Approver>>(`/approvers/${id}`);
    return response.data;
  },

  create: async (data: { name: string }) => {
    const response = await api.post<ApiResponse<Approver>>('/approvers', data);
    return response.data;
  },

  update: async (id: number, data: { name: string }) => {
    const response = await api.put<ApiResponse<Approver>>(`/approvers/${id}`, data);
    return response.data;
  },

  delete: async (id: number) => {
    const response = await api.delete<ApiResponse<null>>(`/approvers/${id}`);
    return response.data;
  },
};
