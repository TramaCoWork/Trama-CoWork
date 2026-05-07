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
  dni: string | null;
  birthDate: string | null;
  linkedin: string | null;
  pricePerHour: string | null;
  workModality: string | null;
  currentOccupation: string | null;
  workType: string | null;
  industry: string | null;
  yearsExperience: number | null;
  createdAt: string;
  updatedAt: string;
  // Relaciones
  rubro?: { id: number; slug: string; name: string } | null;
  professionCategories?: { id: number; slug: string; name: string; level: number }[];
}

export interface PersonalDataPayload {
  name?: string;
  city?: string;
  whatsapp?: string;
  linkedin?: string;
  pricePerHour?: string;
  workModality?: string;
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
