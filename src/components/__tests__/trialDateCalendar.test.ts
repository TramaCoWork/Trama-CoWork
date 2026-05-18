import { describe, expect, it } from 'vitest';
import {
  getDaysInMonth,
  getFirstDayOfWeek,
  getNextMonthReferenceDate,
  toUtcMidnightIso,
} from '../trialDateCalendar';

describe('trialDateCalendar helpers', () => {
  it('returns correct day count for leap year february', () => {
    expect(getDaysInMonth(2024, 1)).toBe(29);
  });

  it('returns correct day count for 31-day month', () => {
    expect(getDaysInMonth(2026, 6)).toBe(31);
  });

  it('returns first day of week index for a month', () => {
    expect(getFirstDayOfWeek(2026, 5)).toBe(1);
  });

  it('defaults to next month reference date', () => {
    const base = new Date(2026, 0, 15);
    const nextMonth = getNextMonthReferenceDate(base);
    expect(nextMonth.getFullYear()).toBe(2026);
    expect(nextMonth.getMonth()).toBe(1);
    expect(nextMonth.getDate()).toBe(1);
  });

  it('builds UTC midnight ISO string', () => {
    expect(toUtcMidnightIso(2026, 5, 1)).toBe('2026-06-01T00:00:00.000Z');
  });
});
