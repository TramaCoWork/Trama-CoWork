import { api, apiURL } from './apiClient';
import { getToken } from './authService';

export interface Job {
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

export interface JobApplication {
  id: string;
  jobId: string;
  userId: string;
  coverLetter: string | null;
  createdAt: string;
  job?: Job;
}

export interface JobsMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface CreateJobPayload {
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

export type UpdateJobPayload = Partial<CreateJobPayload>;

const ADMIN_JOBS_PATH = new URL(apiURL('/admin/work')).pathname;

function setAuthHeader(): void {
  const token = getToken();
  if (token) {
    api.setHeader('Authorization', `Bearer ${token}`);
  }
}

export async function listJobs(
  page: number,
  limit: number,
  status?: string,
  categoryId?: number,
): Promise<{ data: Job[]; meta: JobsMeta }> {
  setAuthHeader();
  return api.get<{ data: Job[]; meta: JobsMeta }>(ADMIN_JOBS_PATH, {
    page,
    limit,
    status,
    categoryId,
  });
}

export async function getJob(id: string): Promise<Job> {
  setAuthHeader();
  return api.get<Job>(`${ADMIN_JOBS_PATH}/${id}`);
}

export async function createJob(payload: CreateJobPayload): Promise<Job> {
  setAuthHeader();
  return api.post<Job>(ADMIN_JOBS_PATH, payload);
}

export async function updateJob(id: string, payload: UpdateJobPayload): Promise<Job> {
  setAuthHeader();
  return api.patch<Job>(`${ADMIN_JOBS_PATH}/${id}`, payload);
}

export async function updateJobStatus(id: string, status: 'active' | 'paused'): Promise<Job> {
  setAuthHeader();
  return api.patch<Job>(`${ADMIN_JOBS_PATH}/${id}/status`, { status });
}

export async function deleteJob(id: string): Promise<{ message: string }> {
  setAuthHeader();
  return api.del<{ message: string }>(`${ADMIN_JOBS_PATH}/${id}`);
}

export async function listApplications(
  id: string,
  page: number,
  limit: number,
): Promise<{ data: JobApplication[]; meta: JobsMeta }> {
  setAuthHeader();
  return api.get<{ data: JobApplication[]; meta: JobsMeta }>(`${ADMIN_JOBS_PATH}/${id}/applications`, {
    page,
    limit,
  });
}
