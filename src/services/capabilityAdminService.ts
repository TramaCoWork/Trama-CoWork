import { api } from './apiClient';
import { getToken } from './authService';
import type { Plan } from './planService';

export interface Capability {
  key: string;
  description: string;
  createdAt: string;
}

function setAuthHeader(): void {
  const token = getToken();
  if (token) {
    api.setHeader('Authorization', `Bearer ${token}`);
  }
}

export function getCapabilities(): Promise<Capability[]> {
  setAuthHeader();
  return api.get<Capability[]>('/admin/capabilities');
}

export function assignCapability(planId: string, key: string): Promise<void> {
  setAuthHeader();
  return api.post<void>(`/admin/subscription-plans/${planId}/capabilities`, { key });
}

export function removeCapability(planId: string, key: string): Promise<void> {
  setAuthHeader();
  return api.del<void>(`/admin/subscription-plans/${planId}/capabilities/${key}`);
}

export function putPlanCapabilities(planId: string, keys: string[]): Promise<Plan> {
  setAuthHeader();
  return api.put<Plan>(`/admin/subscription-plans/${planId}/capabilities`, { keys });
}

// Traceability: implementation by Programmer at 2026-10-05
