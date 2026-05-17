/**
 * ProfessionalsService
 * --------------------
 * Llamadas a la API para la pagina de listado de profesionales.
 * Endpoints:
 *   - GET /professionals?page=N&sizePage=N -> PaginatedProfessionalsResponse
 */

import { api } from './apiClient';

const DEFAULT_PHOTO = '/images/default-avatar.svg';
const API_BASE = (import.meta.env.PUBLIC_API_BASE_URL || 'http://localhost:3000').replace(/\/+$/, '');

// ─── Tipos de respuesta API ────────────────────────────────────

export interface ProfessionalItem {
  id: string;
  userId?: string;
  name: string;
  bio: string | null;
  photo: string | null;
  services: string[];
  priceMin: number | null;
  priceMax: number | null;
  city: string | null;
  whatsapp: string | null;
  emailContact: string | null;
  completionPct: number;
  isActive: boolean;
  rubroId: number | null;
  createdAt: string;
  updatedAt: string;
  rubro?: { id: number; slug: string; name: string } | null;
  professionCategories?: { id: number; slug: string; name: string }[];
}

export interface PaginatedProfessionals {
  data: ProfessionalItem[];
  total: number;
  page: number;
  sizePage: number;
}

// ─── Filtros de búsqueda ───────────────────────────────────────

export interface SearchFilters {
  rubro?: string;
  sub_rubro?: string;
  countryId?: number;
  provinceId?: number;
}

// ─── Fetch ─────────────────────────────────────────────────────

export async function fetchProfessionals(page = 1, sizePage = 10): Promise<PaginatedProfessionals> {
  return api.get<PaginatedProfessionals>('/professionals', { page, sizePage });
}

type ProfessionalDetailResponse = {
  userId?: string | null;
  user?: {
    id?: string | null;
  } | null;
};

type DataWrapper<T> = {
  data: T;
};

function unwrapData<T>(value: T | DataWrapper<T>): T {
  if (typeof value === 'object' && value !== null && 'data' in value) {
    return value.data;
  }

  return value;
}

function filterProfessionalsByName(list: ProfessionalItem[], query: string): ProfessionalItem[] {
  const normalizedQuery = query.trim().toLowerCase();
  return list.filter((professional) => professional.name.toLowerCase().includes(normalizedQuery));
}

function pickUserId(detail: ProfessionalDetailResponse): string | null {
  if (typeof detail.userId === 'string' && detail.userId.length > 0) {
    return detail.userId;
  }

  if (typeof detail.user?.id === 'string' && detail.user.id.length > 0) {
    return detail.user.id;
  }

  return null;
}

async function fetchProfessionalUserId(professionalId: string): Promise<string | null> {
  try {
    const response = await api.get<ProfessionalDetailResponse | DataWrapper<ProfessionalDetailResponse>>(
      `/professionals/${professionalId}`,
    );
    return pickUserId(unwrapData(response));
  } catch {
    return null;
  }
}

export async function searchProfessionalsByName(query: string): Promise<ProfessionalItem[]> {
  const normalizedQuery = query.trim();
  if (!normalizedQuery) {
    return [];
  }

  const response = await api.get<PaginatedProfessionals | DataWrapper<ProfessionalItem[]>>('/professionals', {
    page: 1,
    sizePage: 50,
    search: normalizedQuery,
  });

  const professionals = Array.isArray(response.data) ? response.data : [];
  const matches = filterProfessionalsByName(professionals, normalizedQuery).slice(0, 20);
  const enrichedMatches = await Promise.all(
    matches.map(async (professional) => {
      if (professional.userId) {
        return professional;
      }

      const userId = await fetchProfessionalUserId(professional.id);
      return userId ? { ...professional, userId } : professional;
    }),
  );

  return enrichedMatches.filter((professional) => typeof professional.userId === 'string' && professional.userId.length > 0);
}

