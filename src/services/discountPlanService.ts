import { api, apiURL } from './apiClient';
import { getToken } from './authService';

export interface DiscountPlan {
  id: string;
  subscriptionPlanId: string;
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
}

export interface CreateDiscountPlanDto {
  subscriptionPlanId: string;
  discountAmount: number;
  description?: string;
  isActive?: boolean;
  fromDate: string;
  toDate: string;
  billingCycles?: number;
  maxUses?: number;
  perUserLimit?: number;
}

export interface UpdateDiscountPlanDto {
  discountAmount?: number;
  description?: string;
  isActive?: boolean;
  fromDate?: string;
  toDate?: string;
  billingCycles?: number;
  maxUses?: number;
  perUserLimit?: number;
}

export interface DiscountPlanFilters {
  subscriptionPlanId?: string;
  isActive?: boolean;
}

type ApiError = Error & {
  status?: number;
  body?: unknown;
};

const DISCOUNT_PLANS_PATH = new URL(apiURL('/admin/discount-plans')).pathname;

function setAuthHeader(): void {
  const token = getToken();
  if (token) {
    api.setHeader('Authorization', `Bearer ${token}`);
  }
}

function throwErrorWithBodyMessageOn400(error: unknown): never {
  const apiError = error as ApiError;
  if (apiError.status === 400 && apiError.body && typeof apiError.body === 'object') {
    const body = apiError.body as { message?: unknown };
    if (typeof body.message === 'string') {
      throw new Error(body.message);
    }
  }
  throw error;
}

export async function fetchDiscountPlans(filters?: DiscountPlanFilters): Promise<DiscountPlan[]> {
  setAuthHeader();
  try {
    return await api.get<DiscountPlan[]>(DISCOUNT_PLANS_PATH, filters);
  } catch (error) {
    throwErrorWithBodyMessageOn400(error);
  }
}

export async function createDiscountPlan(dto: CreateDiscountPlanDto): Promise<DiscountPlan> {
  setAuthHeader();
  try {
    return await api.post<DiscountPlan>(DISCOUNT_PLANS_PATH, dto);
  } catch (error) {
    throwErrorWithBodyMessageOn400(error);
  }
}

export async function updateDiscountPlan(id: string, dto: UpdateDiscountPlanDto): Promise<DiscountPlan> {
  setAuthHeader();
  try {
    return await api.patch<DiscountPlan>(`${DISCOUNT_PLANS_PATH}/${id}`, dto);
  } catch (error) {
    throwErrorWithBodyMessageOn400(error);
  }
}

export async function deleteDiscountPlan(id: string): Promise<void> {
  setAuthHeader();
  const token = getToken();

  try {
    const response = await fetch(apiURL(`${DISCOUNT_PLANS_PATH}/${id}`), {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    if (!response.ok) {
      let errorBody: unknown;
      try {
        errorBody = await response.json();
      } catch {
        errorBody = null;
      }

      const error = new Error(
        `[DELETE] ${DISCOUNT_PLANS_PATH}/${id} - ${response.status} ${response.statusText}`,
      ) as ApiError;
      error.status = response.status;
      error.body = errorBody;
      throw error;
    }
  } catch (error) {
    throwErrorWithBodyMessageOn400(error);
  }
}

// Traceability: implementation by Programmer at 2026-06-24 00:00:00
