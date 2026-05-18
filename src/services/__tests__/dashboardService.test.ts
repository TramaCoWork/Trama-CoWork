import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../apiClient', () => ({
  api: {
    get: vi.fn(),
    setHeader: vi.fn(),
  },
  apiURL: vi.fn((path: string) => `http://localhost:3000${path}`),
}));

vi.mock('../authService', () => ({
  getToken: vi.fn(() => 'test-token'),
}));

import { api } from '../apiClient';
import { fetchProfessionalDashboard } from '../dashboardService';

describe('dashboardService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetchProfessionalDashboard devuelve métricas del dashboard', async () => {
    const mockData = {
      totalContacts: 10,
      totalEducations: 3,
      totalCertifications: 5,
      totalDocuments: 7,
      totalMessages: 12,
      totalCommunityPosts: 2,
      totalJobApplications: 4,
      totalValidations: 8,
      planName: 'Pro',
      planExpirationDate: '2026-07-20T00:00:00.000Z',
      trialEndDate: null,
      isOnTrial: false,
    };
    (api.get as any).mockResolvedValue(mockData);

    const result = await fetchProfessionalDashboard();

    expect(api.setHeader).toHaveBeenCalledWith('Authorization', 'Bearer test-token');
    expect(api.get).toHaveBeenCalledWith('/dashboard/professional');
    expect(result).toEqual(mockData);
  });

  it('fetchProfessionalDashboard propaga errores de api', async () => {
    (api.get as any).mockRejectedValue(new Error('Network error'));

    await expect(fetchProfessionalDashboard()).rejects.toThrow('Network error');
  });
});
