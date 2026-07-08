import { api, apiURL } from './apiClient';
import { getToken } from './authService';

export interface AdminUser {
  id: string;
  email: string;
  emailVerified: boolean;
  userRoles: Array<{ role: { name: string; type: 'admin' | 'professional' | 'other' } }>;
  createdAt: string;
  updatedAt?: string;
  deletedAt: null | string;
}

export function getPrimaryRole(user: AdminUser): string {
  if (!user.userRoles?.length) return 'Sin rol';
  return user.userRoles[0].role.name;
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

export async function fetchAdminUsers(
  page = 1,
  sizePage = 15,
  search?: string,
): Promise<PaginatedAdminUsersResponse> {
  setAuthHeader();
  const response = await api.get<AdminUser[] | PaginatedAdminUsersResponse>(ADMIN_USERS_PATH, {
    page,
    sizePage,
    ...(search ? { search } : {}),
  });

  if (Array.isArray(response)) {
    return {
      data: response,
      total: response.length,
      page: 1,
      sizePage: response.length,
    };
  }

  return response as PaginatedAdminUsersResponse;
}

export async function createAdminUser(payload: CreateAdminUserPayload): Promise<AdminUser> {
  setAuthHeader();
  return api.post<AdminUser>(ADMIN_USERS_PATH, payload);
}

export async function updateAdminUser(id: string, payload: UpdateAdminUserPayload): Promise<AdminUser> {
  setAuthHeader();
  return api.patch<AdminUser>(`${ADMIN_USERS_PATH}/${id}`, payload);
}

export async function fetchAdminRoles(): Promise<Array<{ id: string; name: string; type: string }>> {
  setAuthHeader();
  return api.get<Array<{ id: string; name: string; type: string }>>('/admin/roles');
}

export async function updateUserRoles(userId: string, roles: string[]): Promise<AdminUser> {
  setAuthHeader();
  return api.patch<AdminUser>(`${ADMIN_USERS_PATH}/${userId}`, { roles });
}

export async function deleteAdminUser(id: string): Promise<AdminUserMutationResponse> {
  setAuthHeader();
  return api.del<AdminUserMutationResponse>(`${ADMIN_USERS_PATH}/${id}`);
}

// Traceability: implementation by Programmer at 2026-06-20 00:00:00
