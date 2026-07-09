/**
 * HomeService
 * -----------
 * Llamadas a la API para la pagina Home.
 * Endpoints:
 *   - GET /profession-categories/rubros -> Lista de rubros
 *   - GET /professionals/featured       -> Profesionales destacados para portada
 */

import { api, apiURL } from './apiClient';
import { fetchRubros, type Rubro } from './professionCategoriesService';
import { buildProfileSlug } from '../utils/helpers';

// ─── Tipos de respuesta API ────────────────────────────────────

/** @deprecated Usar Rubro en su lugar */
export type ApiCategory = Rubro;

export interface ApiFeaturedProfessional {
  id: number;
  publicId?: number;
  name: string;
  photo: string | null;
  pricePerHour?: number;
  services: string[];
  rubro?: { id: number; slug: string; name: string } | null;
  professionCategories?: { id: number; slug: string; name: string }[];
  city?: string | null;
  rating?: number;
  reviewCount?: number;
}

const DEFAULT_PHOTO = '/images/default-avatar.svg';
const API_BASE = (import.meta.env.PUBLIC_API_BASE_URL || 'http://localhost:3000').replace(/\/+$/, '');

// ─── Rubros (antes Categorias) ─────────────────────────────────

/** @deprecated Usar fetchRubros() directamente */
export async function fetchCategorias(): Promise<Rubro[]> {
  return fetchRubros();
}

export { fetchRubros };

// ─── Profesionales destacados ──────────────────────────────────

export async function fetchFeaturedProfessionals(): Promise<ApiFeaturedProfessional[]> {
  return api.get<ApiFeaturedProfessional[]>('/professionals/featured');
}

export async function fetchFeaturedProfessionalsSection(limit: number = 8): Promise<ApiFeaturedProfessional[]> {
  const res = await fetch(apiURL('/professionals/featured'));
  if (!res.ok) {
    throw new Error(`Error fetching featured professionals: ${res.status}`);
  }
  const data: ApiFeaturedProfessional[] = await res.json();
  return data.slice(0, limit);
}

