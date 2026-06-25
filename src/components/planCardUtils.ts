interface DiscountInfo {
  id: string;
  discountAmount: string;
  description: string | null;
  isActive: boolean;
  billingCycles: number | null;
  [key: string]: unknown;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string | null;
  amount: string;
  currency: string;
  frequency: number;
  frequencyType: string;
  trialDays: number;
  isActive: boolean;
  discount?: DiscountInfo | null;
}

export function computeDiscountedPrice(amount: string, discountAmount: string): number {
  return Number.parseFloat(amount) - Number.parseFloat(discountAmount);
}

function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: currency || 'ARS',
    minimumFractionDigits: 0,
  }).format(amount);
}

function frequencyLabel(freq: number, type: string): string {
  const labels: Record<string, string> = { days: 'dia', months: 'mes', years: 'año' };
  const label = labels[type] || type;
  if (freq === 1) return `/${label}`;
  return `cada ${freq} ${label}${freq > 1 ? (type === 'months' ? 'es' : 's') : ''}`;
}

export function renderPlanCardHTML(plan: SubscriptionPlan): string {
  const originalPrice = formatCurrency(Number.parseFloat(plan.amount), plan.currency);
  const frequency = frequencyLabel(plan.frequency, plan.frequencyType);
  const hasActiveDiscount = plan.discount != null && plan.discount.isActive === true;
  const discountedPrice = hasActiveDiscount
    ? formatCurrency(computeDiscountedPrice(plan.amount, plan.discount.discountAmount), plan.currency)
    : '';
  const discountBadge = hasActiveDiscount
    && plan.discount.description != null
    && plan.discount.description.trim().length > 0
    ? `<span class="badge badge-soft-primary">${plan.discount.description}</span>`
    : '';
  const trialHtml = plan.trialDays > 0
    ? `<div class="flex items-center gap-1.5 mt-3 px-3 py-2 bg-green-50 dark:bg-green-900/20 rounded-xl">
        <span class="material-symbols-outlined text-green-600 dark:text-green-400 text-sm" aria-hidden="true">redeem</span>
        <span class="text-xs font-bold text-green-700 dark:text-green-300">${plan.trialDays} dias de prueba gratis</span>
      </div>`
    : '';
  const priceHtml = hasActiveDiscount
    ? `<div class="flex flex-col gap-1.5">
        <span class="text-3xl font-black" style="text-decoration: line-through; color: var(--color-neutral-400)" aria-label="Precio original: ${originalPrice}">
          ${originalPrice} <span class="text-sm font-medium">${frequency}</span>
        </span>
        <span class="text-2xl font-black" style="color: var(--color-primary)">${discountedPrice}</span>
        ${discountBadge}
      </div>`
    : `<span class="text-3xl font-black text-on-surface">${originalPrice}</span>
      <span class="text-sm text-on-surface-variant font-medium">${frequency}</span>`;

  return `<div class="bg-surface-container-lowest rounded-3xl p-8 border border-outline-variant/10 hover:border-primary/30 hover:shadow-lg transition-all flex flex-col">
    <div class="flex-1">
      <h3 class="text-lg font-extrabold text-on-surface tracking-tight">${plan.name}</h3>
      ${plan.description ? `<p class="text-sm text-on-surface-variant mt-2 leading-relaxed">${plan.description}</p>` : ''}
      ${trialHtml}
      <div class="mt-6">
        ${priceHtml}
      </div>
    </div>
    <button type="button" data-subscribe-plan="${plan.id}"
      class="mt-8 w-full flex items-center justify-center gap-2 px-6 py-4 rounded-2xl font-bold text-sm bg-primary text-on-primary hover:opacity-90 active:scale-[0.98] transition-all">
      <span class="material-symbols-outlined text-sm" aria-hidden="true">credit_card</span>
      Suscribirme
    </button>
  </div>`;
}

// Traceability: implementation by Programmer at 2026-06-25 22:17:00
