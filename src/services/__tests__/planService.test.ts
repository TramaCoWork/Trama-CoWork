import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../apiClient', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    del: vi.fn(),
  },
}));

import { api } from '../apiClient';
import {
  getAdminPlans,
  createPlan,
  deletePlan,
  getFrequencyTypes,
  getPlans,
  getSubscriptionStatuses,
  updatePlan,
} from '../planService';

describe('PlanService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getPlans', () => {
    it('llama a /subscription-plans', async () => {
      const mockPlans = [{ id: 'plan-1', name: 'Mensual' }];
      (api.get as any).mockResolvedValue(mockPlans);

      const result = await getPlans();

      expect(api.get).toHaveBeenCalledWith('/subscription-plans');
      expect(result).toEqual(mockPlans);
    });

    it('propaga errores de la API', async () => {
      (api.get as any).mockRejectedValue(new Error('Network error'));

      await expect(getPlans()).rejects.toThrow('Network error');
    });
  });

  describe('getAdminPlans', () => {
    it('llama a /admin/subscription-plans sin filtros', async () => {
      const mockResponse = { data: [], total: 0, page: 1, sizePage: 10 };
      (api.get as any).mockResolvedValue(mockResponse);

      const result = await getAdminPlans();

      expect(api.get).toHaveBeenCalledWith('/admin/subscription-plans');
      expect(result).toEqual(mockResponse);
    });

    it('incluye filtro isActive', async () => {
      const mockResponse = { data: [], total: 0, page: 1, sizePage: 10 };
      (api.get as any).mockResolvedValue(mockResponse);

      await getAdminPlans({ isActive: true });

      expect(api.get).toHaveBeenCalledWith('/admin/subscription-plans?isActive=true');
    });

    it('incluye filtro frequencyType', async () => {
      const mockResponse = { data: [], total: 0, page: 1, sizePage: 10 };
      (api.get as any).mockResolvedValue(mockResponse);

      await getAdminPlans({ frequencyType: 'monthly' });

      expect(api.get).toHaveBeenCalledWith('/admin/subscription-plans?frequencyType=monthly');
    });

    it('incluye filtro hasTrial', async () => {
      const mockResponse = { data: [], total: 0, page: 1, sizePage: 10 };
      (api.get as any).mockResolvedValue(mockResponse);

      await getAdminPlans({ hasTrial: false });

      expect(api.get).toHaveBeenCalledWith('/admin/subscription-plans?hasTrial=false');
    });

    it('incluye filtros combinados', async () => {
      const mockResponse = { data: [], total: 0, page: 1, sizePage: 10 };
      (api.get as any).mockResolvedValue(mockResponse);

      await getAdminPlans({
        isActive: false,
        frequencyType: 'yearly',
        hasTrial: true,
      });

      expect(api.get).toHaveBeenCalledWith('/admin/subscription-plans?isActive=false&frequencyType=yearly&hasTrial=true');
    });

    it('incluye parametros de paginacion', async () => {
      const mockResponse = { data: [], total: 0, page: 2, sizePage: 25 };
      (api.get as any).mockResolvedValue(mockResponse);

      await getAdminPlans({ page: 2, sizePage: 25 });

      expect(api.get).toHaveBeenCalledWith('/admin/subscription-plans?page=2&sizePage=25');
    });
  });

  describe('createPlan', () => {
    it('envia POST a /subscription-plans con payload', async () => {
      const payload = {
        name: 'Plan anual',
        description: 'Acceso completo',
        amount: 120000,
        currency: 'ARS',
        frequency: 1,
        frequencyType: 'years',
        trialDays: 14,
        isActive: true,
      };
      const mockCreated = { id: 'plan-2', ...payload };
      (api.post as any).mockResolvedValue(mockCreated);

      const result = await createPlan(payload);

      expect(api.post).toHaveBeenCalledWith('/subscription-plans', payload);
      expect(result).toEqual(mockCreated);
    });

    it('propaga errores de la API', async () => {
      (api.post as any).mockRejectedValue(new Error('Bad request'));

      await expect(
        createPlan({
          name: 'Plan',
          amount: 1000,
          currency: 'ARS',
          frequency: 1,
          frequencyType: 'months',
          trialDays: 0,
          isActive: true,
        }),
      ).rejects.toThrow('Bad request');
    });

    it('normaliza amount a numero antes de enviar', async () => {
      const payload = {
        name: 'Plan base',
        description: 'Desc',
        amount: '35' as any,
        currency: 'ARS',
        frequency: 1,
        frequencyType: 'months',
        trialDays: 0,
        isActive: false,
      };
      (api.post as any).mockResolvedValue({ id: 'plan-4' });

      await createPlan(payload as any);

      expect(api.post).toHaveBeenCalledWith('/subscription-plans', {
        ...payload,
        amount: 35,
      });
    });
  });

  describe('updatePlan', () => {
    it('envia PATCH a /subscription-plans/:id con payload', async () => {
      const payload = { name: 'Plan anual actualizado', isActive: false };
      const mockUpdated = { id: 'plan-2', ...payload };
      (api.patch as any).mockResolvedValue(mockUpdated);

      const result = await updatePlan('plan-2', payload);

      expect(api.patch).toHaveBeenCalledWith('/subscription-plans/plan-2', payload);
      expect(result).toEqual(mockUpdated);
    });

    it('propaga errores de la API', async () => {
      (api.patch as any).mockRejectedValue(new Error('Conflict'));

      await expect(updatePlan('plan-2', { name: 'X' })).rejects.toThrow('Conflict');
    });

    it('normaliza amount a numero cuando llega como string', async () => {
      const payload = { amount: '35' as any, isActive: true };
      (api.patch as any).mockResolvedValue({ id: 'plan-2' });

      await updatePlan('plan-2', payload as any);

      expect(api.patch).toHaveBeenCalledWith('/subscription-plans/plan-2', {
        ...payload,
        amount: 35,
      });
    });
  });

  describe('deletePlan', () => {
    it('envia DELETE a /subscription-plans/:id', async () => {
      (api.del as any).mockResolvedValue(undefined);

      await deletePlan('plan-3');

      expect(api.del).toHaveBeenCalledWith('/subscription-plans/plan-3');
    });

    it('propaga errores de la API', async () => {
      (api.del as any).mockRejectedValue(new Error('Forbidden'));

      await expect(deletePlan('plan-3')).rejects.toThrow('Forbidden');
    });
  });

  describe('getFrequencyTypes', () => {
    it('llama a /catalogs/frequency-types', async () => {
      const mockTypes = ['days', 'months', 'years'];
      (api.get as any).mockResolvedValue(mockTypes);

      const result = await getFrequencyTypes();

      expect(api.get).toHaveBeenCalledWith('/catalogs/frequency-types');
      expect(result).toEqual(mockTypes);
    });

    it('propaga errores de la API', async () => {
      (api.get as any).mockRejectedValue(new Error('Server error'));

      await expect(getFrequencyTypes()).rejects.toThrow('Server error');
    });
  });

  describe('getSubscriptionStatuses', () => {
    it('llama a /catalogs/subscription-statuses', async () => {
      const mockStatuses = ['pending', 'authorized', 'active', 'paused', 'cancelled', 'expired'];
      (api.get as any).mockResolvedValue(mockStatuses);

      const result = await getSubscriptionStatuses();

      expect(api.get).toHaveBeenCalledWith('/catalogs/subscription-statuses');
      expect(result).toEqual(mockStatuses);
    });

    it('propaga errores de la API', async () => {
      (api.get as any).mockRejectedValue(new Error('Server error'));

      await expect(getSubscriptionStatuses()).rejects.toThrow('Server error');
    });
  });
});
