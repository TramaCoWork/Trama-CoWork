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
  dni: string | null;
  birthDate: string | null;
  linkedin: string | null;
  pricePerHour: string | null;
  workModality: string | null;
  mainProfession: string | null;
  currentOccupation: string | null;
  workType: string | null;
  industry: string | null;
  yearsExperience: number | null;
  createdAt: string;
  updatedAt: string;
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
