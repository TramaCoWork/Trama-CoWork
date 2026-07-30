import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../apiClient', () => ({
  api: {
    get: vi.fn(),
  },
}));

import { api } from '../apiClient';
import { fetchProfessionals } from '../professionalsService';

describe('ProfessionalsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('llama a /professionals con page y limit por defecto', async () => {
    const mockData = { data: [], meta: { page: 1, limit: 10, total: 0, totalPages: 0 } };
    (api.get as any).mockResolvedValue(mockData);

    const result = await fetchProfessionals();

    expect(api.get).toHaveBeenCalledWith('/professionals', { page: 1, limit: 10, sizePage: 10 });
    expect(result).toEqual(mockData);
  });

  it('llama a /professionals con page y limit personalizados', async () => {
    const mockData = { data: [], meta: { page: 3, limit: 20, total: 50, totalPages: 3 } };
    (api.get as any).mockResolvedValue(mockData);

    const result = await fetchProfessionals(3, 20);

    expect(api.get).toHaveBeenCalledWith('/professionals', { page: 3, limit: 20, sizePage: 20 });
    expect(result).toEqual(mockData);
  });

  it('propaga errores de la API', async () => {
    (api.get as any).mockRejectedValue(new Error('Network error'));

    await expect(fetchProfessionals()).rejects.toThrow('Network error');
  });
});
