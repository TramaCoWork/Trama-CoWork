import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../apiClient', () => ({
  api: {
    get: vi.fn(),
  },
}));

import { api } from '../apiClient';
import { fetchCategorias, fetchFeaturedProfessionals } from '../homeService';

describe('HomeService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('fetchCategorias', () => {
    it('llama a /categories y retorna la lista', async () => {
      const mockCategories = [
        { id: 1, name: 'Arquitectura' },
        { id: 2, name: 'Diseno' },
      ];
      (api.get as any).mockResolvedValue(mockCategories);

      const result = await fetchCategorias();

      expect(api.get).toHaveBeenCalledWith('/categories');
      expect(result).toEqual(mockCategories);
    });

    it('propaga errores de la API', async () => {
      (api.get as any).mockRejectedValue(new Error('Server error'));
      await expect(fetchCategorias()).rejects.toThrow('Server error');
    });
  });

  describe('fetchFeaturedProfessionals', () => {
    it('llama a /professionals/featured y retorna la lista', async () => {
      const mockPros = [{ id: 1, name: 'Elena', photo: null, priceMin: 50, priceMax: 100, services: ['Diseno'] }];
      (api.get as any).mockResolvedValue(mockPros);

      const result = await fetchFeaturedProfessionals();

      expect(api.get).toHaveBeenCalledWith('/professionals/featured');
      expect(result).toEqual(mockPros);
    });

    it('propaga errores de la API', async () => {
      (api.get as any).mockRejectedValue(new Error('Timeout'));
      await expect(fetchFeaturedProfessionals()).rejects.toThrow('Timeout');
    });
  });
});
