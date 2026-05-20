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

// ─── Tipos de respuesta API ────────────────────────────────────

/** @deprecated Usar Rubro en su lugar */
export type ApiCategory = Rubro;

export interface ApiFeaturedProfessional {
  id: number;
  name: string;
  photo: string | null;
  priceMin: number | null;
  priceMax: number | null;
  services: string[];
  rubro?: { id: number; slug: string; name: string } | null;
  city?: string | null;
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

export async function fetchFeaturedProfessionalsSection(
  limit: number = 8,
): Promise<ApiFeaturedProfessional[]> {
  const res = await fetch(apiURL('/professionals/featured'));
  if (!res.ok) {
    throw new Error(`Error fetching featured professionals: ${res.status}`);
  }
  const data: ApiFeaturedProfessional[] = await res.json();
  return data.slice(0, limit);
}

export async function renderFeaturedSection(containerId: string): Promise<void> {
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
        const photo = pro.photo ?? DEFAULT_PHOTO;
        const category = pro.rubro?.name ?? (pro.services?.[0] ?? '');
        const city = pro.city ?? '';
        const price =
          pro.priceMin != null ? `$${pro.priceMin.toLocaleString('es-AR')} ARS` : '';
        return `
        <a href="/profesionales/perfil?id=${pro.id}" class="block group-link">
          <article class="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 p-6 flex flex-col items-center text-center cursor-pointer group">
            <div class="w-24 h-24 rounded-full overflow-hidden mb-4 ring-2 ring-primary/20 group-hover:ring-primary/60 transition-all duration-300">
              <img src="${photo}" alt="${pro.name}" class="w-full h-full object-cover" onerror="this.src='${DEFAULT_PHOTO}'" />
            </div>
            <h3 class="text-base font-bold text-neutral-900 mb-1 leading-tight">${pro.name}</h3>
            ${category ? `<span class="text-xs font-bold text-primary tracking-widest uppercase mb-2">${category}</span>` : ''}
            ${city ? `<p class="text-sm text-neutral-600 flex items-center gap-1 justify-center mb-3"><svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5 text-primary flex-shrink-0" viewBox="0 0 24 24" fill="currentColor"><path fill-rule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-2.079 3.218-4.402 3.218-7.327a7.5 7.5 0 10-15 0c0 2.925 1.274 5.248 3.218 7.327a19.579 19.579 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd" /></svg><span>${city}</span></p>` : '<div class="mb-3"></div>'}
            ${price ? `<p class="text-lg font-black text-primary mt-auto">${price}</p>` : ''}
          </article>
        </a>
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
              <span class="text-xs text-outline block font-medium">Desde</span>
              <span class="text-lg font-black text-on-surface">$${pro.priceMin}<span class="text-sm font-medium text-outline">/hr</span></span>
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
            href="/profesionales/perfil?id=${pro.id}"
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

// Traceability: generated by Programmer at 2026-05-20 16:20:40
