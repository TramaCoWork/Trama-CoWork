/**
 * ProfessionCategoriesService
 * ---------------------------
 * Servicio para la taxonomía de rubros y profesiones.
 * Endpoints:
 *   - GET /profession-categories/rubros          -> Rubros (nivel 1)
 *   - GET /profession-categories/:id/professions -> Profesiones de un rubro
 *   - GET /profession-categories                 -> Árbol completo (3 niveles)
 */

import { api } from './apiClient';

// ─── Tipos ─────────────────────────────────────────────────────

export interface Rubro {
  id: number;
  slug: string;
  name: string;
}

export interface ProfessionCategory {
  id: number;
  slug: string;
  name: string;
  level: number;
  parentId: number | null;
  children?: ProfessionCategory[];
}

// ─── Fetch ─────────────────────────────────────────────────────

/** Rubros (nivel 1) para selectores */
export async function fetchRubros(): Promise<Rubro[]> {
  return api.get<Rubro[]>('/profession-categories/rubros');
}

/** Profesiones de un rubro, agrupadas por sub-rubro */
export async function fetchProfessionsByRubro(rubroId: number): Promise<ProfessionCategory[]> {
  return api.get<ProfessionCategory[]>(`/profession-categories/${rubroId}/professions`);
}

/** Árbol completo (3 niveles) */
export async function fetchFullTree(): Promise<ProfessionCategory[]> {
  return api.get<ProfessionCategory[]>('/profession-categories');
}