/** Buscar profesionales con filtros avanzados (GET /search) */
export async function searchProfessionals(filters: SearchFilters): Promise<ProfessionalItem[]> {
  const params: Record<string, string | number> = {};
  if (filters.rubro) params.rubro = filters.rubro;
  if (filters.sub_rubro) params.sub_rubro = filters.sub_rubro;
  if (filters.countryId) params.countryId = filters.countryId;
  if (filters.provinceId) params.provinceId = filters.provinceId;
  const response = await api.get<ProfessionalItem[] | DataWrapper<ProfessionalItem[]>>('/search', params);
  return unwrapData(response);
}

// ─── Render helpers (vanilla JS) ───────────────────────────────

function renderCard(pro: ProfessionalItem): string {
  const photo = `${API_BASE}/uploads/photo/${pro.id}`;
  const rubroName = pro.rubro?.name || '';
  const service = pro.services.length > 0 ? pro.services[0] : '';
  const priceLabel =
    pro.priceMin != null && pro.priceMax != null
      ? `$${pro.priceMin} - $${pro.priceMax}`
      : pro.priceMin != null
        ? `$${pro.priceMin}`
        : pro.priceMax != null
          ? `$${pro.priceMax}`
          : '';

  return `
    <article class="group bg-surface-container-lowest hover:bg-surface-container-lowest rounded-3xl p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col md:flex-row gap-8 relative overflow-hidden">
      <div class="w-full md:w-64 h-64 shrink-0 rounded-2xl overflow-hidden relative">
        <img
          class="w-full h-full object-cover"
          alt="Foto de ${pro.name}"
          src="${photo}"
          onerror="this.onerror=null;this.src='${DEFAULT_PHOTO}'"
          loading="lazy"
        />
      </div>
      <div class="flex-1 flex flex-col justify-between py-2">
        <div class="space-y-4">
          <div class="flex justify-between items-start">
            <div>
              <div class="flex items-center gap-2 text-secondary font-bold text-xs uppercase tracking-widest mb-1">
                <span class="material-symbols-outlined text-sm" aria-hidden="true">work</span>
                ${rubroName || service}
              </div>
              <h2 class="text-2xl font-extrabold tracking-tight text-on-surface">${pro.name}</h2>
            </div>
            ${pro.city ? `<span class="text-sm text-on-surface-variant font-medium flex items-center gap-1"><span class="material-symbols-outlined text-sm" aria-hidden="true">location_on</span>${pro.city}</span>` : ''}
          </div>
          ${pro.bio ? `<p class="text-on-surface-variant text-sm line-clamp-2 leading-relaxed font-medium">${pro.bio}</p>` : ''}
          ${
            pro.services.length > 0
              ? `<div class="flex flex-wrap gap-2">${pro.services
                  .slice(0, 3)
                  .map((s, i) => {
                    const styles = [
                      'bg-primary-fixed text-on-primary-fixed-variant',
                      'bg-secondary-fixed text-on-secondary-fixed-variant',
                      'bg-tertiary-fixed text-on-tertiary-fixed-variant',
                    ];
                    return `<span class="px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-tight ${styles[i % styles.length]}">${s}</span>`;
                  })
                  .join('')}</div>`
              : ''
          }
        </div>
        <div class="pt-6 mt-4 border-t border-surface-variant flex items-center justify-between">
          <div>
            ${
              priceLabel
                ? `<span class="text-outline text-xs block font-bold uppercase tracking-widest">Rango</span>
                   <div class="flex items-baseline gap-1">
                     <span class="text-3xl font-black text-on-surface">${priceLabel}</span>
                   </div>`
                : ''
            }
          </div>
          <a
            href="/profesionales/perfil?id=${pro.id}"
            class="bg-primary hover:bg-primary-container text-on-primary px-8 py-3 rounded-xl font-bold transition-all active:scale-95 flex items-center gap-2"
          >
            Ver perfil
            <span class="material-symbols-outlined text-xl" aria-hidden="true">arrow_forward</span>
          </a>
        </div>
      </div>
    </article>
  `;
}

