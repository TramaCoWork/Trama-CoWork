/**
 * Catalog Service
 * ───────────────
 * Fetches dynamic catalogs from /catalogs/* endpoints.
 * Provides human-readable labels (Spanish) for each catalog value.
 */

import { api } from './apiClient';

// ─── Label maps (Spanish) ──────────────────────────────────────
const LABELS: Record<string, Record<string, string>> = {
  'education-levels': {
    secundario: 'Secundario',
    terciario: 'Terciario',
    universitario: 'Universitario',
    posgrado: 'Posgrado',
    maestria: 'Maestría',
    doctorado: 'Doctorado',
    certificacion: 'Certificación',
  },
  'work-modalities': {
    presencial: 'Presencial',
    online: 'Online',
    ambas: 'Ambas',
  },
  'work-types': {
    independiente: 'Independiente',
    freelance: 'Freelance',
    emprendedor: 'Emprendedor',
    otro: 'Otro',
  },
  'usage-frequencies': {
    daily: 'Diario',
    three_four_weekly: '3-4 veces por semana',
    occasional: 'Ocasional',
  },
  'document-types': {
    dni: 'DNI',
    cv: 'CV',
    title: 'Título',
    certificate: 'Certificado',
  },
};

export interface CatalogItem {
  value: string;
  label: string;
}

// Simple in-memory cache to avoid repeated fetches within the same session
const cache: Record<string, CatalogItem[]> = {};

/**
 * Fetch a catalog by name from `/catalogs/{name}`.
 * Returns `{ value, label }[]` with Spanish labels.
 */
export async function fetchCatalog(name: string): Promise<CatalogItem[]> {
  if (cache[name]) return cache[name];

  const values = await api.get<string[]>(`/catalogs/${name}`);
  const labels = LABELS[name] || {};
  const items = values.map(v => ({ value: v, label: labels[v] || v }));
  cache[name] = items;
  return items;
}

/**
 * Get a human-readable label for a catalog value (sync, from label map).
 */
export function getCatalogLabel(catalog: string, value: string): string {
  return LABELS[catalog]?.[value] || value;
}

/**
 * Populate a `<select>` element with catalog items.
 * Keeps the first `<option>` (placeholder) and appends catalog options.
 */
export function populateSelect(select: HTMLSelectElement, items: CatalogItem[], currentValue?: string): void {
  // Remove all options except the first placeholder
  while (select.options.length > 1) select.remove(1);
  items.forEach(item => {
    const opt = document.createElement('option');
    opt.value = item.value;
    opt.textContent = item.label;
    select.appendChild(opt);
  });
  if (currentValue) select.value = currentValue;
}
