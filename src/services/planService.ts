import { api } from './apiClient';

export interface Plan {
  id: string;
  name: string;
  description: string | null;
  amount: string;
  currency: string;
  frequency: number;
  frequencyType: string;
  trialDays: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePlanDto {
  name: string;
  description?: string | null;
  amount: number;
  currency: string;
  frequency: number;
  frequencyType: string;
  trialDays: number;
  isActive: boolean;
}

export type UpdatePlanDto = Partial<CreatePlanDto>;

export interface AdminPlansFilters {
  isActive?: boolean;
  frequencyType?: string;
  hasTrial?: boolean;
  page?: number;
  sizePage?: number;
}

export interface AdminPlansResponse {
  data: Plan[];
  total: number;
  page: number;
  sizePage: number;
}

export function getPlans(): Promise<Plan[]> {
  return api.get<Plan[]>('/subscription-plans');
}

export function getAdminPlans(filters: AdminPlansFilters = {}): Promise<AdminPlansResponse> {
  const params = new URLSearchParams();

  if (filters.isActive !== undefined) params.set('isActive', String(filters.isActive));
  if (filters.frequencyType) params.set('frequencyType', filters.frequencyType);
  if (filters.hasTrial !== undefined) params.set('hasTrial', String(filters.hasTrial));
  if (filters.page !== undefined) params.set('page', String(filters.page));
  if (filters.sizePage !== undefined) params.set('sizePage', String(filters.sizePage));

  const query = params.toString();
  const path = query ? `/admin/subscription-plans?${query}` : '/admin/subscription-plans';
  return api.get<AdminPlansResponse>(path);
}

export function createPlan(dto: CreatePlanDto): Promise<Plan> {
  return api.post<Plan>('/subscription-plans', {
    ...dto,
    amount: Number(dto.amount),
  });
}

export function updatePlan(id: string, dto: UpdatePlanDto): Promise<Plan> {
  return api.patch<Plan>(`/subscription-plans/${id}`, {
    ...dto,
    ...(dto.amount !== undefined ? { amount: Number(dto.amount) } : {}),
  });
}

export async function deletePlan(id: string): Promise<void> {
  await api.del(`/subscription-plans/${id}`);
}

export function getFrequencyTypes(): Promise<string[]> {
  return api.get<string[]>('/catalogs/frequency-types');
}

export function getSubscriptionStatuses(): Promise<string[]> {
  return api.get<string[]>('/catalogs/subscription-statuses');
}