export async function renderFeaturedSection(containerId: string): Promise<void> {
  const escapeHtml = (str: string): string =>
    str
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');

  const container = document.getElementById(containerId);
  if (!container) return;
  try {
    const professionals = await fetchFeaturedProfessionalsSection(8);
    if (!professionals.length) {
      container.innerHTML = '';
      return;
    }
    container.innerHTML = professionals
      .map((pro) => {
        const photo = `${API_BASE}/uploads/photo/${pro.id}`;
        // Hasta 3 categorías de profesión; si no hay, usar el rubro o el primer servicio.
        const categoryNames = (pro.professionCategories ?? [])
          .map((c) => c.name)
          .filter(Boolean)
          .slice(0, 3);
        if (categoryNames.length === 0) {
          const fallback = pro.rubro?.name ?? pro.services?.[0] ?? '';
          if (fallback) categoryNames.push(fallback);
        }
        const chipStyle =
          'display: inline-block; background: #E6F4F5; color: #087781; font-size: 11px; font-weight: 500; line-height: 16px; padding: 2px 8px; border-radius: 20px; max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;';
        // Reservar el alto de 3 chips (3 × 20px + 2 × gap 4px) para que las cards queden parejas.
        const categoriesHtml = categoryNames.length
          ? `<div style="display: flex; flex-direction: column; align-items: flex-start; gap: 4px; min-height: 68px;">${categoryNames
              .map((c) => `<span style="${chipStyle}" title="${escapeHtml(c)}">${escapeHtml(c)}</span>`)
              .join('')}</div>`
          : '';
        const city = escapeHtml(pro.city ?? '');
        const name = escapeHtml(pro.name);
        const escapedPrice = escapeHtml(String(pro.pricePerHour ?? ''));
        const priceLabel = pro.pricePerHour ? `Desde $${escapedPrice} / hr` : 'Consultar precio';
        const profileHref = pro.publicId
          ? `/profesionales/${buildProfileSlug(pro.name, pro.publicId)}`
          : `/profesionales/perfil?id=${pro.id}`;
        return `
        <article style="background: white; border-radius: 20px; border: 1px solid #EDEDED; padding: 20px; display: flex; flex-direction: column; gap: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.04); transition: transform 0.15s ease, box-shadow 0.15s ease;" onmouseover="this.style.transform='translateY(-4px)';this.style.boxShadow='0 12px 28px rgba(0,0,0,0.08)'" onmouseout="this.style.transform='';this.style.boxShadow='0 2px 8px rgba(0,0,0,0.04)'">
            <div style="display: flex; gap: 12px; align-items: flex-start;">
              <div style="position: relative; flex-shrink: 0;">
                <img src="${photo}" alt="${name}" style="width: 72px; height: 72px; border-radius: 50%; object-fit: cover;" onerror="this.src='${DEFAULT_PHOTO}'" />
                <span style="position: absolute; bottom: 0; right: 0; width: 20px; height: 20px; background: #087781; border-radius: 50%; border: 2px solid white; display: flex; align-items: center; justify-content: center;" aria-hidden="true">
                  <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12 4 4 10-10" /></svg>
                </span>
              </div>

              <div style="display: flex; flex-direction: column; gap: 4px; flex: 1; min-width: 0;">
                <h3 style="font-size: 15px; font-weight: 700; color: #404040; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin: 0;">${name}</h3>
                ${categoriesHtml}
                ${city ? `<p style="font-size: 12px; color: #737373; display: flex; align-items: center; gap: 4px; margin: 0;"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#087781" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg><span>${city}</span></p>` : ''}
              </div>
            </div>

            <p style="font-size: 15px; font-weight: 700; color: #404040; margin: 4px 0 0 0; text-align: center;">${priceLabel}</p>

            <a href="${profileHref}" style="display: block; width: 100%; text-align: center; padding: 9px; border: 1.5px solid #087781; border-radius: 10px; color: #087781; font-size: 14px; font-weight: 500; text-decoration: none; transition: background 0.15s;" onmouseover="this.style.background='#087781';this.style.color='white'" onmouseout="this.style.background='';this.style.color='#087781'">Ver perfil →</a>
          </article>
      `;
      })
      .join('');
  } catch (err) {
    console.error('[renderFeaturedSection]', err);
    container.innerHTML = '';
  }
}

// ─── Render helpers (vanilla JS) ───────────────────────────────

export async function renderFeaturedProfessionals(containerId: string): Promise<void> {
  try {
    const profesionales = await fetchFeaturedProfessionals();
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = profesionales
      .map((pro) => {
        const photo = `${API_BASE}/uploads/photo/${pro.id}`;
        const service = pro.services.length > 0 ? pro.services[0] : '';
        const rating = 0;
        const fullStars = Math.floor(rating);
        const emptyStars = 5 - fullStars;
        const profileHref = pro.publicId
          ? `/profesionales/${buildProfileSlug(pro.name, pro.publicId)}`
          : `/profesionales/perfil?id=${pro.id}`;

        return `
      <article class="bg-surface-container-lowest rounded-xl overflow-hidden group hover:shadow-xl transition-all duration-500">
        <div class="aspect-[4/3] overflow-hidden relative">
          <img
            alt="Foto de perfil de ${pro.name}"
            class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            src="${photo}"
            onerror="this.onerror=null;this.src='${DEFAULT_PHOTO}'"
            loading="lazy"
          />
        </div>
        <div class="p-8">
          <div class="flex justify-between items-start mb-4">
            <div>
              <span class="text-xs font-bold text-primary tracking-widest uppercase mb-1 block">${service}</span>
              <h3 class="text-xl font-bold text-on-surface">${pro.name}</h3>
            </div>
            <div class="text-right">
              ${
                pro.pricePerHour != null
                  ? `<span class="text-xs text-outline block font-medium">Precio por hora</span>
              <span class="text-lg font-black text-on-surface">$${pro.pricePerHour}<span class="text-sm font-medium text-outline">/hr</span></span>`
                  : ''
              }
            </div>
          </div>
          <div class="flex items-center gap-1 mb-6" role="img" aria-label="${rating} de 5 estrellas">
            ${'<span class="material-symbols-outlined text-sm filled text-star" aria-hidden="true">star</span>'.repeat(fullStars)}
            ${'<span class="material-symbols-outlined text-sm text-star-empty" aria-hidden="true">star</span>'.repeat(emptyStars)}
            <span class="text-xs font-bold ml-2 text-on-surface-variant">
              ${rating} (0 rese&ntilde;as)
            </span>
          </div>
          <a
            href="${profileHref}"
            class="block w-full py-4 bg-surface-container-low text-on-surface font-bold rounded-lg hover:bg-primary hover:text-on-primary transition-all duration-300 text-center"
          >
            Ver perfil
          </a>
        </div>
      </article>
    `;
      })
      .join('');
  } catch (err) {
    console.error('Error cargando profesionales destacados:', err);
  }
}

// Trazabilidad: editado por Programmer en 2026-06-02 18:10:00
