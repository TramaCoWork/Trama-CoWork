import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiClient } from '../apiClient';

// Mock import.meta.env
vi.stubGlobal('import', { meta: { env: { PUBLIC_API_BASE_URL: 'http://localhost:3000' } } });

describe('ApiClient', () => {
  let client: ApiClient;

  beforeEach(() => {
    client = new ApiClient('http://localhost:3000');
    vi.restoreAllMocks();
  });

  it('construye URLs correctamente con query params', async () => {
    const mockResponse = { data: 'test' };
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      }),
    );

    await client.get('/professionals', { page: 1, sizePage: 10 });

    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:3000/professionals?page=1&sizePage=10',
      expect.objectContaining({ method: 'GET' }),
    );
  });

  it('omite query params con valor undefined', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({}),
      }),
    );

    await client.get('/test', { a: 'yes', b: undefined });

    expect(fetch).toHaveBeenCalledWith('http://localhost:3000/test?a=yes', expect.any(Object));
  });

  it('envia body en POST como JSON', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ ok: true }),
      }),
    );

    await client.post('/auth/login', { email: 'a@b.com', password: '123' });

    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:3000/auth/login',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ email: 'a@b.com', password: '123' }),
      }),
    );
  });

  it('lanza error con status y body cuando la respuesta no es ok', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        json: () => Promise.resolve({ error: 'Invalid credentials' }),
      }),
    );

    try {
      await client.get('/protected');
      expect.unreachable('Deberia haber lanzado un error');
    } catch (err: any) {
      expect(err.message).toContain('401');
      expect(err.status).toBe(401);
      expect(err.body).toEqual({ error: 'Invalid credentials' });
    }
  });

  it('maneja error de parseo en respuesta no-ok', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: () => Promise.reject(new Error('invalid json')),
      }),
    );

    try {
      await client.get('/broken');
      expect.unreachable('Deberia haber lanzado un error');
    } catch (err: any) {
      expect(err.status).toBe(500);
      expect(err.body).toBeNull();
    }
  });

  it('elimina trailing slashes de la baseUrl', () => {
    const c = new ApiClient('http://example.com///');
    // Verify internal state via a request
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({}),
      }),
    );
    c.get('/test');
    expect(fetch).toHaveBeenCalledWith('http://example.com/test', expect.any(Object));
  });

  it('setHeader agrega headers personalizados', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({}),
      }),
    );

    client.setHeader('Authorization', 'Bearer token123');
    await client.get('/me');

    const callArgs = (fetch as any).mock.calls[0];
    expect(callArgs[1].headers).toEqual(expect.objectContaining({ Authorization: 'Bearer token123' }));
  });

  it('PUT envia body correctamente', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({}),
      }),
    );

    await client.put('/profile', { name: 'Test' });

    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:3000/profile',
      expect.objectContaining({
        method: 'PUT',
        body: JSON.stringify({ name: 'Test' }),
      }),
    );
  });

  it('DELETE no envia body', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({}),
      }),
    );

    await client.del('/item/1');

    const callArgs = (fetch as any).mock.calls[0];
    expect(callArgs[1].method).toBe('DELETE');
    expect(callArgs[1].body).toBeUndefined();
  });
});
