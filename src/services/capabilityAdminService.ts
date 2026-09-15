import { api } from './apiClient';
import { getToken } from './authService';

export interface Capability {
  id: string;
  name: string;
  description: string | null;
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

export function assignCapability(planId: string, capabilityId: string): Promise<void> {
  setAuthHeader();
  return api.post<void>(`/admin/subscription-plans/${planId}/capabilities`, { capabilityId });
}

export function removeCapability(planId: string, capabilityId: string): Promise<void> {
  setAuthHeader();
  return api.del<void>(`/admin/subscription-plans/${planId}/capabilities`, { capabilityId });
}

// Traceability: implementation by Programmer at 2026-09-15
