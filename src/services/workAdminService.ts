import { api, apiURL } from './apiClient';
import { getToken } from './authService';

export interface Work {
  id: string;
  title: string;
  description: string;
  email: string;
  status: 'active' | 'paused';
  validFrom: string | null;
  validUntil: string | null;
  clickCount: number;
  companyName: string | null;
  companyLogo: string | null;
  categoryIds: number[];
  createdAt: string;
  updatedAt: string;
  deletedAt: null;
  _count?: { applications: number };
}

export interface WorkApplication {
  id: string;
  jobId: string;
  userId: string;
  coverLetter: string | null;
  createdAt: string;
  job?: Work;
}

export interface WorksMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface CreateWorkPayload {
  title: string;
  description: string;
  email: string;
  status?: 'active' | 'paused';
  validFrom?: string | null;
  validUntil?: string | null;
  companyName?: string | null;
  companyLogo?: string | null;
  categoryIds?: number[];
}

export type UpdateWorkPayload = Partial<CreateWorkPayload>;

const ADMIN_JOBS_PATH = new URL(apiURL('/admin/work')).pathname;

function setAuthHeader(): void {
  const token = getToken();
  if (token) {
    api.setHeader('Authorization', `Bearer ${token}`);
  }
}

export async function listWorks(
  page: number,
  limit: number,
  status?: string,
  categoryId?: number,
): Promise<{ data: Work[]; meta: WorksMeta }> {
  setAuthHeader();
  return api.get<{ data: Work[]; meta: WorksMeta }>(ADMIN_JOBS_PATH, {
    page,
    limit,
    status,
    categoryId,
  });
}

export async function getWork(id: string): Promise<Work> {
  setAuthHeader();
  return api.get<Work>(`${ADMIN_JOBS_PATH}/${id}`);
}

export async function createWork(payload: CreateWorkPayload): Promise<Work> {
  setAuthHeader();
  return api.post<Work>(ADMIN_JOBS_PATH, payload);
}

export async function updateWork(id: string, payload: UpdateWorkPayload): Promise<Work> {
  setAuthHeader();
  return api.patch<Work>(`${ADMIN_JOBS_PATH}/${id}`, payload);
}

export async function updateWorkStatus(id: string, status: 'active' | 'paused'): Promise<Work> {
  setAuthHeader();
  return api.patch<Work>(`${ADMIN_JOBS_PATH}/${id}/status`, { status });
}

export async function deleteWork(id: string): Promise<{ message: string }> {
  setAuthHeader();
  return api.del<{ message: string }>(`${ADMIN_JOBS_PATH}/${id}`);
}

export async function listWorkApplications(
  id: string,
  page: number,
  limit: number,
): Promise<{ data: WorkApplication[]; meta: WorksMeta }> {
  setAuthHeader();
  return api.get<{ data: WorkApplication[]; meta: WorksMeta }>(`${ADMIN_JOBS_PATH}/${id}/applications`, {
    page,
    limit,
  });
}
