import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../apiClient', () => ({
  api: {
    get: vi.fn(),
    patch: vi.fn(),
  },
}));

import { api } from '../apiClient';
import { fetchProfile, updateGeneralProfile, updatePersonalData } from '../profileService';

describe('ProfileService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('fetchProfile', () => {
    it('llama a /professionals/by-user/:userId', async () => {
      const mockProfile = { id: 'prof-1', name: 'Elena', city: 'Buenos Aires' };
      (api.get as any).mockResolvedValue(mockProfile);

      const result = await fetchProfile('user-123');

      expect(api.get).toHaveBeenCalledWith('/professionals/by-user/user-123');
      expect(result).toEqual(mockProfile);
    });

    it('propaga errores de la API', async () => {
      (api.get as any).mockRejectedValue(new Error('Not found'));
      await expect(fetchProfile('bad-id')).rejects.toThrow('Not found');
    });
  });

  describe('updatePersonalData', () => {
    it('envia PATCH a /professionals/:id/personal con los datos', async () => {
      const mockResult = { id: 'prof-1', name: 'Elena Updated' };
      (api.patch as any).mockResolvedValue(mockResult);

      const payload = { name: 'Elena Updated', city: 'Cordoba', workModality: 'online' };
      const result = await updatePersonalData('prof-1', payload);

      expect(api.patch).toHaveBeenCalledWith('/professionals/prof-1/personal', payload);
      expect(result).toEqual(mockResult);
    });

    it('propaga errores de la API', async () => {
      (api.patch as any).mockRejectedValue(new Error('Forbidden'));
      await expect(updatePersonalData('prof-1', { name: 'Test' })).rejects.toThrow('Forbidden');
    });
  });

  describe('updateGeneralProfile', () => {
    it('envia PATCH a /professionals/:id con los datos', async () => {
      const mockResult = { id: 'prof-1', bio: 'New bio', services: ['Diseno'] };
      (api.patch as any).mockResolvedValue(mockResult);

      const payload = { bio: 'New bio', services: ['Diseno'], priceMin: '50' };
      const result = await updateGeneralProfile('prof-1', payload);

      expect(api.patch).toHaveBeenCalledWith('/professionals/prof-1', payload);
      expect(result).toEqual(mockResult);
    });

    it('propaga errores de la API', async () => {
      (api.patch as any).mockRejectedValue(new Error('Server error'));
      await expect(updateGeneralProfile('prof-1', { bio: 'x' })).rejects.toThrow('Server error');
    });
  });
});
