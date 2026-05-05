/**
 * ApiClient
 * ---------
 * Clase base HTTP para todos los servicios.
 * Centraliza la URL base, headers y metodos GET / POST / PUT / DELETE.
 *
 * Uso:
 *   Los servicios concretos extienden o consumen esta clase
 *   pasando solo el path y parametros necesarios.
 */

export interface QueryParams {
  [key: string]: string | number | boolean | undefined;
}

export class ApiClient {
  private baseUrl: string;
  private defaultHeaders: Record<string, string>;

  constructor(baseUrl = import.meta.env.PUBLIC_API_BASE_URL || 'http://localhost:3000') {
    this.baseUrl = baseUrl.replace(/\/+$/, '');
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  private buildUrl(path: string, query?: QueryParams): string {
    const url = new URL(`${this.baseUrl}${path}`);
    if (query) {
      for (const [key, value] of Object.entries(query)) {
        if (value !== undefined) {
          url.searchParams.append(key, String(value));
        }
      }
    }
    return url.toString();
  }

  private async request<T>(
    method: string,
    path: string,
    options?: { query?: QueryParams; body?: unknown },
  ): Promise<T> {
    const url = this.buildUrl(path, options?.query);

    const config: RequestInit = {
      method,
      headers: { ...this.defaultHeaders },
    };

    if (options?.body && method !== 'GET') {
      config.body = JSON.stringify(options.body);
    }

    console.log(`[API] ${method} ${url}`);
    const res = await fetch(url, config);

    if (!res.ok) {
      let errorBody: unknown;
      try {
        errorBody = await res.json();
      } catch {
        errorBody = null;
      }
      const err = new Error(`[${method}] ${path} - ${res.status} ${res.statusText}`) as Error & {
        status: number;
        body: unknown;
      };
      err.status = res.status;
      err.body = errorBody;
      throw err;
    }

    return res.json() as Promise<T>;
  }

  async get<T>(path: string, query?: QueryParams): Promise<T> {
    return this.request<T>('GET', path, { query });
  }

  async post<T>(path: string, body?: unknown, query?: QueryParams): Promise<T> {
    return this.request<T>('POST', path, { body, query });
  }

  async put<T>(path: string, body?: unknown, query?: QueryParams): Promise<T> {
    return this.request<T>('PUT', path, { body, query });
  }

  async patch<T>(path: string, body?: unknown, query?: QueryParams): Promise<T> {
    return this.request<T>('PATCH', path, { body, query });
  }

  async del<T>(path: string, query?: QueryParams): Promise<T> {
    return this.request<T>('DELETE', path, { query });
  }

  /**
   * Upload a file via multipart/form-data.
   * Does NOT set Content-Type — the browser adds the boundary automatically.
   */
  async upload<T>(path: string, formData: FormData): Promise<T> {
    const url = this.buildUrl(path);

    const headers: Record<string, string> = {};
    for (const [k, v] of Object.entries(this.defaultHeaders)) {
      if (k.toLowerCase() !== 'content-type') headers[k] = v;
    }

    console.log(`[API] POST (upload) ${url}`);
    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!res.ok) {
      let errorBody: unknown;
      try {
        errorBody = await res.json();
      } catch {
        errorBody = null;
      }
      const err = new Error(`[POST upload] ${path} - ${res.status} ${res.statusText}`) as Error & {
        status: number;
        body: unknown;
      };
      err.status = res.status;
      err.body = errorBody;
      throw err;
    }

    return res.json() as Promise<T>;
  }

  /** Build a full URL for binary downloads (caller uses window.open or <a>). */
  downloadUrl(path: string): string {
    return this.buildUrl(path);
  }

  setHeader(key: string, value: string): void {
    this.defaultHeaders[key] = value;
  }
}

export const api = new ApiClient();
