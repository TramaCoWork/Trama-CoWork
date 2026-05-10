/**
 * educationService
 * ----------------
 * CRUD para formación académica, certificaciones y documentos adjuntos.
 */

import { api } from './apiClient';

// ─── Types ──────────────────────────────────────────────────

export type EducationLevel = 'secundario' | 'terciario' | 'universitario' | 'posgrado' | 'maestria' | 'doctorado' | 'certificacion';

export type DocumentVerificationStatus = 'pending' | 'approved' | 'rejected';

export interface Document {
  id: string;
  professionalId: string;
  type: string;
  fileUrl: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  uploadedAt: string;
  educationId: string | null;
  certificationId: string | null;
  verificationStatus: DocumentVerificationStatus;
  verifiedBy: string | null;
  verifiedAt: string | null;
  verificationNotes: string | null;
  verificationType: 'manual' | 'ai' | null;
}

export interface Education {
  id: string;
  professionalId: string;
  level: EducationLevel;
  title: string;
  institution: string;
  year: number | null;
  professionId?: number | null;
  createdAt: string;
  updatedAt: string;
  documents?: Document[];
}

export interface CreateEducationBody {
  level: EducationLevel;
  title: string;
  institution: string;
  year?: number;
  professionId?: number;
}

// ─── Education ──────────────────────────────────────────────

export function fetchEducation(profileId: string): Promise<Education[]> {
  return api.get<Education[]>(`/professionals/${profileId}/education`);
}

export function addEducation(profileId: string, body: CreateEducationBody): Promise<Education> {
  return api.post<Education>(`/professionals/${profileId}/education`, body);
}

export function deleteEducation(profileId: string, educationId: string): Promise<{ deleted: boolean }> {
  return api.del<{ deleted: boolean }>(`/professionals/${profileId}/education/${educationId}`);
}

// ─── Documents ──────────────────────────────────────────────

export function uploadDocument(
  file: File,
  type: 'title' | 'certificate',
  associationId: string,
  associationType: 'education' | 'certification',
): Promise<Document> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('type', type);

  if (associationType === 'education') {
    formData.append('educationId', associationId);
  } else {
    formData.append('certificationId', associationId);
  }

  return api.upload<Document>('/uploads/document', formData);
}

export function deleteDocument(documentId: string): Promise<{ deleted: boolean }> {
  return api.del<{ deleted: boolean }>(`/uploads/document/${documentId}`);
}

export function getDocumentDownloadUrl(documentId: string): string {
  return api.downloadUrl(`/uploads/document/${documentId}`);
}
