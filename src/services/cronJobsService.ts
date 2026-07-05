import { api, apiURL } from './apiClient';
import { getToken } from './authService';

export interface CronJob {
  id: string;
  key: string;
  name: string;
  schedule: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RunningJob {
  key: string;
  running: boolean;
  nextRun: string | null;
}

export interface JobExecution {
  id: string;
  jobName: string;
  startedAt: string;
  finishedAt: string | null;
  status: 'running' | 'completed' | 'failed';
  durationMs: number | null;
  processedCount: number | null;
  errorMessage: string | null;
  errorStack: string | null;
  metadata: object | null;
}

export interface JobsMeta {
  page: number;
  sizePage: number;
  total: number;
  totalPages?: number;
}

export interface JobsResponse {
  data: JobExecution[];
  total: number;
  page: number;
  sizePage: number;
}

export interface RunJobResult {
  message: string;
  jobName: string;
}

export interface RestartJobResult {
  message: string;
  key: string;
  schedule: string;
}

const CRON_JOBS_PATH = new URL(apiURL('/admin/cron-jobs')).pathname;
const RUNNING_CRON_JOBS_PATH = new URL(apiURL('/admin/cron-jobs/running')).pathname;
const ACTIVE_CRON_JOBS_PATH = new URL(apiURL('/admin/cron-jobs/active')).pathname;
const JOBS_PATH = new URL(apiURL('/admin/jobs')).pathname;

function setAuthHeader(): void {
  const token = getToken();
  if (token) {
    api.setHeader('Authorization', `Bearer ${token}`);
  }
}

function toCronJobsError(error: unknown, fallbackMessage: string): Error & { status?: number; body?: unknown } {
  if (error && typeof error === 'object') {
    const parsedError = error as { message?: string; status?: number; body?: unknown };
    const messageFromBody =
      parsedError.body &&
      typeof parsedError.body === 'object' &&
      'message' in parsedError.body &&
      typeof (parsedError.body as { message?: unknown }).message === 'string'
        ? (parsedError.body as { message: string }).message
        : null;

    return Object.assign(new Error(messageFromBody || parsedError.message || fallbackMessage), {
      status: parsedError.status,
      body: parsedError.body,
    });
  }

  return Object.assign(new Error(fallbackMessage), { status: undefined, body: undefined });
}

export async function listCronJobs(): Promise<CronJob[]> {
  setAuthHeader();
  try {
    return await api.get<CronJob[]>(CRON_JOBS_PATH);
  } catch (error) {
    throw toCronJobsError(error, 'Error listing cron jobs');
  }
}

export async function listActiveCronJobs(): Promise<CronJob[]> {
  setAuthHeader();
  try {
    return await api.get<CronJob[]>(ACTIVE_CRON_JOBS_PATH);
  } catch (error) {
    throw toCronJobsError(error, 'Error listing active cron jobs');
  }
}

export async function listRunningJobs(): Promise<RunningJob[]> {
  setAuthHeader();
  try {
    return await api.get<RunningJob[]>(RUNNING_CRON_JOBS_PATH);
  } catch (error) {
    throw toCronJobsError(error, 'Error listing running jobs');
  }
}

export async function updateCronJob(
  id: string,
  payload: { name?: string; schedule?: string; active?: boolean },
): Promise<CronJob> {
  setAuthHeader();
  try {
    return await api.patch<CronJob>(`${CRON_JOBS_PATH}/${id}`, payload);
  } catch (error) {
    throw toCronJobsError(error, `Error updating cron job ${id}`);
  }
}

export async function getAvailableJobs(): Promise<CronJob[]> {
  return listCronJobs();
}

export async function listJobExecutions(
  page: number,
  sizePage: number,
  jobName?: string,
): Promise<JobsResponse> {
  setAuthHeader();
  try {
    return await api.get<JobsResponse>(JOBS_PATH, {
      page,
      sizePage,
      jobName,
    });
  } catch (error) {
    throw toCronJobsError(error, 'Error listing job executions');
  }
}

export async function runJob(jobName: string): Promise<RunJobResult> {
  setAuthHeader();
  try {
    return await api.post<RunJobResult>(`${JOBS_PATH}/${encodeURIComponent(jobName)}/run`);
  } catch (error) {
    throw toCronJobsError(error, `Error running job ${jobName}`);
  }
}

export async function restartJob(jobKey: string): Promise<RestartJobResult> {
  setAuthHeader();
  try {
    return await api.post<RestartJobResult>(`${JOBS_PATH}/${encodeURIComponent(jobKey)}/restart`);
  } catch (error) {
    throw toCronJobsError(error, `Error restarting job ${jobKey}`);
  }
}

// Traceability: implementation by Programmer at 2026-07-04 00:00:00
