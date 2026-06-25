/**
 * SubscriptionService
 * -------------------
 * Llamadas a la API para planes de suscripción, suscripciones y pagos.
 */

import { api, apiURL } from './apiClient';

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
  discount?: {
    id: string;
    discountAmount: string;
    description: string | null;
    isActive: boolean;
    fromDate: string;
    toDate: string;
    billingCycles: number | null;
    maxUses: number | null;
    currentUses: number;
    perUserLimit: number | null;
    deletedAt: string | null;
    createdAt: string;
    updatedAt: string;
  } | null;
  createdAt: string;
  updatedAt: string;
}

export type BricksCheckoutPlan = SubscriptionPlan;

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

// ─── Checkout Bricks ────────────────────────────────────────

export interface BricksConfig {
  publicKey: string;
}

// — Pago único (POST /subscriptions/bricks/pay) —
export interface BricksPayBody {
  planId: string;
  token: string;
  paymentMethodId: string;
  installments: number;
  paymentType?: string;
  issuerId?: string;
  payerEmail?: string;
  identificationType?: string;
  identificationNumber?: string;
}

export type BricksPayStatus = 'approved' | 'pending' | 'rejected';

export interface BricksPayResponse {
  subscriptionId: string;
  status: BricksPayStatus;
  paymentStatus: string;
  statusDetail: string;
  endDate?: string;
  message: string;
}

// — Suscripción recurrente (POST /subscriptions/bricks/subscribe) —
export interface BricksSubscribeBody {
  planId: string;
  token: string;
  payerEmail?: string;
  backUrl?: string;
}

export type BricksSubscribeStatus = 'authorized' | 'active' | 'pending';

export interface BricksSubscribeResponse {
  subscriptionId: string;
  status: BricksSubscribeStatus;
  preapprovalId: string;
  nextPaymentDate?: string;
  message: string;
}

export interface InitLinkResponse {
  subscriptionId: string;
  initPoint: string;
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

// ─── Checkout Bricks ────────────────────────────────────────

export function fetchBricksConfig(): Promise<BricksConfig> {
  return api.get<BricksConfig>('/subscriptions/bricks/config');
}

export function payWithBricks(body: BricksPayBody): Promise<BricksPayResponse> {
  return api.post<BricksPayResponse>('/subscriptions/bricks/pay', body);
}

export function subscribeWithBricks(body: BricksSubscribeBody): Promise<BricksSubscribeResponse> {
  return api.post<BricksSubscribeResponse>('/subscriptions/bricks/subscribe', body);
}

export function getInitLink(planId: string): Promise<InitLinkResponse> {
  return api.get<InitLinkResponse>(apiURL('/subscriptions/init-link'), { planId });
}

// Traceability: implementation by Programmer at 2026-06-22 09:33:21
