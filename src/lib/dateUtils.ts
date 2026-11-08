/**
 * Calendar-safe date utilities for VigilAMC
 * Prevents UTC day-shifts, off-by-one errors, and 30-day month arithmetic drift.
 * Method references: local calendar day arithmetic & clamp-to-month-end logic.
 */

export interface CalendarDateParts {
  year: number;
  month: number; // 1-12
  day: number; // 1-31
}

/**
 * Extracts { year, month, day } from a date string (YYYY-MM-DD or ISO) or Date object.
 * Pure string parsing is preferred for YYYY-MM-DD inputs to avoid UTC offset shifts.
 */
export function extractCalendarDateParts(input: string | Date | null | undefined): CalendarDateParts | null {
  if (!input) return null;
  if (typeof input === 'string') {
    const trimmed = input.trim();
    if (!trimmed) return null;
    const match = trimmed.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
    if (match) {
      return {
        year: parseInt(match[1], 10),
        month: parseInt(match[2], 10),
        day: parseInt(match[3], 10),
      };
    }
    const d = new Date(trimmed);
    if (isNaN(d.getTime())) return null;
    return {
      year: d.getFullYear(),
      month: d.getMonth() + 1,
      day: d.getDate(),
    };
  }
  if (input instanceof Date) {
    if (isNaN(input.getTime())) return null;
    return {
      year: input.getFullYear(),
      month: input.getMonth() + 1,
      day: input.getDate(),
    };
  }
  return null;
}

/**
 * Formats a Date or date string to local YYYY-MM-DD format suitable for type="date" inputs.
 * Never uses toISOString().split('T')[0] to avoid UTC day-shifts.
 */
export function toCalendarDateInput(input: string | Date | null | undefined, fallbackToToday = true): string {
  const parts = extractCalendarDateParts(input);
  if (!parts) {
    if (!fallbackToToday) return '';
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }
  const yyyy = String(parts.year).padStart(4, '0');
  const mm = String(parts.month).padStart(2, '0');
  const dd = String(parts.day).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

/**
 * Formats a date into Indian English locale display (e.g. "9 Nov 2026"), calendar-safe.
 */
export function formatCalendarDate(
  input: string | Date | null | undefined,
  options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' },
  fallback = '—'
): string {
  const parts = extractCalendarDateParts(input);
  if (!parts) return fallback;
  // Construct Date at local noon (12:00:00) so daylight savings or timezone boundaries cannot shift the day
  const d = new Date(parts.year, parts.month - 1, parts.day, 12, 0, 0);
  return d.toLocaleDateString('en-IN', options);
}

/**
 * Calculates the exact whole calendar-day difference between a target date and a base date.
 * target - baseDate
 * Returns:
 *   0 if target is today
 *   1 if target is tomorrow
 *  -1 if target was yesterday
 *   null if target is invalid/null
 */
export function getCalendarDayDiff(
  target: string | Date | null | undefined,
  baseDate: Date = new Date()
): number | null {
  const tParts = extractCalendarDateParts(target);
  if (!tParts) return null;
  const bYear = baseDate.getFullYear();
  const bMonth = baseDate.getMonth();
  const bDay = baseDate.getDate();

  const utarget = Date.UTC(tParts.year, tParts.month - 1, tParts.day);
  const ubase = Date.UTC(bYear, bMonth, bDay);
  return Math.round((utarget - ubase) / (1000 * 60 * 60 * 24));
}

/**
 * Human readable label for calendar day difference.
 * today: "Due today"
 * tomorrow: "1d left" (or "Due in 1d")
 * yesterday: "1d overdue"
 * <0: "Xd overdue"
 * <=30: "Due in Xd" / "Xd left"
 * >30: "X mos left"
 */
export function formatCalendarDueNotice(
  diffDays: number | null,
  options: { dueTodayText?: string; inFormat?: boolean } = {}
): string {
  if (diffDays === null) return 'No due date set';
  if (diffDays === 0) return options.dueTodayText || 'Due today';
  if (diffDays < 0) return `${Math.abs(diffDays)}d overdue`;
  if (diffDays <= 30) return options.inFormat ? `Due in ${diffDays}d` : `${diffDays}d left`;
  const mos = Math.round(diffDays / 30);
  return `${mos} mos left`;
}

/**
 * Calendar month math (same day of month, clamped to month end).
 * E.g., 2026-01-31 + 1 month -> 2026-02-28 (NOT March!).
 * E.g., 2026-01-15 + 6 months -> 2026-07-15.
 */
export function addCalendarMonths(inputDate: string | Date | null | undefined, months: number): string {
  const parts = extractCalendarDateParts(inputDate) || extractCalendarDateParts(new Date())!;
  const targetMonthIndex = parts.month - 1 + Number(months || 0);
  const targetYear = parts.year + Math.floor(targetMonthIndex / 12);
  const normalizedMonthIndex = ((targetMonthIndex % 12) + 12) % 12; // 0-11
  const targetMonth = normalizedMonthIndex + 1;

  // Maximum days in targetMonth of targetYear:
  const daysInTargetMonth = new Date(targetYear, targetMonth, 0).getDate();
  const clampedDay = Math.min(parts.day, daysInTargetMonth);

  const yyyy = String(targetYear).padStart(4, '0');
  const mm = String(targetMonth).padStart(2, '0');
  const dd = String(clampedDay).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

/**
 * Add days to a calendar date string (or today).
 */
export function addCalendarDays(inputDate: string | Date | null | undefined, days: number): string {
  const parts = extractCalendarDateParts(inputDate) || extractCalendarDateParts(new Date())!;
  const dt = new Date(parts.year, parts.month - 1, parts.day + Number(days || 0), 12, 0, 0);
  const yyyy = dt.getFullYear();
  const mm = String(dt.getMonth() + 1).padStart(2, '0');
  const dd = String(dt.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}
