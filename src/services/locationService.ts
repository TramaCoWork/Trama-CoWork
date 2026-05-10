/**
 * LocationService
 * ---------------
 * Servicio para la jerarquía de ubicaciones geográficas.
 * Endpoints:
 *   - GET /locations/countries                      -> Países
 *   - GET /locations/countries/:countryId/provinces  -> Provincias de un país
 */

import { api } from './apiClient';

// ─── Tipos ─────────────────────────────────────────────────────

export interface Country {
  id: number;
  name: string;
  code: string;
}

export interface Province {
  id: number;
  name: string;
  countryId: number;
}

// ─── Funciones ─────────────────────────────────────────────────

export async function fetchCountries(): Promise<Country[]> {
  return api.get<Country[]>('/locations/countries');
}

export async function fetchProvinces(countryId: number): Promise<Province[]> {
  return api.get<Province[]>(`/locations/countries/${countryId}/provinces`);
}
