import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../apiClient', () => ({
  api: {
    get: vi.fn(),
  },
}));

import { api } from '../apiClient';
import { getAdminPayments } from '../subscriptionPaymentService';

describe('SubscriptionPaymentService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('llama a /admin/subscription-payments sin filtros', async () => {
    const mockResponse = { data: [], total: 0, page: 1, sizePage: 10 };
    (api.get as any).mockResolvedValue(mockResponse);

    const result = await getAdminPayments();

    expect(api.get).toHaveBeenCalledWith('/admin/subscription-payments', {});
    expect(result).toEqual(mockResponse);
  });

  it('llama a /admin/subscription-payments con filtros', async () => {
    const mockResponse = { data: [], total: 1, page: 2, sizePage: 5 };
    (api.get as any).mockResolvedValue(mockResponse);

    const filters = {
      page: 2,
      sizePage: 5,
      status: 'sub_approved',
      search: 'user@example.com',
    };

    await getAdminPayments(filters);

    expect(api.get).toHaveBeenCalledWith('/admin/subscription-payments', filters);
  });

  it('propaga errores de la API', async () => {
    (api.get as any).mockRejectedValue(new Error('Network error'));

    await expect(getAdminPayments({ page: 1 })).rejects.toThrow('Network error');
  });
});
