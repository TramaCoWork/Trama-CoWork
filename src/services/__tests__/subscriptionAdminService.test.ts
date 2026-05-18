import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../apiClient', () => ({
  api: {
    get: vi.fn(),
  },
}));

import { api } from '../apiClient';
import { getAdminSubscriptions } from '../subscriptionAdminService';

describe('SubscriptionAdminService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
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
