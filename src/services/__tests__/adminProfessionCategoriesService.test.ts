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
  createProfesion,
  createRubro,
  createSubrubro,
  deleteProfesion,
  deleteSubrubro,
  getProfesiones,
  getRubros,
  getSubrubros,
  updateProfesion,
  updateSubrubro,
} from '../adminProfessionCategoriesService';

describe('adminProfessionCategoriesService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getRubros llama al endpoint correcto', async () => {
    const mockRubros = [{ id: 1, name: 'Servicios' }];
    (api.get as any).mockResolvedValue(mockRubros);

    const result = await getRubros();

    expect(api.get).toHaveBeenCalledWith('/admin/profession-categories/rubros');
    expect(result).toEqual(mockRubros);
  });

  it('createRubro envia POST con payload', async () => {
    const payload = { name: 'Rubro X', order: 2, isActive: true };
    const mockResponse = { id: 4, ...payload };
    (api.post as any).mockResolvedValue(mockResponse);

    const result = await createRubro(payload);

    expect(api.post).toHaveBeenCalledWith('/admin/profession-categories/rubros', payload);
    expect(result).toEqual(mockResponse);
  });

  it('updateSubrubro envia PATCH con payload parcial', async () => {
    const payload = { name: 'Subrubro actualizado', isActive: false };
    const mockResponse = { id: 2, ...payload };
    (api.patch as any).mockResolvedValue(mockResponse);

    const result = await updateSubrubro(2, payload);

    expect(api.patch).toHaveBeenCalledWith('/admin/profession-categories/subrubros/2', payload);
    expect(result).toEqual(mockResponse);
  });

  describe('Profesiones', () => {
    it('getProfesiones llama al endpoint correcto sin subrubroId', async () => {
      (api.get as any).mockResolvedValue([]);

      await getProfesiones();

      expect(api.get).toHaveBeenCalledWith('/admin/profession-categories/profesiones');
    });

    it('getProfesiones incluye subrubroId en query cuando se provee', async () => {
      (api.get as any).mockResolvedValue([]);

      await getProfesiones(41);

      expect(api.get).toHaveBeenCalledWith('/admin/profession-categories/profesiones?subrubroId=41');
    });

    it('createProfesion envia POST con payload', async () => {
      const payload = { name: 'Profesión X', subrubroId: 41 };
      const mockResponse = { id: 10, ...payload };
      (api.post as any).mockResolvedValue(mockResponse);

      const result = await createProfesion(payload);

      expect(api.post).toHaveBeenCalledWith('/admin/profession-categories/profesiones', payload);
      expect(result).toEqual(mockResponse);
    });

    it('updateProfesion envia PATCH con payload parcial', async () => {
      const payload = { name: 'Profesión actualizada' };
      const mockResponse = { id: 3, ...payload };
      (api.patch as any).mockResolvedValue(mockResponse);

      const result = await updateProfesion(3, payload);

      expect(api.patch).toHaveBeenCalledWith('/admin/profession-categories/profesiones/3', payload);
      expect(result).toEqual(mockResponse);
    });

    it('deleteProfesion envia DELETE y propaga error 400', async () => {
      const error = Object.assign(new Error('Bad Request'), { status: 400 });
      (api.del as any).mockRejectedValue(error);

      await expect(deleteProfesion(7)).rejects.toThrow('Bad Request');
      expect(api.del).toHaveBeenCalledWith('/admin/profession-categories/profesiones/7');
    });
  });

  describe('Subrubros', () => {
    it('getSubrubros llama al endpoint correcto sin rubroId', async () => {
      (api.get as any).mockResolvedValue([]);

      await getSubrubros();

      expect(api.get).toHaveBeenCalledWith('/admin/profession-categories/subrubros');
    });

    it('getSubrubros incluye rubroId en query cuando se provee', async () => {
      (api.get as any).mockResolvedValue([]);

      await getSubrubros(1);

      expect(api.get).toHaveBeenCalledWith('/admin/profession-categories/subrubros?rubroId=1');
    });

    it('createSubrubro envia POST con payload', async () => {
      const payload = { name: 'Subrubro X', rubroId: 1 };
      const mockResponse = { id: 7, ...payload };
      (api.post as any).mockResolvedValue(mockResponse);

      const result = await createSubrubro(payload);

      expect(api.post).toHaveBeenCalledWith('/admin/profession-categories/subrubros', payload);
      expect(result).toEqual(mockResponse);
    });

    it('deleteSubrubro envia DELETE y propaga error 400', async () => {
      const error = Object.assign(new Error('No se puede eliminar'), {
        status: 400,
        body: { message: 'No se puede eliminar' },
      });
      (api.del as any).mockRejectedValue(error);

      await expect(deleteSubrubro(5)).rejects.toThrow('No se puede eliminar');
      expect(api.del).toHaveBeenCalledWith('/admin/profession-categories/subrubros/5');
    });
  });
});
