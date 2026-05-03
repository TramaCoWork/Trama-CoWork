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

  it('llama a /professionals con page y sizePage por defecto', async () => {
    const mockData = { data: [], total: 0, page: 1, sizePage: 10 };
    (api.get as any).mockResolvedValue(mockData);

    const result = await fetchProfessionals();

    expect(api.get).toHaveBeenCalledWith('/professionals', { page: 1, sizePage: 10 });
    expect(result).toEqual(mockData);
  });

  it('llama a /professionals con page y sizePage personalizados', async () => {
    const mockData = { data: [], total: 50, page: 3, sizePage: 20 };
    (api.get as any).mockResolvedValue(mockData);

    const result = await fetchProfessionals(3, 20);

    expect(api.get).toHaveBeenCalledWith('/professionals', { page: 3, sizePage: 20 });
    expect(result).toEqual(mockData);
  });

  it('propaga errores de la API', async () => {
    (api.get as any).mockRejectedValue(new Error('Network error'));

    await expect(fetchProfessionals()).rejects.toThrow('Network error');
  });
});
