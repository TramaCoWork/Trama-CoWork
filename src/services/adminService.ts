/**
 * AdminService
 * ------------
 * API calls for admin panel.
 */

import { api, apiURL } from './apiClient';
import { getToken } from './authService';

// ─── Types ─────────────────────────────────────────────────────

export interface AdminProfessional {
  id: string;
  userId: string;
  name: string;
  bio: string | null;
  photo: string | null;
  services: string[];
  pricePerHour?: number;
  city: string | null;
  whatsapp: string | null;
  emailContact: string | null;
  isActive: boolean;
  profileStatus: string;
  completionPct: number;
  rubroId: number | null;
  countryId: number | null;
  provinceId: number | null;
  dni: string | null;
  linkedin: string | null;
  workModality: string | null;
  tramaMotivation: string | null;
  identityFrontUrl: string | null;
  identityBackUrl: string | null;
  createdAt: string;
  updatedAt: string;
  trialEndDate?: string | null;
  rubro?: { id: number; slug: string; name: string } | null;
  country?: { id: number; name: string; code: string } | null;
  province?: { id: number; name: string } | null;
  professionCategories?: { id: number; slug: string; name: string; level: number }[];
  user?: { id: string; email: string; role: string; emailVerified?: boolean };
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  sizePage: number;
}

export interface AdminUser {
  id: string;
  email: string;
  role: string;
  createdAt: string;
  updatedAt?: string;
  name?: string;
}

export interface PaginatedAdminUsersResponse {
  data: AdminUser[];
  total: number;
  page: number;
  sizePage: number;
}

type AdminUsersResponseRaw =
  | AdminUser[]
  | PaginatedAdminUsersResponse
  | {
      data?: AdminUser[];
      total?: number;
      page?: number;
      sizePage?: number;
      meta?: {
        total?: number;
        page?: number;
        sizePage?: number;
        limit?: number;
      };
    };

export interface ProfessionalFilters {
  profileStatus?: string;
  isActive?: boolean;
  search?: string;
  rubroId?: number;
  countryId?: number;
  provinceId?: number;
  sizePage?: number;
  page?: number;
}

export interface ProfessionalDocument {
  id: string;
  type: string;
  originalName: string;
  url: string;
  status: string;
  verificationStatus: string | null;
  verificationNotes: string | null;
  createdAt: string;
  professionName?: string | null;
  educationTitle?: string | null;
  educationInstitution?: string | null;
  educationYear?: number | string | null;
  education?: { id: string; title: string } | null;
  certification?: { id: string; name: string } | null;
}

export interface ValidationRecord {
  id: string;
  status: string;
  reviewNotes: string | null;
  documentsReviewed: string[];
  createdAt: string;
  reviewer?: { id: string; email: string } | null;
}

export interface ValidatePayload {
  status: 'manual_approved' | 'manual_rejected';
  reviewNotes?: string;
  documentsReviewed?: string[];
}

export interface VerifyDocumentPayload {
  status: 'approved' | 'rejected';
  verificationNotes?: string;
}

// ─── API Calls ─────────────────────────────────────────────────

export async function fetchAllProfessionals(
  filters: ProfessionalFilters = {},
): Promise<PaginatedResponse<AdminProfessional>> {
  const params = new URLSearchParams();
  if (filters.profileStatus) params.set('profileStatus', filters.profileStatus);
  if (filters.isActive !== undefined) params.set('isActive', String(filters.isActive));
  if (filters.search) params.set('search', filters.search);
  if (filters.rubroId) params.set('rubroId', String(filters.rubroId));
  if (filters.countryId) params.set('countryId', String(filters.countryId));
  if (filters.provinceId) params.set('provinceId', String(filters.provinceId));
  params.set('sizePage', String(filters.sizePage || 15));
  params.set('page', String(filters.page || 1));

  const qs = params.toString();
  return api.get<PaginatedResponse<AdminProfessional>>(`/admin/professionals?${qs}`);
}

export async function fetchProfessionalDetail(id: string): Promise<AdminProfessional> {
  return api.get<AdminProfessional>(`/admin/professionals/${id}`);
}

export async function fetchProfessionalDocuments(id: string): Promise<ProfessionalDocument[]> {
  return api.get<ProfessionalDocument[]>(`/admin/professionals/${id}/documents`);
}

export async function fetchValidationHistory(id: string): Promise<ValidationRecord[]> {
  return api.get<ValidationRecord[]>(`/admin/professionals/${id}/validation-history`);
}

export async function fetchAdminUsers(
  page = 1,
  sizePage = 15,
  search?: string,
): Promise<PaginatedAdminUsersResponse> {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(sizePage),
    sizePage: String(sizePage),
  });

  const normalizedSearch = search?.trim();
  if (normalizedSearch) {
    params.set('search', normalizedSearch);
  }

  const response = await api.get<AdminUsersResponseRaw>(`/admin/users?${params.toString()}`);

  if (Array.isArray(response)) {
    return {
      data: response,
      total: response.length,
      page,
      sizePage,
    };
  }

  const data = Array.isArray(response?.data) ? response.data : [];
  const totalFromMeta = response?.meta?.total;
  const pageFromMeta = response?.meta?.page;
  const sizePageFromMeta = response?.meta?.sizePage ?? response?.meta?.limit;

  return {
    data,
    total: typeof response?.total === 'number' ? response.total : typeof totalFromMeta === 'number' ? totalFromMeta : data.length,
    page: typeof response?.page === 'number' ? response.page : typeof pageFromMeta === 'number' ? pageFromMeta : page,
    sizePage:
      typeof response?.sizePage === 'number'
        ? response.sizePage
        : typeof sizePageFromMeta === 'number'
          ? sizePageFromMeta
          : sizePage,
  };
}

