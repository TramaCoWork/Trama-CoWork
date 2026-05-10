/**
 * AdminService
 * ------------
 * API calls for admin panel.
 */

import { api } from './apiClient';

// ─── Types ─────────────────────────────────────────────────────

export interface AdminProfessional {
  id: string;
  userId: string;
  name: string;
  bio: string | null;
  photo: string | null;
  services: string[];
  priceMin: string | null;
  priceMax: string | null;
  pricePerHour: string | null;
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
  rubro?: { id: number; slug: string; name: string } | null;
  country?: { id: number; name: string; code: string } | null;
  province?: { id: number; name: string } | null;
  professionCategories?: { id: number; slug: string; name: string; level: number }[];
  user?: { id: string; email: string; role: string };
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  sizePage: number;
}

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
