/**
 * ProfileService
 * --------------
 * Llamadas a la API para el perfil del profesional autenticado.
 * Endpoints:
 *   - GET    /professionals/by-user/:userId  -> ProfessionalProfile completo
 *   - PATCH  /professionals/:id/personal     -> Actualizar datos personales
 *   - PATCH  /professionals/:id              -> Actualizar datos generales
 */

import { api } from './apiClient';

// ─── Tipos ─────────────────────────────────────────────────────

export interface ProfessionalProfile {
  id: string;
  userId: string;
  name: string;
  bio: string | null;
  photo: string | null;
  services: string[];
  priceMin: string | null;
  priceMax: string | null;
  city: string;
  whatsapp: string | null;
  emailContact: string | null;
  isActive: boolean;
  profileStatus: string;
  completionPct: number;
  rubroId: number | null;
  countryId: number | null;
  provinceId: number | null;
  country?: { id: number; name: string; code: string } | null;
  province?: { id: number; name: string; countryId: number } | null;
  dni: string | null;
  birthDate: string | null;
  linkedin: string | null;
  pricePerHour: string | null;
  workModality: string | null;
  currentOccupation: string | null;
  workType: string | null;
  industry: string | null;
  yearsExperience: number | null;
  tramaMotivation: string | null;
  currentStep: number;
  identityFrontUrl: string | null;
  identityBackUrl: string | null;
  createdAt: string;
  updatedAt: string;
  // Relaciones
  rubro?: { id: number; slug: string; name: string } | null;
  professionCategories?: { id: number; slug: string; name: string; level: number }[];
}

export interface PersonalDataPayload {
  name?: string;
  dni?: string;
  city?: string;
  whatsapp?: string;
  linkedin?: string;
  pricePerHour?: string;
  workModality?: string;
  countryId?: number;
  provinceId?: number;
}

export interface GeneralProfilePayload {
  name?: string;
  bio?: string;
  photo?: string;
  services?: string[];
  priceMin?: string;
  priceMax?: string;
  city?: string;
  emailContact?: string;
  whatsapp?: string;
}

// ─── Fetch ─────────────────────────────────────────────────────

export async function fetchProfile(userId: string): Promise<ProfessionalProfile> {
  return api.get<ProfessionalProfile>(`/professionals/by-user/${userId}`);
}

// ─── Update ────────────────────────────────────────────────────

export async function updatePersonalData(profileId: string, data: PersonalDataPayload): Promise<ProfessionalProfile> {
  return api.patch<ProfessionalProfile>(`/professionals/${profileId}/personal`, data);
}

export async function updateGeneralProfile(
  profileId: string,
  data: GeneralProfilePayload,
): Promise<ProfessionalProfile> {
  return api.patch<ProfessionalProfile>(`/professionals/${profileId}`, data);
}

// ─── Photo ─────────────────────────────────────────────────────

export interface ProfessionalInfoPayload {
  bio?: string;
  currentOccupation?: string;
  workType?: string;
  workTypeOther?: string;
  industry?: string;
  yearsExperience?: number;
  services?: string[];
  professionCategoryIds?: number[];
}

export async function updateProfessionalInfo(
  profileId: string,
  data: ProfessionalInfoPayload,
): Promise<ProfessionalProfile> {
  return api.patch<ProfessionalProfile>(`/professionals/${profileId}/professional`, data);
}

// ─── Photo Upload ──────────────────────────────────────────────

export interface PhotoUploadResponse {
  url: string;
}

export async function uploadProfilePhoto(file: File): Promise<PhotoUploadResponse> {
  const formData = new FormData();
  formData.append('file', file);
  return api.upload<PhotoUploadResponse>('/uploads/photo', formData);
}

export async function deleteProfilePhoto(): Promise<{ deleted: boolean }> {
  return api.del<{ deleted: boolean }>('/uploads/photo');
}

/**
 * Construye la URL pública de la foto de perfil.
 * GET /uploads/photo/:profileId es público (sin auth).
 */
export function getProfilePhotoUrl(profileId: string): string {
  const baseUrl = import.meta.env.PUBLIC_API_BASE_URL || 'http://localhost:3000';
  return `${baseUrl.replace(/\/+$/, '')}/uploads/photo/${profileId}`;
}

// ─── Identity (DNI front/back) ─────────────────────────────────

export interface IdentityUploadResponse {
  message: string;
  front?: string;
  back?: string;
}

export async function uploadIdentity(front: File, back: File): Promise<IdentityUploadResponse> {
  const formData = new FormData();
  formData.append('front', front);
  formData.append('back', back);
  return api.upload<IdentityUploadResponse>('/uploads/identity', formData);
}

// ─── Education CRUD ────────────────────────────────────────────

export interface Education {
  id: string;
  level: string;
  title: string;
  institution: string;
  year: number;
  professionId?: number;
  documents?: DocumentItem[];
}

export interface CreateEducationPayload {
  level: string;
  title: string;
  institution: string;
  year: number;
  professionId?: number;
}

export async function fetchEducation(profileId: string): Promise<Education[]> {
  return api.get<Education[]>(`/professionals/${profileId}/education`);
}

export async function addEducation(profileId: string, data: CreateEducationPayload): Promise<Education> {
  return api.post<Education>(`/professionals/${profileId}/education`, data);
}

export async function updateEducation(profileId: string, educationId: string, data: Partial<CreateEducationPayload>): Promise<Education> {
  return api.patch<Education>(`/professionals/${profileId}/education/${educationId}`, data);
}

export async function deleteEducation(profileId: string, educationId: string): Promise<void> {
  await api.del(`/professionals/${profileId}/education/${educationId}`);
}

// ─── Document uploads ──────────────────────────────────────────

export interface DocumentItem {
  id: string;
  type: string;
  originalName: string;
  mimeType: string;
}

export async function uploadDocument(
  file: File,
  type: 'dni' | 'cv' | 'title' | 'certificate',
  educationId?: string,
  certificationId?: string,
  professionId?: number,
): Promise<DocumentItem> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('type', type);
  if (educationId) formData.append('educationId', educationId);
  if (certificationId) formData.append('certificationId', certificationId);
  if (professionId) formData.append('professionId', String(professionId));
  return api.upload<DocumentItem>('/uploads/document', formData);
}

export async function deleteDocument(docId: string): Promise<void> {
  await api.del(`/uploads/document/${docId}`);
}

export function getDocumentDownloadUrl(docId: string): string {
  const baseUrl = import.meta.env.PUBLIC_API_BASE_URL || 'http://localhost:3000';
  return `${baseUrl.replace(/\/+$/, '')}/uploads/document/${docId}`;
}

// ─── Submit profile for review ─────────────────────────────────

export async function submitProfile(profileId: string): Promise<{ message: string }> {
  return api.post<{ message: string }>(`/professionals/${profileId}/submit`, {});
}

// ─── Motivation ────────────────────────────────────────────────

export async function updateMotivation(profileId: string, tramaMotivation: string): Promise<ProfessionalProfile> {
  return api.patch<ProfessionalProfile>(`/professionals/${profileId}/motivation`, { tramaMotivation });
}

// ─── CV Upload (convenience wrapper) ───────────────────────────

export async function uploadCV(file: File): Promise<DocumentItem> {
  return uploadDocument(file, 'cv');
}