export async function validateProfile(id: string, payload: ValidatePayload): Promise<unknown> {
  return api.post(`/admin/professionals/${id}/validate`, payload);
}

export async function verifyDocument(docId: string, payload: VerifyDocumentPayload): Promise<unknown> {
  return api.post(`/admin/documents/${docId}/verify`, payload);
}

export async function fetchIdentityFiles(profileId: string): Promise<{
  dni: string | null;
  identityFrontUrl: string | null;
  identityBackUrl: string | null;
}> {
  return api.get(`/uploads/identity/${profileId}`);
}

// ─── Admin Register Professional ───────────────────────────────

export interface AdminRegisterProfessionalPayload {
  name: string;
  email: string;
  password: string;
  city: string;
  address?: string;
  rubroId: number;
  countryId: number;
  provinceId: number;
  whatsapp: string;
  document: string;
  professionCategoryIds: number[];
  trialEndDate?: string;
  emailVerified: boolean;
  profileStatus: string;
  isActive?: boolean;
}

export interface AdminUpdateProfessionalPayload {
  name?: string;
  firstName?: string;
  lastName?: string;
  dni?: string;
  city?: string;
  countryId?: number | string;
  provinceId?: number | string;
  whatsapp?: string;
  linkedin?: string;
  workModality?: string;
  rubroId?: number | string;
  professionCategoryIds?: number[] | string[];
  services?: string[];
  pricePerHour?: number | string;
  bio?: string;
  tramaMotivation?: string;
  isActive?: boolean;
}

export interface AdminRegisterProfessionalResponse {
  message: string;
  user: {
    id: string;
    email: string;
    role: string;
    emailVerified: boolean;
    profile: {
      id: string;
      name: string;
      profileStatus: string;
      professionCategories: Array<{ id: string; name: string }>;
      rubro: { id: string; name: string };
    };
  };
}

const ADMIN_PROFESSIONALS_PATH = new URL(apiURL('/admin/professionals')).pathname;

function setAuthHeader(): void {
  const token = getToken();
  if (token) {
    api.setHeader('Authorization', `Bearer ${token}`);
  }
}

function toAdminError(error: unknown, fallbackMessage: string): Error & { status?: number; body?: unknown } {
  if (error && typeof error === 'object' && 'message' in error) {
    const errorWithMeta = error as { message?: string; status?: number; body?: unknown };
    const messageFromBody =
      errorWithMeta.body &&
      typeof errorWithMeta.body === 'object' &&
      'message' in errorWithMeta.body &&
      typeof (errorWithMeta.body as { message?: string }).message === 'string'
        ? (errorWithMeta.body as { message: string }).message
        : null;
    const message = messageFromBody || errorWithMeta.message || fallbackMessage;
    return Object.assign(new Error(message), {
      status: errorWithMeta.status,
      body: errorWithMeta.body,
    });
  }
  return Object.assign(new Error(fallbackMessage), { status: undefined, body: undefined });
}

export async function registerProfessional(
  payload: AdminRegisterProfessionalPayload,
): Promise<AdminRegisterProfessionalResponse> {
  try {
    return await api.post<AdminRegisterProfessionalResponse>('/admin/professionals/register', payload);
  } catch (error) {
    throw toAdminError(error, 'Error al registrar profesional');
  }
}

export async function updateProfessional(
  id: string,
  payload: AdminUpdateProfessionalPayload,
): Promise<unknown> {
  try {
    return await api.patch(`/admin/professionals/${id}`, payload);
  } catch (error) {
    throw toAdminError(error, 'Error al actualizar profesional');
  }
}

export async function changeProfessionalPassword(
  id: string,
  password: string,
  confirmPassword: string,
): Promise<unknown> {
  setAuthHeader();
  try {
    return await api.patch(apiURL(`${ADMIN_PROFESSIONALS_PATH}/${id}/password`), {
      password,
      confirmPassword,
    });
  } catch (error) {
    throw toAdminError(error, 'Error al cambiar contraseña');
  }
}

export interface ResendVerificationResponse {
  message: string;
}

export async function resendVerificationEmail(id: string): Promise<ResendVerificationResponse> {
  try {
    return await api.post<ResendVerificationResponse>(`/admin/professionals/${id}/resend-verification`);
  } catch (error) {
    throw toAdminError(error, 'Error al reenviar el email de verificación');
  }
}

export async function uploadProfessionalPhoto(profileId: string, file: File): Promise<void> {
  const formData = new FormData();
  formData.append('file', file);
  try {
    await api.upload(`/uploads/admin/professionals/${profileId}/photo`, formData);
  } catch (error) {
    throw toAdminError(error, 'Error al subir foto');
  }
}

// Traceability: generated by Programmer at 2026-05-20 20:04:28
