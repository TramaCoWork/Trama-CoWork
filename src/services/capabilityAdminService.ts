import { api } from './apiClient';
import { getToken } from './authService';

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

// Traceability: implementation by Programmer at 2026-09-15
