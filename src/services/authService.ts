/**
 * AuthService
 * -----------
 * Llamadas a la API de autenticacion.
 * Endpoints:
 *   - POST /auth/login  -> { email, password } => { access_token } | { error }
 */

import { api } from './apiClient';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
}

export interface LoginError {
  error: string;
}

const TOKEN_KEY = 'trama_access_token';

function parseJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(payload);
  } catch {
    return null;
  }
}

function isTokenExpired(token: string): boolean {
  const payload = parseJwtPayload(token);
  if (!payload || typeof payload.exp !== 'number') return true;
  return Date.now() >= payload.exp * 1000;
}

export async function login(credentials: LoginRequest): Promise<LoginResponse> {
  const data = await api.post<LoginResponse>('/auth/login', credentials);
  localStorage.setItem(TOKEN_KEY, data.access_token);
  api.setHeader('Authorization', `Bearer ${data.access_token}`);
  return data;
}

export async function adminLogin(credentials: LoginRequest): Promise<LoginResponse> {
  const data = await api.post<LoginResponse>('/auth/admin/login', credentials);
  localStorage.setItem(TOKEN_KEY, data.access_token);
  api.setHeader('Authorization', `Bearer ${data.access_token}`);
  return data;
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function isAuthenticated(): boolean {
  const token = getToken();
  if (!token) return false;
  if (isTokenExpired(token)) {
    localStorage.removeItem(TOKEN_KEY);
    return false;
  }
  return true;
}

export function logout(redirectTo = '/login'): void {
  localStorage.removeItem(TOKEN_KEY);
  window.location.href = redirectTo;
}

export function getUserIdFromToken(): string | null {
  const token = getToken();
  if (!token) return null;
  const payload = parseJwtPayload(token);
  if (!payload || typeof payload.sub !== 'string') return null;
  return payload.sub;
}

export function getEmailFromToken(): string | null {
  const token = getToken();
  if (!token) return null;
  const payload = parseJwtPayload(token);
  if (!payload || typeof payload.email !== 'string') return null;
  return payload.email;
}

export function getRoleFromToken(): string | null {
  const token = getToken();
  if (!token) return null;
  const payload = parseJwtPayload(token);
  if (!payload || typeof payload.role !== 'string') return null;
  return payload.role;
}

export function restoreSession(): void {
  const token = getToken();
  if (token && !isTokenExpired(token)) {
    api.setHeader('Authorization', `Bearer ${token}`);
  } else if (token) {
    localStorage.removeItem(TOKEN_KEY);
  }
}

// ─── Professional Register ─────────────────────────────────────

export interface ProfessionalRegisterRequest {
  email: string;
  password: string;
  name: string;
  city?: string;
  rubroId?: number;
  whatsapp?: string;
  countryId?: number;
  provinceId?: number;
}

export interface RegisterResponse {
  access_token: string;
  userId: string;
}

export async function professionalRegister(
  data: ProfessionalRegisterRequest,
): Promise<RegisterResponse> {
  const res = await api.post<RegisterResponse>('/auth/professional-register', data);
  localStorage.setItem(TOKEN_KEY, res.access_token);
  api.setHeader('Authorization', `Bearer ${res.access_token}`);
  return res;
}

// ─── Password Recovery ─────────────────────────────────────────

export async function forgotPassword(email: string): Promise<void> {
  await api.post('/auth/forgot-password', { email });
}

export async function resetPassword(
  userId: string,
  token: string,
  newPassword: string,
): Promise<void> {
  await api.post('/auth/reset-password', { userId, token, newPassword });
}
