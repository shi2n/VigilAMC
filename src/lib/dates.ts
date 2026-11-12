/**
 * VigilAMC Centralized Date Library
 *
 * THE SINGLE SOURCE OF TRUTH for all calendar date parsing, formatting,
 * and arithmetic across the VigilAMC platform.
 *
 * Principles:
 * 1. Pure Calendar Dates: A calendar date is a year, month, and day (e.g. 2026-11-10).
 *    It has NO time-of-day and NO timezone. It must NEVER be parsed via `new Date('YYYY-MM-DD')`
 *    which parses as UTC midnight and drifts across timezones.
 * 2. Exact Calendar Math: Adding 1 month to 2026-01-31 yields 2026-02-28 (clamped to month end),
 *    never 2026-03-03 or 30-day approximations.
 * 3. Exact Day Boundaries: calendarDayDiff calculates whole integer days on date boundaries.
 *    Due today = 0 ("Due today"). Due tomorrow = +1 ("1d left"). Due in 2 days = +2 ("2d left").
 *    Yesterday = -1 ("1d overdue").
 * 4. Stable Formatting: formatDisplay produces uniform "10 Nov 2026" without SSR hydration mismatches.
 * 5. DB Normalization: when saving to PostgreSQL DateTime columns, normalize to Noon UTC (12:00:00Z)
 *    so timezone conversion in any timezone worldwide (UTC-11 to UTC+12) stays on the identical calendar date.
 */

export interface CalendarDate {
  year: number;
  month: number; // 1 - 12
  day: number;   // 1 - 31
}

export type CalendarDateInput = string | Date | CalendarDate | null | undefined;

export interface DueStateResult {
  state: 'EXPIRED' | 'DUE_SOON' | 'OK';
  label: string;            // '2d left' | 'Due today' | '1d overdue'
  chipLabel: string;        // '2d left' | 'Due today' | '1d overdue' | '3 mos left'
  daysDiff: number | null;  // positive = future, 0 = today, negative = past
  monthsLeft: number | null;
  color: string;            // '#DC2626' (EXPIRED) | '#D97706' (DUE_SOON) | '#059669' (OK)
  badgeClass: string;       // Tailwind badge class matching status
}

export const STATUS_COLORS = {
  EXPIRED: '#DC2626',
  DUE_SOON: '#D97706',
  OK: '#059669',
} as const;

const MONTH_NAMES_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

const MONTH_NAMES_LONG = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

/**
 * Returns true if a year is a leap year in the Gregorian calendar.
 */
export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
}

/**
 * Returns the exact number of days in a given calendar month (1-12).
 */
export function daysInMonth(year: number, month: number): number {
  if (month < 1 || month > 12) return 30;
  if (month === 2) {
    return isLeapYear(year) ? 29 : 28;
  }
  if (month === 4 || month === 6 || month === 9 || month === 11) {
    return 30;
  }
  return 31;
}

/**
 * Parse any date input into a pure CalendarDate ({ year, month, day }).
 * NEVER uses `new Date(string)` UTC parsing for calendar date strings.
 */
export function parseCalendarDate(input: CalendarDateInput): CalendarDate | null {
  if (!input) return null;

  // Already a CalendarDate object
  if (typeof input === 'object' && !(input instanceof Date)) {
    if (
      typeof input.year === 'number' &&
      typeof input.month === 'number' &&
      typeof input.day === 'number' &&
      !isNaN(input.year) &&
      !isNaN(input.month) &&
      !isNaN(input.day)
    ) {
      return {
        year: input.year,
        month: Math.max(1, Math.min(12, input.month)),
        day: Math.max(1, Math.min(31, input.day)),
      };
    }
    return null;
  }

  // Date object: extract local year, month, day
  if (input instanceof Date) {
    if (isNaN(input.getTime())) return null;
    return {
      year: input.getFullYear(),
      month: input.getMonth() + 1,
      day: input.getDate(),
    };
  }

  if (typeof input !== 'string') return null;

  const trimmed = input.trim();
  if (!trimmed) return null;

  // Pattern 1: YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss.sssZ
  const isoMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) {
    const year = parseInt(isoMatch[1], 10);
    const month = parseInt(isoMatch[2], 10);
    const day = parseInt(isoMatch[3], 10);
    if (month >= 1 && month <= 12 && day >= 1 && day <= daysInMonth(year, month)) {
      return { year, month, day };
    }
  }

  // Pattern 2: DD/MM/YYYY or DD-MM-YYYY (common in Indian / UK data imports)
  const dmyMatch = trimmed.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})/);
  if (dmyMatch) {
    const day = parseInt(dmyMatch[1], 10);
    const month = parseInt(dmyMatch[2], 10);
    const year = parseInt(dmyMatch[3], 10);
    if (month >= 1 && month <= 12 && day >= 1 && day <= daysInMonth(year, month)) {
      return { year, month, day };
    }
  }

  // Fallback for JS Date string if valid
  const parsed = new Date(trimmed);
  if (!isNaN(parsed.getTime())) {
    return {
      year: parsed.getFullYear(),
      month: parsed.getMonth() + 1,
      day: parsed.getDate(),
    };
  }

  return null;
}

