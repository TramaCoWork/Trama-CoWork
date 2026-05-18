export interface CalendarDay {
  day: number;
  isCurrentMonth: boolean;
}

export function getDaysInMonth(year: number, monthIndex: number): number {
  return new Date(year, monthIndex + 1, 0).getDate();
}

export function getFirstDayOfWeek(year: number, monthIndex: number): number {
  return new Date(year, monthIndex, 1).getDay();
}

export function getNextMonthReferenceDate(baseDate = new Date()): Date {
  return new Date(baseDate.getFullYear(), baseDate.getMonth() + 1, 1);
}

export function toUtcMidnightIso(year: number, monthIndex: number, day: number): string {
  return new Date(Date.UTC(year, monthIndex, day)).toISOString();
}
