import { api, apiURL } from './apiClient';
import { getToken } from './authService';
import type { Work, WorkApplication, WorksMeta } from './workAdminService';

export type { Work, WorkApplication, WorksMeta } from './workAdminService';

const JOBS_PATH = new URL(apiURL('/work')).pathname;

function setAuthHeader(): void {
  const token = getToken();
  if (token) {
    api.setHeader('Authorization', `Bearer ${token}`);
  }
}

export async function listWorks(
  page: number,
  limit: number,
  categoryId?: number,
): Promise<{ data: Work[]; meta: WorksMeta }> {
  setAuthHeader();
  return api.get<{ data: Work[]; meta: WorksMeta }>(JOBS_PATH, {
    page,
    limit,
    categoryId,
  });
}

export async function getWork(id: string): Promise<Work> {
  setAuthHeader();
  return api.get<Work>(`${JOBS_PATH}/${id}`);
}

export async function applyToWork(id: string, coverLetter?: string): Promise<WorkApplication> {
  setAuthHeader();
  return api.post<WorkApplication>(`${JOBS_PATH}/${id}/apply`, { coverLetter });
}

export async function getMyWorkApplications(
  page: number,
  limit: number,
): Promise<{ data: WorkApplication[]; meta: WorksMeta }> {
  setAuthHeader();
  return api.get<{ data: WorkApplication[]; meta: WorksMeta }>(`${JOBS_PATH}/my-applications`, {
    page,
    limit,
  });
}
