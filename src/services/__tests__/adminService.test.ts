import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../authService', () => ({
  getToken: vi.fn(() => 'test-token'),
}));

import { api } from '../apiClient';
import {
  changeProfessionalPassword,
  registerProfessional,
  type AdminUpdateProfessionalPayload,
  updateProfessional,
  uploadProfessionalPhoto,
} from '../adminService';

describe('adminService', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  describe('registerProfessional', () => {
    const payload = {
      name: 'Ana Test',
      email: 'ana@test.com',
      password: 'supersecure',
      city: 'Buenos Aires',
      address: 'Av. Corrientes 1234, Piso 5',
      rubroId: '1',
      countryId: '2',
      provinceId: '3',
      whatsapp: '1122334455',
      document: '12345678',
      professionCategoryIds: ['10', '11'],
      emailVerified: true,
      profileStatus: 'active',
    };

    it('crea profesional en happy path', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          message: 'ok',
          user: {
            id: 'user-1',
            email: payload.email,
            role: 'professional',
            emailVerified: true,
            professionalProfile: {
              id: 'profile-1',
              name: payload.name,
              profileStatus: 'active',
              professionCategories: [],
              rubro: { id: '1', name: 'Rubro' },
            },
          },
        }),
      } as Response);

      const response = await registerProfessional(payload);

      expect(response.user.email).toBe(payload.email);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/admin/professionals/register'),
        expect.objectContaining({ method: 'POST' }),
      );
    });

    it('propaga error 400 con mensaje del backend', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: async () => ({ message: 'Datos inválidos' }),
      } as Response);

      await expect(registerProfessional(payload)).rejects.toThrow('Datos inválidos');
    });

    it('propaga error 409 de conflicto', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        status: 409,
        statusText: 'Conflict',
        json: async () => ({ message: 'Email repetido' }),
      } as Response);

      await expect(registerProfessional(payload)).rejects.toThrow('Email repetido');
    });
  });

  describe('uploadProfessionalPhoto', () => {
    it('sube foto en happy path', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'ok' }),
      } as Response);

      const file = new Blob(['file']) as File;
      await uploadProfessionalPhoto('profile-123', file);

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/uploads/admin/professionals/profile-123/photo'),
        expect.objectContaining({ method: 'POST' }),
      );
    });

    it('propaga error al subir foto', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Server Error',
        json: async () => ({ message: 'Falló' }),
      } as Response);

      const file = new Blob(['file']) as File;
      await expect(uploadProfessionalPhoto('profile-999', file)).rejects.toThrow('Falló');
    });
  });

  describe('updateProfessional', () => {
    it('acepta payload completo de edición (type check)', () => {
      const payload = {
        isActive: true,
        firstName: 'Ana',
        lastName: 'Pérez',
        name: 'Ana Pérez',
        dni: '12345678',
        city: 'Córdoba',
        countryId: 1,
        provinceId: 2,
        whatsapp: '5491122334455',
        linkedin: 'https://linkedin.com/in/anaperez',
        workModality: 'online',
        rubroId: 3,
        professionCategoryIds: [10, 11],
        services: ['Mentoría', 'Consultoría'],
        pricePerHour: 25,
        bio: 'Bio de prueba',
        tramaMotivation: 'Motivación de prueba',
      } satisfies AdminUpdateProfessionalPayload;

      expect(payload.firstName).toBe('Ana');
      expect(payload.professionCategoryIds).toHaveLength(2);
    });

    it('llama api.patch con path y payload correctos', async () => {
      const patchSpy = vi.spyOn(api, 'patch').mockResolvedValue({ ok: true });
      const payload: AdminUpdateProfessionalPayload = { city: 'Rosario', isActive: false };

      await updateProfessional('prof-123', payload);

      expect(patchSpy).toHaveBeenCalledWith('/admin/professionals/prof-123', payload);
      patchSpy.mockRestore();
    });
  });

  describe('changeProfessionalPassword', () => {
    it('envia PATCH con payload y Authorization header en 200', async () => {
      const setHeaderSpy = vi.spyOn(api, 'setHeader');
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'ok' }),
      } as Response);

      const response = await changeProfessionalPassword('123', '12345678', '12345678');

      expect(response).toEqual({ message: 'ok' });
      expect(setHeaderSpy).toHaveBeenCalledWith('Authorization', 'Bearer test-token');
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/admin/professionals/123/password'),
        expect.objectContaining({
          method: 'PATCH',
          headers: expect.objectContaining({ Authorization: 'Bearer test-token' }),
          body: JSON.stringify({ password: '12345678', confirmPassword: '12345678' }),
        }),
      );

      setHeaderSpy.mockRestore();
    });

    it('propaga status 400 con metadata del error', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: async () => ({ message: 'Password policy error' }),
      } as Response);

      await expect(changeProfessionalPassword('123', '12345678', '12345678')).rejects.toMatchObject({
        status: 400,
        body: { message: 'Password policy error' },
      });
    });

    it('propaga status 404 con metadata del error', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: async () => ({ message: 'Professional not found' }),
      } as Response);

      await expect(changeProfessionalPassword('123', '12345678', '12345678')).rejects.toMatchObject({
        status: 404,
        body: { message: 'Professional not found' },
      });
    });

    it('propaga status 500 cuando no hay body parseable', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: async () => {
          throw new Error('invalid json');
        },
      } as Response);

      await expect(changeProfessionalPassword('123', '12345678', '12345678')).rejects.toMatchObject({
        status: 500,
      });
    });
  });
});

// Traceability: generated by Programmer at 2026-05-20 20:04:28
