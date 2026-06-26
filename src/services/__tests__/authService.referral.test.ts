import { beforeEach, describe, expect, it, vi } from 'vitest';

const storage: Record<string, string> = {};
vi.stubGlobal('localStorage', {
  getItem: vi.fn((key: string) => storage[key] ?? null),
  setItem: vi.fn(),
  removeItem: vi.fn(),
});

vi.mock('../apiClient', () => {
  const setHeader = vi.fn();
  return {
    api: {
      get: vi.fn(),
      patch: vi.fn(),
      setHeader,
    },
  };
});

import { api } from '../apiClient';
import { getReferralCode, updateReferralCode } from '../authService';

describe('authService referral helpers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    for (const key of Object.keys(storage)) delete storage[key];
    storage.trama_access_token = 'mock-token';
  });

  it('getReferralCode calls GET endpoint and returns payload', async () => {
    vi.mocked(api.get).mockResolvedValue({ referralCode: 'CODIGO1' });

    const result = await getReferralCode();

    expect(api.setHeader).toHaveBeenCalledWith('Authorization', 'Bearer mock-token');
    expect(api.get).toHaveBeenCalledWith('/auth/me/referral-code');
    expect(result).toEqual({ referralCode: 'CODIGO1' });
  });

  it('updateReferralCode calls PATCH endpoint with body', async () => {
    vi.mocked(api.patch).mockResolvedValue({ referralCode: 'CODIGO2' });

    const result = await updateReferralCode('CODIGO2');

    expect(api.setHeader).toHaveBeenCalledWith('Authorization', 'Bearer mock-token');
    expect(api.patch).toHaveBeenCalledWith('/auth/me/referral-code', { referralCode: 'CODIGO2' });
    expect(result).toEqual({ referralCode: 'CODIGO2' });
  });

  it('updateReferralCode maps 409 body message to Error message', async () => {
    vi.mocked(api.patch).mockRejectedValue({
      status: 409,
      body: { message: 'Ese código de referido ya está en uso' },
    });

    await expect(updateReferralCode('DUPLICADO')).rejects.toThrow('Ese código de referido ya está en uso');
  });

  it('updateReferralCode rethrows non-409 errors', async () => {
    const genericError = new Error('network down');
    vi.mocked(api.patch).mockRejectedValue(genericError);

    await expect(updateReferralCode('CODIGO3')).rejects.toBe(genericError);
  });
});
