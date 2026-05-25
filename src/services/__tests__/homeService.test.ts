import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../apiClient', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../apiClient')>();
  return {
    ...actual,
    api: {
      get: vi.fn(),
    },
  };
});

import { api } from '../apiClient';
import { fetchCategorias, fetchFeaturedProfessionals, fetchFeaturedProfessionalsSection } from '../homeService';

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

      expect(api.get).toHaveBeenCalledWith('/profession-categories/rubros');
      expect(result).toEqual(mockCategories);
    });

    it('propaga errores de la API', async () => {
      (api.get as any).mockRejectedValue(new Error('Server error'));
      await expect(fetchCategorias()).rejects.toThrow('Server error');
    });
  });

  describe('fetchFeaturedProfessionals', () => {
    it('llama a /professionals/featured y retorna la lista', async () => {
      const mockPros = [{ id: 1, name: 'Elena', photo: null, pricePerHour: 50, services: ['Diseno'] }];
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

  describe('fetchFeaturedProfessionalsSection', () => {
    const mockProfessionals = [
      {
        id: 1,
        name: 'Ana García',
        photo: null,
        pricePerHour: 5000,
        services: ['Diseño'],
        rubro: { id: 1, slug: 'diseno', name: 'Diseño & Creatividad' },
        city: 'Buenos Aires',
      },
      {
        id: 2,
        name: 'Carlos López',
        photo: null,
        pricePerHour: 6000,
        services: ['Dev'],
        rubro: null,
        city: 'Córdoba',
      },
    ];

    beforeEach(() => {
      vi.stubGlobal('fetch', vi.fn());
    });

    afterEach(() => {
      vi.unstubAllGlobals();
    });

    it('fetches from /professionals/featured and returns array', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockProfessionals,
      } as Response);

      const result = await fetchFeaturedProfessionalsSection(8);
      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('Ana García');
      expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/professionals/featured'));
    });

    it('slices to the requested limit', async () => {
      const many = Array.from({ length: 10 }, (_, i) => ({
        ...mockProfessionals[0],
        id: i + 1,
        name: `Pro ${i}`,
      }));
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => many,
      } as Response);

      const result = await fetchFeaturedProfessionalsSection(4);
      expect(result).toHaveLength(4);
    });

    it('throws on non-ok response', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        status: 500,
      } as Response);

      await expect(fetchFeaturedProfessionalsSection()).rejects.toThrow('500');
    });
  });
});
