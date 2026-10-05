import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../apiClient', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    del: vi.fn(),
    setHeader: vi.fn(),
  },
}));

vi.mock('../authService', () => ({
  getToken: vi.fn(),
}));

import { api } from '../apiClient';
import { getToken } from '../authService';
import { putPlanCapabilities } from '../capabilityAdminService';

describe('capabilityAdminService — putPlanCapabilities', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getToken).mockReturnValue('test-token-PLACEHOLDER');
  });

  it('invoca el endpoint correcto con el payload de keys', async () => {
    const mockPlan = { id: 'plan-1', name: 'Mensual', capabilities: ['key1', 'key2'] };
    (api.put as any).mockResolvedValue(mockPlan);

    await putPlanCapabilities('plan-1', ['key1', 'key2']);

    expect(api.put).toHaveBeenCalledWith(
      '/admin/subscription-plans/plan-1/capabilities',
      { keys: ['key1', 'key2'] },
    );
  });

  it('retorna el Plan actualizado en respuesta 200', async () => {
    const mockPlan = {
      id: 'plan-1',
      name: 'Mensual',
      capabilities: ['key1', 'key2'],
      amount: '5000',
      currency: 'ARS',
      frequency: 1,
      frequencyType: 'months',
      trialDays: 0,
      isActive: true,
      visible: true,
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-10-05T00:00:00Z',
    };
    (api.put as any).mockResolvedValue(mockPlan);

    const result = await putPlanCapabilities('plan-1', ['key1', 'key2']);

    expect(result).toEqual(mockPlan);
  });

  it('lanza el error cuando el backend devuelve 400', async () => {
    const apiError = Object.assign(new Error('Bad request'), {
      status: 400,
      body: { message: "Capability 'x' not found" },
    });
    (api.put as any).mockRejectedValue(apiError);

    await expect(putPlanCapabilities('plan-1', ['x'])).rejects.toMatchObject({
      status: 400,
      body: { message: "Capability 'x' not found" },
    });
  });

  it('acepta keys vacío y envía payload { keys: [] }', async () => {
    const mockPlan = { id: 'plan-1', name: 'Mensual', capabilities: [] };
    (api.put as any).mockResolvedValue(mockPlan);

    const result = await putPlanCapabilities('plan-1', []);

    expect(api.put).toHaveBeenCalledWith(
      '/admin/subscription-plans/plan-1/capabilities',
      { keys: [] },
    );
    expect(result).toEqual(mockPlan);
  });
});