function renderPagination(page: number, totalPages: number): string {
  if (totalPages <= 1) return '';

  const prevDisabled = page <= 1;
  const nextDisabled = page >= totalPages;

  const prevBtn = prevDisabled
    ? `<span class="w-12 h-12 flex items-center justify-center rounded-full bg-surface-container-highest text-outline/50 cursor-not-allowed"><span class="material-symbols-outlined" aria-hidden="true">chevron_left</span></span>`
    : `<button data-page="${page - 1}" class="pagination-btn w-12 h-12 flex items-center justify-center rounded-full bg-surface-container-highest text-on-surface hover:bg-outline-variant transition-colors" aria-label="Página anterior"><span class="material-symbols-outlined" aria-hidden="true">chevron_left</span></button>`;

  const nextBtn = nextDisabled
    ? `<span class="w-12 h-12 flex items-center justify-center rounded-full bg-surface-container-highest text-outline/50 cursor-not-allowed"><span class="material-symbols-outlined" aria-hidden="true">chevron_right</span></span>`
    : `<button data-page="${page + 1}" class="pagination-btn w-12 h-12 flex items-center justify-center rounded-full bg-surface-container-highest text-on-surface hover:bg-outline-variant transition-colors" aria-label="Página siguiente"><span class="material-symbols-outlined" aria-hidden="true">chevron_right</span></button>`;

  let pagesHtml = '';
  for (let i = 1; i <= totalPages; i++) {
    if (totalPages > 5 && i > 3 && i < totalPages) {
      if (i === 4)
        pagesHtml += `<span class="w-12 h-12 flex items-center justify-center text-outline" aria-hidden="true">...</span>`;
      continue;
    }
    const activeClass =
      i === page
        ? 'bg-primary text-on-primary'
        : 'bg-surface-container-lowest text-on-surface hover:bg-surface-variant';
    pagesHtml += `<button data-page="${i}" class="pagination-btn w-12 h-12 flex items-center justify-center rounded-full font-bold transition-colors ${activeClass}" aria-label="Página ${i}" ${i === page ? 'aria-current="page"' : ''}>${i}</button>`;
  }

  return `
    <nav class="pt-12 flex justify-center items-center gap-4" aria-label="Paginación">
      ${prevBtn}
      <div class="flex gap-2">${pagesHtml}</div>
      ${nextBtn}
    </nav>
  `;
}

export async function renderProfessionalsList(
  listId: string,
  countId: string,
  paginationId: string,
  loadingId: string,
  errorId: string,
  page = 1,
  sizePage = 10,
): Promise<void> {
  const listEl = document.getElementById(listId);
  const countEl = document.getElementById(countId);
  const paginationEl = document.getElementById(paginationId);
  const loadingEl = document.getElementById(loadingId);
  const errorEl = document.getElementById(errorId);

  if (loadingEl) loadingEl.classList.remove('hidden');
  if (listEl) listEl.innerHTML = '';
  if (errorEl) errorEl.classList.add('hidden');

  try {
    const result = await fetchProfessionals(page, sizePage);
    const totalPages = Math.ceil(result.total / result.sizePage);

    if (loadingEl) loadingEl.classList.add('hidden');

    if (countEl) {
      countEl.innerHTML = `<span class="font-bold text-on-surface">${result.total}</span> profesionales encontrados`;
    }

    if (listEl) {
      listEl.innerHTML = result.data.map(renderCard).join('');
    }

    if (paginationEl) {
      paginationEl.innerHTML = renderPagination(result.page, totalPages);

      // Bind pagination clicks
      paginationEl.querySelectorAll('.pagination-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
          const targetPage = Number((btn as HTMLElement).dataset.page);
          renderProfessionalsList(listId, countId, paginationId, loadingId, errorId, targetPage, sizePage);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        });
      });
    }
  } catch (err) {
    console.error('Error cargando profesionales:', err);
    if (loadingEl) loadingEl.classList.add('hidden');
    if (errorEl) errorEl.classList.remove('hidden');
  }
}
