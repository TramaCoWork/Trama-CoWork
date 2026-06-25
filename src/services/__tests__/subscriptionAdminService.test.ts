import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../apiClient', () => ({
  apiURL: (path: string) => `http://localhost:3000${path.startsWith('/') ? path : `/${path}`}`,
  api: {
    get: vi.fn(),
    setHeader: vi.fn(),
  },
}));

vi.mock('../authService', () => ({
  getToken: vi.fn(),
}));

import { api } from '../apiClient';
import { getAdminSubscriptions, updateSubscriptionAmount } from '../subscriptionAdminService';

describe('SubscriptionAdminService', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    vi.stubGlobal('fetch', vi.fn());
    const { getToken } = await import('../authService');
    vi.mocked(getToken).mockReturnValue('test-token');
  });

  it('llama a /admin/subscriptions sin filtros', async () => {
    const mockResponse = { data: [], total: 0, page: 1, sizePage: 10 };
    (api.get as any).mockResolvedValue(mockResponse);

    const result = await getAdminSubscriptions();

    expect(api.get).toHaveBeenCalledWith('/admin/subscriptions', {});
    expect(result).toEqual(mockResponse);
  });

  it('llama a /admin/subscriptions con filtros', async () => {
    const mockResponse = { data: [], total: 1, page: 2, sizePage: 5 };
    (api.get as any).mockResolvedValue(mockResponse);

    const filters = {
      page: 2,
      sizePage: 5,
      status: 'sub_approved',
      search: 'user@example.com',
      dateFrom: '2026-01-01',
      dateTo: '2026-12-31',
    };

    await getAdminSubscriptions(filters);

    expect(api.get).toHaveBeenCalledWith('/admin/subscriptions', filters);
  });

  it('propaga errores de la API', async () => {
    (api.get as any).mockRejectedValue(new Error('Network error'));

    await expect(getAdminSubscriptions({ page: 1 })).rejects.toThrow('Network error');
  });
});

describe('updateSubscriptionAmount', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    vi.stubGlobal('fetch', vi.fn());
    const { getToken } = await import('../authService');
    vi.mocked(getToken).mockReturnValue('test-token');
  });

  it('resuelve en 200 y envía PATCH con body y Authorization', async () => {
    const responseData = {
      subscriptionId: 'sub-123',
      preapprovalId: 'preapp-123',
      newAmount: 33000,
      updatedAt: '2026-06-25T12:00:00.000Z',
    };

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => responseData,
    } as Response);

    const result = await updateSubscriptionAmount('sub-123', 33000);

    expect(result).toEqual(responseData);
    expect(api.setHeader).toHaveBeenCalledWith('Authorization', 'Bearer test-token');
    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:3000/admin/subscriptions/sub-123/amount',
      expect.objectContaining({
        method: 'PATCH',
        body: JSON.stringify({ amount: 33000 }),
        headers: expect.objectContaining({
          Authorization: 'Bearer test-token',
        }),
      }),
    );
  });

  it('mapea 404 al mensaje de no encontrada', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 404,
      statusText: 'Not Found',
      json: async () => ({}),
    } as Response);

    await expect(updateSubscriptionAmount('sub-404', 33000)).rejects.toThrow('Suscripción no encontrada.');
  });

  it('mapea 422 al mensaje de PreApproval ausente', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 422,
      statusText: 'Unprocessable Entity',
      json: async () => ({}),
    } as Response);

    await expect(updateSubscriptionAmount('sub-422', 33000)).rejects.toThrow(
      'La suscripción no tiene PreApproval activo en MercadoPago.',
    );
  });

  it('mapea 500 al mensaje de rechazo de MercadoPago', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      json: async () => ({}),
    } as Response);

    await expect(updateSubscriptionAmount('sub-500', 33000)).rejects.toThrow(
      'MercadoPago rechazó la actualización. Intentá de nuevo más tarde.',
    );
  });

  it('mapea errores no contemplados al mensaje genérico', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 409,
      statusText: 'Conflict',
      json: async () => ({}),
    } as Response);

    await expect(updateSubscriptionAmount('sub-409', 33000)).rejects.toThrow(
      'Error al actualizar el monto. Intentá de nuevo.',
    );
  });
});

// Traceability: implementation by Programmer at 2026-06-25 17:15:00