/**
 * Format a CalendarDate to 'YYYY-MM-DD'
 */
export function calendarDateToString(cd: CalendarDate): string {
  const yyyy = String(cd.year).padStart(4, '0');
  const mm = String(cd.month).padStart(2, '0');
  const dd = String(cd.day).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

/**
 * toDateInputString(d) → LOCAL yyyy-mm-dd for type="date" input binding.
 * NEVER uses `.toISOString().split('T')[0]`.
 */
export function toDateInputString(d: CalendarDateInput): string {
  const cd = parseCalendarDate(d);
  if (!cd) return '';
  return calendarDateToString(cd);
}

/**
 * Returns today's calendar date as a CalendarDate object.
 */
export function todayCalendarDate(): CalendarDate {
  const now = new Date();
  return {
    year: now.getFullYear(),
    month: now.getMonth() + 1,
    day: now.getDate(),
  };
}

/**
 * Returns today's calendar date as a 'YYYY-MM-DD' string.
 */
export function todayCalendarDateString(): string {
  return calendarDateToString(todayCalendarDate());
}

/**
 * addCalendarMonths(dateStr, n) → same day-of-month, clamp to month end.
 * Example: 2026-01-31 + 1mo = 2026-02-28 (clamped).
 * Example: 2025-10-16 + 6mo = 2026-04-16.
 * Example: 2025-10-16 + 12mo = 2026-10-16.
 */
export function addCalendarMonths(dateInput: CalendarDateInput, months: number): string {
  const cd = parseCalendarDate(dateInput) || todayCalendarDate();
  const n = Math.trunc(Number(months) || 0);

  const totalMonths = cd.month - 1 + n;
  const targetYear = cd.year + Math.floor(totalMonths / 12);
  const targetMonth = ((totalMonths % 12) + 12) % 12 + 1;

  const maxDays = daysInMonth(targetYear, targetMonth);
  const targetDay = Math.min(cd.day, maxDays);

  return calendarDateToString({
    year: targetYear,
    month: targetMonth,
    day: targetDay,
  });
}

/**
 * addCalendarDays(dateStr, n) → whole days on calendar boundaries.
 * Example: 2026-11-10 + 2 = 2026-11-12.
 * Example: 2026-11-10 - 5 = 2026-11-05.
 */
export function addCalendarDays(dateInput: CalendarDateInput, days: number): string {
  const cd = parseCalendarDate(dateInput) || todayCalendarDate();
  const n = Math.trunc(Number(days) || 0);

  // Use pure UTC noon arithmetic to safely calculate days across calendar boundaries without timezone or DST drift
  const ms = Date.UTC(cd.year, cd.month - 1, cd.day, 12, 0, 0) + n * 86400000;
  const target = new Date(ms);

  return calendarDateToString({
    year: target.getUTCFullYear(),
    month: target.getUTCMonth() + 1,
    day: target.getUTCDate(),
  });
}

/**
 * calendarDayDiff(a, b) → whole days on date-only boundaries (due today = 0).
 * If `a` is due date and `b` is today (or base date):
 * - If `a` is due 2 days from today, returns +2.
 * - If `a` is due today, returns 0.
 * - If `a` was due yesterday, returns -1.
 */
export function calendarDayDiff(a: CalendarDateInput, b?: CalendarDateInput): number {
  const cdA = parseCalendarDate(a);
  const cdB = parseCalendarDate(b || todayCalendarDate());
  if (!cdA || !cdB) return 0;

  const msA = Date.UTC(cdA.year, cdA.month - 1, cdA.day, 12, 0, 0);
  const msB = Date.UTC(cdB.year, cdB.month - 1, cdB.day, 12, 0, 0);

  return Math.round((msA - msB) / 86400000);
}

/**
 * formatDisplay(dateStr) → the display style each screen uses (e.g. "27 Apr 2027"),
 * 100% deterministic, locale-stable, zero hydration mismatches.
 */
export function formatDisplay(
  dateInput: CalendarDateInput,
  options?: {
    fallback?: string;
    includeYear?: boolean;
    format?: 'short' | 'long' | 'dmy' | 'iso';
  }
): string {
  const fallback = options?.fallback ?? '—';
  const cd = parseCalendarDate(dateInput);
  if (!cd) return fallback;

  const fmt = options?.format ?? 'short';
  if (fmt === 'iso') {
    return calendarDateToString(cd);
  }
  if (fmt === 'dmy') {
    return `${String(cd.day).padStart(2, '0')}/${String(cd.month).padStart(2, '0')}/${cd.year}`;
  }

  const monthName = fmt === 'long'
    ? MONTH_NAMES_LONG[cd.month - 1]
    : MONTH_NAMES_SHORT[cd.month - 1];

  if (options?.includeYear === false) {
    return `${cd.day} ${monthName}`;
  }

  return `${cd.day} ${monthName} ${cd.year}`;
}

/**
 * dueState(dateStr, today?) → { state, label, chipLabel, daysDiff, monthsLeft, color, badgeClass }
 * Uses whole-calendar-day math and fixed status thresholds:
 * - EXPIRED: daysDiff < 0 (label: 'Xd overdue')
 * - DUE_SOON: daysDiff === 0 (label: 'Due today') or daysDiff <= 30 (label: 'Xd left')
 * - OK: daysDiff > 30 (label: 'Xd left', chipLabel: 'N mos left')
 */
export function dueState(
  dateInput: CalendarDateInput,
  todayInput?: CalendarDateInput
): DueStateResult {
  const cd = parseCalendarDate(dateInput);
  if (!cd) {
    return {
      state: 'OK',
      label: 'No due date set',
      chipLabel: '—',
      daysDiff: null,
      monthsLeft: null,
      color: STATUS_COLORS.OK,
      badgeClass: 'bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
    };
  }

  const daysDiff = calendarDayDiff(cd, todayInput || todayCalendarDate());
  const monthsLeft = daysDiff > 0 ? Math.max(1, Math.round(daysDiff / 30.4375)) : 0;

  if (daysDiff < 0) {
    const overdueDays = Math.abs(daysDiff);
    const label = `${overdueDays}d overdue`;
    return {
      state: 'EXPIRED',
      label,
      chipLabel: label,
      daysDiff,
      monthsLeft: 0,
      color: STATUS_COLORS.EXPIRED,
      badgeClass: 'bg-rose-100 text-rose-800 border border-rose-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/30',
    };
  }

  if (daysDiff === 0) {
    return {
      state: 'DUE_SOON',
      label: 'Due today',
      chipLabel: 'Due today',
      daysDiff: 0,
      monthsLeft: 0,
      color: STATUS_COLORS.DUE_SOON,
      badgeClass: 'bg-amber-100 text-amber-800 border border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/30',
    };
  }

  if (daysDiff <= 30) {
    const label = `${daysDiff}d left`;
    return {
      state: 'DUE_SOON',
      label,
      chipLabel: label,
      daysDiff,
      monthsLeft,
      color: STATUS_COLORS.DUE_SOON,
      badgeClass: 'bg-amber-100 text-amber-800 border border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/30',
    };
  }

  // OK (more than 30 days remaining)
  const label = `${daysDiff}d left`;
  const chipLabel = `${monthsLeft} mos left`;
  return {
    state: 'OK',
    label,
    chipLabel,
    daysDiff,
    monthsLeft,
    color: STATUS_COLORS.OK,
    badgeClass: 'bg-emerald-100 text-emerald-800 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/30',
  };
}

/**
 * dueChip(dueDate, today?) → THE ONE source of truth for every countdown chip,
 * status chip and status count in the product (dashboard, buildings, equipment,
 * Form-B report). Computed LIVE at render on date-only boundaries — the label is
 * DERIVED from the same number, so a chip can never say "Overdue" next to a
 * "days left" count. Never display a stored/precomputed day-count.
 *
 *   due 2026-11-12, today 2026-11-10 → { state: 'DUE_SOON', label: '2d left',    days: 2 }
 *   due 2026-11-12, today 2026-11-12 → { state: 'DUE_SOON', label: 'Due today',  days: 0 }
 *   due 2026-11-12, today 2026-11-14 → { state: 'EXPIRED',  label: '2d overdue', days: 2 }
 *   no due date                       → { state: 'NONE',     label: 'No due date set', days: null }
 */
export type DueChipState = 'EXPIRED' | 'DUE_SOON' | 'OK' | 'NONE';

export interface DueChipResult {
  state: DueChipState;
  /** 'Due today' | 'Xd left' | 'Xd overdue' | 'No due date set' */
  label: string;
  /** |whole calendar days| between due date and today (null when no due date) */
  days: number | null;
  /** signed diff: positive = future, 0 = today, negative = past */
  diff: number | null;
  /** Upper-case status word for chips: 'EXPIRED' | 'DUE SOON' | 'OK' | 'NO DATE' */
  statusText: string;
  /** Hex colour: EXPIRED #DC2626 · DUE SOON #D97706 · OK #059669 · NONE #64748B */
  color: string;
}

export const DUE_SOON_WINDOW_DAYS = 30;

export function dueChip(dueDate: CalendarDateInput, todayInput?: CalendarDateInput): DueChipResult {
  const cd = parseCalendarDate(dueDate);
  if (!cd) {
    return { state: 'NONE', label: 'No due date set', days: null, diff: null, statusText: 'NO DATE', color: '#64748B' };
  }
  const diff = calendarDayDiff(cd, todayInput || todayCalendarDate());
  const days = Math.abs(diff);
  if (diff < 0) {
    return { state: 'EXPIRED', label: `${days}d overdue`, days, diff, statusText: 'EXPIRED', color: STATUS_COLORS.EXPIRED };
  }
  if (diff === 0) {
    return { state: 'DUE_SOON', label: 'Due today', days: 0, diff, statusText: 'DUE SOON', color: STATUS_COLORS.DUE_SOON };
  }
  if (diff <= DUE_SOON_WINDOW_DAYS) {
    return { state: 'DUE_SOON', label: `${days}d left`, days, diff, statusText: 'DUE SOON', color: STATUS_COLORS.DUE_SOON };
  }
  return { state: 'OK', label: `${days}d left`, days, diff, statusText: 'OK', color: STATUS_COLORS.OK };
}

/**
 * Tally dueChip states for a list of assets (strip totals == sum of row chips).
 */
export function tallyDueChips<T extends { nextDueDate?: CalendarDateInput }>(
  items: T[],
  todayInput?: CalendarDateInput
): { ok: number; dueSoon: number; expired: number; noDate: number; total: number } {
  const out = { ok: 0, dueSoon: 0, expired: 0, noDate: 0, total: items.length };
  for (const it of items) {
    const s = dueChip(it?.nextDueDate, todayInput).state;
    if (s === 'EXPIRED') out.expired++;
    else if (s === 'DUE_SOON') out.dueSoon++;
    else if (s === 'OK') out.ok++;
    else out.noDate++;
  }
  return out;
}

/**
 * Normalize a calendar date input to a JavaScript Date object suitable for storing
 * in Prisma / PostgreSQL DateTime columns.
 * Normalizes to Noon UTC (12:00:00.000Z) so that any timezone worldwide (UTC-11 to UTC+12)
 * always resolves to the exact same calendar date.
 */
export function toDbDate(dateInput: CalendarDateInput): Date | null {
  const cd = parseCalendarDate(dateInput);
  if (!cd) return null;
  return new Date(Date.UTC(cd.year, cd.month - 1, cd.day, 12, 0, 0, 0));
}

/**
 * Format a DB DateTime column value back into pure 'YYYY-MM-DD' calendar string.
 */
export function fromDbDate(dbValue: Date | string | null | undefined): string {
  const cd = parseCalendarDate(dbValue);
  if (!cd) return '';
  return calendarDateToString(cd);
}
