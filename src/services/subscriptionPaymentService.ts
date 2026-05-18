import { api } from './apiClient';

export interface SubscriptionPaymentUser {
  id: string;
  email: string;
}

export interface SubscriptionPaymentPlan {
  id: string;
  name: string;
}

export interface SubscriptionPaymentSubscription {
  externalId: string;
  user: SubscriptionPaymentUser;
  plan: SubscriptionPaymentPlan;
}

export interface SubscriptionPayment {
  id: string;
  subscriptionId: string;
  externalId: string | null;
  amount: string;
  status: string;
  attemptNumber: number;
  paidAt: string | null;
  failedAt: string | null;
  failureReason: string | null;
  paymentMethod: string | null;
  paymentMethodId: string | null;
  cardLastFourDigits: string | null;
  installments: number | null;
  statusDetail: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
  subscription: SubscriptionPaymentSubscription;
}

export interface SubscriptionPaymentFilters {
  page?: number;
  sizePage?: number;
  status?: string;
  search?: string;
}

export interface SubscriptionPaymentResponse {
  data: SubscriptionPayment[];
  total: number;
  page: number;
  sizePage: number;
}

export function getAdminPayments(
  filters: SubscriptionPaymentFilters = {},
): Promise<SubscriptionPaymentResponse> {
  return api.get<SubscriptionPaymentResponse>('/admin/subscription-payments', filters);
}
