import { api, apiURL } from './apiClient';
import { getToken } from './authService';

const ADMIN_SUBSCRIPTIONS_PATH = new URL(apiURL('/admin/subscriptions')).pathname;

const UPDATE_AMOUNT_ERROR_MESSAGES = {
  notFound: 'Suscripción no encontrada.',
  noPreapproval: 'La suscripción no tiene PreApproval activo en MercadoPago.',
  mercadopagoRejected: 'MercadoPago rechazó la actualización. Intentá de nuevo más tarde.',
  generic: 'Error al actualizar el monto. Intentá de nuevo.',
} as const;

const KNOWN_UPDATE_AMOUNT_ERRORS = new Set<string>(Object.values(UPDATE_AMOUNT_ERROR_MESSAGES));

function setAuthHeader(): void {
  const token = getToken();
  if (token) {
    api.setHeader('Authorization', `Bearer ${token}`);
  }
}

function getUpdateAmountErrorMessage(status: number): string {
  if (status === 404) return UPDATE_AMOUNT_ERROR_MESSAGES.notFound;
  if (status === 422) return UPDATE_AMOUNT_ERROR_MESSAGES.noPreapproval;
  if (status === 500) return UPDATE_AMOUNT_ERROR_MESSAGES.mercadopagoRejected;
  return UPDATE_AMOUNT_ERROR_MESSAGES.generic;
}

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

export interface UpdateAmountResponse {
  subscriptionId: string;
  preapprovalId: string;
  newAmount: number;
  updatedAt: string;
}

export function getAdminSubscriptions(filters: AdminSubscriptionFilters = {}): Promise<AdminSubscriptionResponse> {
  return api.get<AdminSubscriptionResponse>('/admin/subscriptions', filters);
}

export async function updateSubscriptionAmount(id: string, amount: number): Promise<UpdateAmountResponse> {
  setAuthHeader();
  const token = getToken();

  try {
    const response = await fetch(apiURL(`${ADMIN_SUBSCRIPTIONS_PATH}/${id}/amount`), {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ amount }),
    });

    if (!response.ok) {
      throw new Error(getUpdateAmountErrorMessage(response.status));
    }

    return (await response.json()) as UpdateAmountResponse;
  } catch (error) {
    if (error instanceof Error && KNOWN_UPDATE_AMOUNT_ERRORS.has(error.message)) {
      throw error;
    }
    throw new Error(UPDATE_AMOUNT_ERROR_MESSAGES.generic);
  }
}
