import { api } from './apiClient';

export interface AdminSubscriptionUser {
  id: string;
  email: string;
  name?: string;
}

export interface AdminSubscriptionPlan {
  id: string;
  name: string;
  amount: string;
  frequencyType: string;
}

export interface AdminSubscription {
  id: string;
  status: string;
  startDate: string;
  endDate?: string;
  nextPaymentDate?: string;
  user: AdminSubscriptionUser;
  plan: AdminSubscriptionPlan;
  _count: { payments: number };
}

export interface AdminSubscriptionFilters {
  page?: number;
  sizePage?: number;
  status?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface AdminSubscriptionResponse {
  data: AdminSubscription[];
  total: number;
  page: number;
  sizePage: number;
}

export function getAdminSubscriptions(filters: AdminSubscriptionFilters = {}): Promise<AdminSubscriptionResponse> {
  return api.get<AdminSubscriptionResponse>('/admin/subscriptions', filters);
}
