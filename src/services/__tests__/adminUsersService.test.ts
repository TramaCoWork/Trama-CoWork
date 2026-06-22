import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  createAdminUser,
  deleteAdminUser,
  fetchAdminUsers,
  updateAdminUser,
} from '../adminUsersService';

vi.mock('../authService', () => ({
  getToken: vi.fn(),
}));

describe('adminUsersService', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    vi.stubGlobal('fetch', vi.fn());
    const { getToken } = await import('../authService');
    vi.mocked(getToken).mockReturnValue('test-token');
  });

  it('fetchAdminUsers envia paginacion y retorna respuesta', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: [{ id: 'u1', email: 'admin@trama.com', role: 'admin', createdAt: '2026-06-20T00:00:00.000Z' }],
        total: 1,
        page: 2,
        sizePage: 15,
      }),
    } as Response);

    const response = await fetchAdminUsers(2, 15);

    expect(response.total).toBe(1);
    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:3000/admin/users?page=2&sizePage=15',
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({ Authorization: 'Bearer test-token' }),
      }),
    );
  });

  it('fetchAdminUsers soporta respuesta vacia', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: [], total: 0, page: 1, sizePage: 15 }),
    } as Response);

    const response = await fetchAdminUsers();

    expect(response).toEqual({ data: [], total: 0, page: 1, sizePage: 15 });
  });

  it('fetchAdminUsers propaga errores de carga', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Server Error',
      json: async () => ({ message: 'Error de servidor' }),
    } as Response);

    await expect(fetchAdminUsers()).rejects.toMatchObject({
      status: 500,
      body: { message: 'Error de servidor' },
    });
  });

  it('createAdminUser envia payload esperado con role admin', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        id: 'u2',
        email: 'nuevo@trama.com',
        role: 'admin',
        createdAt: '2026-06-20T00:00:00.000Z',
      }),
    } as Response);

    await createAdminUser({ email: 'nuevo@trama.com', password: '12345678', role: 'admin' });

    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:3000/admin/users',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({ Authorization: 'Bearer test-token' }),
        body: JSON.stringify({ email: 'nuevo@trama.com', password: '12345678', role: 'admin' }),
      }),
    );
  });

  it('createAdminUser propaga conflicto 409', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 409,
      statusText: 'Conflict',
      json: async () => ({ message: 'El email ya está registrado.' }),
    } as Response);

    await expect(createAdminUser({ email: 'dup@trama.com', password: '12345678', role: 'admin' })).rejects.toMatchObject({
      status: 409,
      body: { message: 'El email ya está registrado.' },
    });
  });

  it('updateAdminUser envia PATCH sin password cuando no se incluye', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        id: 'u3',
        email: 'editado@trama.com',
        role: 'admin',
        createdAt: '2026-06-20T00:00:00.000Z',
      }),
    } as Response);

    await updateAdminUser('u3', { email: 'editado@trama.com' });

    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:3000/admin/users/u3',
      expect.objectContaining({
        method: 'PATCH',
        body: JSON.stringify({ email: 'editado@trama.com' }),
      }),
    );
  });

  it('updateAdminUser envia PATCH con password cuando se incluye', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        id: 'u4',
        email: 'editado2@trama.com',
        role: 'admin',
        createdAt: '2026-06-20T00:00:00.000Z',
      }),
    } as Response);

    await updateAdminUser('u4', { email: 'editado2@trama.com', password: '12345678' });

    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:3000/admin/users/u4',
      expect.objectContaining({
        method: 'PATCH',
        body: JSON.stringify({ email: 'editado2@trama.com', password: '12345678' }),
      }),
    );
  });

  it('deleteAdminUser ejecuta DELETE exitoso', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: 'Usuario eliminado.' }),
    } as Response);

    const result = await deleteAdminUser('u5');

    expect(result.message).toBe('Usuario eliminado.');
    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:3000/admin/users/u5',
      expect.objectContaining({ method: 'DELETE' }),
    );
  });

  it('deleteAdminUser propaga 403 y 404', async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce({
        ok: false,
        status: 403,
        statusText: 'Forbidden',
        json: async () => ({ message: 'No podés eliminar tu propio usuario.' }),
      } as Response)
      .mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: async () => ({ message: 'Usuario no encontrado.' }),
      } as Response);

    await expect(deleteAdminUser('u6')).rejects.toMatchObject({
      status: 403,
      body: { message: 'No podés eliminar tu propio usuario.' },
    });
    await expect(deleteAdminUser('u7')).rejects.toMatchObject({
      status: 404,
      body: { message: 'Usuario no encontrado.' },
    });
  });
});

// Traceability: implementation by Programmer at 2026-06-20 18:04:38
