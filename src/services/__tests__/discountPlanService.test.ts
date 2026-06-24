import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  createDiscountPlan,
  deleteDiscountPlan,
  fetchDiscountPlans,
  updateDiscountPlan,
  type CreateDiscountPlanDto,
  type DiscountPlan,
} from '../discountPlanService';

vi.mock('../authService', () => ({
  getToken: vi.fn(),
}));

describe('discountPlanService', () => {
  const baseDiscountPlan: DiscountPlan = {
    id: 'discount-1',
    subscriptionPlanId: 'plan-1',
    discountAmount: '1500.50',
    description: 'Promo invierno',
    isActive: true,
    fromDate: '2026-07-01T00:00:00.000Z',
    toDate: '2026-07-31T00:00:00.000Z',
    billingCycles: 3,
    maxUses: 10,
    currentUses: 2,
    perUserLimit: 1,
    deletedAt: null,
    createdAt: '2026-06-24T00:00:00.000Z',
    updatedAt: '2026-06-24T00:00:00.000Z',
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    vi.stubGlobal('fetch', vi.fn());
    const { getToken } = await import('../authService');
    vi.mocked(getToken).mockReturnValue('test-token');
  });

  it('fetchDiscountPlans retorna listado y setea Authorization header', async () => {
    const responseData: DiscountPlan[] = [
      baseDiscountPlan,
      { ...baseDiscountPlan, id: 'discount-2', subscriptionPlanId: 'plan-2' },
    ];

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => responseData,
    } as Response);

    const response = await fetchDiscountPlans();

    expect(response).toEqual(responseData);
    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:3000/admin/discount-plans',
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({ Authorization: 'Bearer test-token' }),
      }),
    );
  });

  it('fetchDiscountPlans acepta filtros en query string', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    } as Response);

    await fetchDiscountPlans({ subscriptionPlanId: 'plan-uuid', isActive: true });

    const calledUrl = vi.mocked(fetch).mock.calls[0]?.[0] as string;
    expect(calledUrl).toContain('/admin/discount-plans?');
    expect(calledUrl).toContain('subscriptionPlanId=plan-uuid');
    expect(calledUrl).toContain('isActive=true');
  });

  it('createDiscountPlan envia payload valido y retorna entidad creada', async () => {
    const payload: CreateDiscountPlanDto = {
      subscriptionPlanId: 'plan-1',
      discountAmount: 1500.5,
      fromDate: '2026-07-01T00:00:00.000Z',
      toDate: '2026-07-31T00:00:00.000Z',
      description: 'Promo invierno',
      isActive: true,
      billingCycles: 3,
      maxUses: 10,
      perUserLimit: 1,
    };

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      status: 201,
      json: async () => baseDiscountPlan,
    } as Response);

    const response = await createDiscountPlan(payload);

    expect(response).toEqual(baseDiscountPlan);
    const createBody = JSON.parse((vi.mocked(fetch).mock.calls[0]?.[1] as RequestInit).body as string) as Record<string, unknown>;

    expect(createBody.subscriptionPlanId).toBe('plan-1');
    expect(createBody.discountAmount).toBe(1500.5);
    expect(createBody.fromDate).toBe('2026-07-01T00:00:00.000Z');
    expect(createBody.toDate).toBe('2026-07-31T00:00:00.000Z');
    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:3000/admin/discount-plans',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({ Authorization: 'Bearer test-token' }),
      }),
    );
  });

  it('createDiscountPlan expone mensaje de solapamiento cuando backend responde 400', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 400,
      statusText: 'Bad Request',
      json: async () => ({
        statusCode: 400,
        message: 'Ya existe un plan de descuento activo en ese rango de fechas para este plan.',
        error: 'Bad Request',
      }),
    } as Response);

    await expect(
      createDiscountPlan({
        subscriptionPlanId: 'plan-1',
        discountAmount: 200,
        fromDate: '2026-07-01T00:00:00.000Z',
        toDate: '2026-07-10T00:00:00.000Z',
      }),
    ).rejects.toThrow('Ya existe un plan de descuento activo en ese rango de fechas para este plan.');
  });

  it('updateDiscountPlan envia PATCH al id correcto con campos editables', async () => {
    const updatedPlan: DiscountPlan = {
      ...baseDiscountPlan,
      discountAmount: '200.00',
    };

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => updatedPlan,
    } as Response);

    const response = await updateDiscountPlan('some-id', { discountAmount: 200 });

    expect(response).toEqual(updatedPlan);
    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:3000/admin/discount-plans/some-id',
      expect.objectContaining({
        method: 'PATCH',
        body: JSON.stringify({ discountAmount: 200 }),
      }),
    );
  });

  it('deleteDiscountPlan ejecuta DELETE y maneja 204 exitoso', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      status: 204,
      statusText: 'No Content',
    } as Response);

    await expect(deleteDiscountPlan('delete-id')).resolves.toBeUndefined();
    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:3000/admin/discount-plans/delete-id',
      expect.objectContaining({
        method: 'DELETE',
        headers: expect.objectContaining({ Authorization: 'Bearer test-token' }),
      }),
    );
  });
});

// Traceability: implementation by Programmer at 2026-06-24 22:00:00
