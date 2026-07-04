import { api, apiURL } from './apiClient';
import { getToken } from './authService';
import type { Job, JobApplication, JobsMeta } from './jobsAdminService';

export type { Job, JobApplication, JobsMeta } from './jobsAdminService';

const JOBS_PATH = new URL(apiURL('/jobs')).pathname;

function setAuthHeader(): void {
  const token = getToken();
  if (token) {
    api.setHeader('Authorization', `Bearer ${token}`);
  }
}

export async function listJobs(
  page: number,
  limit: number,
  categoryId?: number,
): Promise<{ data: Job[]; meta: JobsMeta }> {
  setAuthHeader();
  return api.get<{ data: Job[]; meta: JobsMeta }>(JOBS_PATH, {
    page,
    limit,
    categoryId,
  });
}

export async function getJob(id: string): Promise<Job> {
  setAuthHeader();
  return api.get<Job>(`${JOBS_PATH}/${id}`);
}

export async function applyToJob(id: string, coverLetter?: string): Promise<JobApplication> {
  setAuthHeader();
  return api.post<JobApplication>(`${JOBS_PATH}/${id}/apply`, { coverLetter });
}

export async function getMyApplications(
  page: number,
  limit: number,
): Promise<{ data: JobApplication[]; meta: JobsMeta }> {
  setAuthHeader();
  return api.get<{ data: JobApplication[]; meta: JobsMeta }>(`${JOBS_PATH}/my-applications`, {
    page,
    limit,
  });
}
