/**
 * HomeService
 * -----------
 * Llamadas a la API para la pagina Home.
 * Endpoints:
 *   - GET /profession-categories/rubros -> Lista de rubros
 *   - GET /professionals/featured       -> Profesionales destacados para portada
 */

import { api } from './apiClient';
import { fetchRubros, type Rubro } from './professionCategoriesService';

// ─── Tipos de respuesta API ────────────────────────────────────

/** @deprecated Usar Rubro en su lugar */
export type ApiCategory = Rubro;

export interface ApiFeaturedProfessional {
  id: number;
  name: string;
  photo: string | null;
  priceMin: number;
  priceMax: number;
  services: string[];
  rubro?: { id: number; slug: string; name: string } | null;
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
