import { api, apiURL } from './apiClient';
import { getToken } from './authService';

export interface LandingPage {
  id: number;
  uuid: string;
  title: string;
  body: string;
  isPublic: boolean;
  validFrom: string | null;
  validUntil: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: null;
  fields?: LandingField[];
  _count?: {
    fields: number;
    submissions: number;
  };
}

export interface LandingField {
  id: number;
  landingId: number;
  label: string;
  type: 'text' | 'email' | 'tel' | 'textarea' | 'number' | 'date' | 'select' | 'checkbox';
  required: boolean;
  order: number;
  options: string[];
}

export interface LandingSubmission {
  id: number;
  landingId: number;
  data: Record<string, string>;
  createdAt: string;
}

export interface LandingsMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface CreateLandingPayload {
  title: string;
  body: string;
  isPublic?: boolean;
  validFrom?: string | null;
  validUntil?: string | null;
}

export type UpdateLandingPayload = Partial<CreateLandingPayload>;

export interface CreateLandingFieldPayload {
  label: string;
  type: LandingField['type'];
  required?: boolean;
  order?: number;
  options?: string[];
}

export type UpdateLandingFieldPayload = Partial<CreateLandingFieldPayload>;

const ADMIN_LANDINGS_PATH = new URL(apiURL('/admin/landings')).pathname;

function setAuthHeader(): void {
  const token = getToken();
  if (token) {
    api.setHeader('Authorization', `Bearer ${token}`);
  }
}

export async function listLandings(
  page: number,
  limit: number,
): Promise<{ data: LandingPage[]; meta: LandingsMeta }> {
  setAuthHeader();
  return api.get<{ data: LandingPage[]; meta: LandingsMeta }>(ADMIN_LANDINGS_PATH, { page, limit });
}

export async function getLanding(id: number): Promise<LandingPage> {
  setAuthHeader();
  return api.get<LandingPage>(`${ADMIN_LANDINGS_PATH}/${id}`);
}

export async function createLanding(payload: CreateLandingPayload): Promise<LandingPage> {
  setAuthHeader();
  return api.post<LandingPage>(ADMIN_LANDINGS_PATH, payload);
}

export async function updateLanding(id: number, payload: UpdateLandingPayload): Promise<LandingPage> {
  setAuthHeader();
  return api.patch<LandingPage>(`${ADMIN_LANDINGS_PATH}/${id}`, payload);
}

export async function deleteLanding(id: number): Promise<{ message: string }> {
  setAuthHeader();
  return api.del<{ message: string }>(`${ADMIN_LANDINGS_PATH}/${id}`);
}

export async function addField(
  landingId: number,
  payload: CreateLandingFieldPayload,
): Promise<LandingField> {
  setAuthHeader();
  return api.post<LandingField>(`${ADMIN_LANDINGS_PATH}/${landingId}/fields`, payload);
}

export async function updateField(
  landingId: number,
  fieldId: number,
  payload: UpdateLandingFieldPayload,
): Promise<LandingField> {
  setAuthHeader();
  return api.patch<LandingField>(`${ADMIN_LANDINGS_PATH}/${landingId}/fields/${fieldId}`, payload);
}

export async function deleteField(landingId: number, fieldId: number): Promise<{ message: string }> {
  setAuthHeader();
  return api.del<{ message: string }>(`${ADMIN_LANDINGS_PATH}/${landingId}/fields/${fieldId}`);
}

export async function reorderFields(landingId: number, fieldIds: number[]): Promise<{ message: string }> {
  setAuthHeader();
  return api.patch<{ message: string }>(`${ADMIN_LANDINGS_PATH}/${landingId}/fields/reorder`, { fieldIds });
}

export async function listSubmissions(
  landingId: number,
  page: number,
  limit: number,
): Promise<{ data: LandingSubmission[]; meta: LandingsMeta }> {
  setAuthHeader();
  return api.get<{ data: LandingSubmission[]; meta: LandingsMeta }>(
    `${ADMIN_LANDINGS_PATH}/${landingId}/submissions`,
    { page, limit },
  );
}

export async function deleteSubmission(
  landingId: number,
  subId: number,
): Promise<{ message: string }> {
  setAuthHeader();
  return api.del<{ message: string }>(`${ADMIN_LANDINGS_PATH}/${landingId}/submissions/${subId}`);
}
