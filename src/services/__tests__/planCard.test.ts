import { describe, expect, it } from 'vitest';

import {
  computeDiscountedPrice,
  renderPlanCardHTML,
  type SubscriptionPlan,
} from '../../components/planCardUtils';

function createPlan(overrides: Partial<SubscriptionPlan> = {}): SubscriptionPlan {
  return {
    id: 'plan-1',
    name: 'Plan Base',
    description: 'Descripcion',
    amount: '1000',
    currency: 'ARS',
    frequency: 1,
    frequencyType: 'months',
    trialDays: 0,
    isActive: true,
    discount: null,
    ...overrides,
  };
}

function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
  }).format(amount);
}

describe('planCardUtils', () => {
  describe('computeDiscountedPrice', () => {
    it('returns 500 for ("1000", "500")', () => {
      expect(computeDiscountedPrice('1000', '500')).toBe(500);
    });

    it('returns 850 for ("1000", "150.00")', () => {
      expect(computeDiscountedPrice('1000', '150.00')).toBe(850);
    });

    it('returns 25000 for ("33000", "8000")', () => {
      expect(computeDiscountedPrice('33000', '8000')).toBe(25000);
    });
  });

  describe('renderPlanCardHTML', () => {
    it('renders active discount with crossed original price, discounted amount and description badge', () => {
      const plan = createPlan({
        amount: '1000',
        discount: {
          id: 'discount-1',
          discountAmount: '150',
          description: 'Primer plan',
          isActive: true,
          billingCycles: null,
        },
      });

      const html = renderPlanCardHTML(plan);
      const formattedDiscountedPrice = formatCurrency(850, plan.currency);

      expect(html).toContain('line-through');
      expect(html).toContain(formattedDiscountedPrice);
      expect(html).toContain('Primer plan');
    });

    it('renders original price without line-through when discount is null', () => {
      const plan = createPlan({
        amount: '1000',
        discount: null,
      });

      const html = renderPlanCardHTML(plan);
      const formattedOriginalPrice = formatCurrency(1000, plan.currency);

      expect(html).not.toContain('line-through');
      expect(html).toContain(formattedOriginalPrice);
    });

    it('does not render discount styling or badge when discount is inactive', () => {
      const plan = createPlan({
        amount: '1000',
        discount: {
          id: 'discount-2',
          discountAmount: '200',
          description: 'Primer plan',
          isActive: false,
          billingCycles: null,
        },
      });

      const html = renderPlanCardHTML(plan);

      expect(html).not.toContain('line-through');
      expect(html).not.toContain('badge badge-soft-primary');
      expect(html).not.toContain('Primer plan');
    });

    it('does not render description badge when active discount description is null', () => {
      const plan = createPlan({
        amount: '1000',
        discount: {
          id: 'discount-3',
          discountAmount: '150',
          description: null,
          isActive: true,
          billingCycles: null,
        },
      });

      const html = renderPlanCardHTML(plan);

      expect(html).not.toContain('badge badge-soft-primary');
    });
  });
});

// Traceability: implementation by Programmer at 2026-06-25 09:44:00
