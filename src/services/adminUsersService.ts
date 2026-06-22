import { api, apiURL } from './apiClient';
import { getToken } from './authService';

export interface AdminUser {
  id: string;
  email: string;
  role: 'admin' | string;
  createdAt: string;
  updatedAt?: string;
}

export interface PaginatedAdminUsersResponse {
  data: AdminUser[];
  total: number;
  page: number;
  sizePage: number;
}

export interface CreateAdminUserPayload {
  email: string;
  password: string;
  role: 'admin';
}

export interface UpdateAdminUserPayload {
  email?: string;
  password?: string;
  role?: 'admin';
}

export interface AdminUserMutationResponse {
  message: string;
}

const ADMIN_USERS_PATH = new URL(apiURL('/admin/users')).pathname;

function setAuthHeader(): void {
  const token = getToken();
  if (token) {
    api.setHeader('Authorization', `Bearer ${token}`);
  }
}

export async function fetchAdminUsers(page = 1, sizePage = 15): Promise<PaginatedAdminUsersResponse> {
  setAuthHeader();
  return api.get<PaginatedAdminUsersResponse>(ADMIN_USERS_PATH, { page, sizePage });
}

export async function createAdminUser(payload: CreateAdminUserPayload): Promise<AdminUser> {
  setAuthHeader();
  return api.post<AdminUser>(ADMIN_USERS_PATH, payload);
}

export async function updateAdminUser(id: string, payload: UpdateAdminUserPayload): Promise<AdminUser> {
  setAuthHeader();
  return api.patch<AdminUser>(`${ADMIN_USERS_PATH}/${id}`, payload);
}

export async function deleteAdminUser(id: string): Promise<AdminUserMutationResponse> {
  setAuthHeader();
  return api.del<AdminUserMutationResponse>(`${ADMIN_USERS_PATH}/${id}`);
}

// Traceability: implementation by Programmer at 2026-06-20 00:00:00
