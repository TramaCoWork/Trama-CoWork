/**
 * SubscriptionService
 * -------------------
 * Llamadas a la API para planes de suscripción, suscripciones y pagos.
 */

import { api } from './apiClient';

// ─── Types ──────────────────────────────────────────────────

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string | null;
  amount: number;
  currency: string;
  frequency: number;
  frequencyType: 'days' | 'months' | 'years';
  trialDays: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Subscription {
  id: string;
  userId: string;
  planId: string;
  status: string;
  payerEmail: string;
  mpSubscriptionId: string | null;
  initPoint: string | null;
  createdAt: string;
  updatedAt: string;
  cancelledAt: string | null;
  plan?: SubscriptionPlan;
}

export interface SubscriptionPayment {
  id: string;
  subscriptionId: string;
  amount: number;
  currency: string;
  status: string;
  mpPaymentId: string | null;
  paidAt: string | null;
  createdAt: string;
}

export interface PaginatedPayments {
  data: SubscriptionPayment[];
  total: number;
  page: number;
  sizePage: number;
}

export interface CreateSubscriptionBody {
  planId: string;
  payerEmail: string;
  backUrl: string;
}

export interface CreateSubscriptionResponse {
  subscription: Subscription;
  initPoint: string;
}

export interface CancelSubscriptionBody {
  reason?: string;
}

// ─── Plans ──────────────────────────────────────────────────

export function fetchPlans(): Promise<SubscriptionPlan[]> {
  return api.get<SubscriptionPlan[]>('/subscription-plans');
}

export function fetchPlanById(id: string): Promise<SubscriptionPlan> {
  return api.get<SubscriptionPlan>(`/subscription-plans/${id}`);
}

// ─── Subscriptions ──────────────────────────────────────────

export function createSubscription(body: CreateSubscriptionBody): Promise<CreateSubscriptionResponse> {
  return api.post<CreateSubscriptionResponse>('/subscriptions', body);
}

export function getMySubscription(): Promise<Subscription> {
  return api.get<Subscription>('/subscriptions/me');
}

export function cancelMySubscription(body?: CancelSubscriptionBody): Promise<Subscription> {
  return api.patch<Subscription>('/subscriptions/me/cancel', body || {});
}

// ─── Payments ───────────────────────────────────────────────

export function getMyPayments(page = 1, sizePage = 10): Promise<PaginatedPayments> {
  return api.get<PaginatedPayments>('/subscriptions/me/payments', { page, sizePage });
}
