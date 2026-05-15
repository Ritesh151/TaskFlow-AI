/** Fixed office work window — local timezone (matches attendance/session clocks). */

export const WORK_DAY_START_HOUR = 9;
export const WORK_DAY_START_MINUTE = 0;
export const WORK_DAY_END_HOUR = 18;
export const WORK_DAY_END_MINUTE = 0;

function dayBoundary(y: number, m: number, day: number): number {
  return new Date(y, m, day).getTime();
}

function workBoundsForDay(dayStartMs: number): { workStartMs: number; workEndMs: number } {
  const ws = dayStartMs + (WORK_DAY_START_HOUR * 60 + WORK_DAY_START_MINUTE) * 60 * 1000;
  const we = dayStartMs + (WORK_DAY_END_HOUR * 60 + WORK_DAY_END_MINUTE) * 60 * 1000;
  return { workStartMs: ws, workEndMs: we };
}

/** null = insufficient data; true = segment fully inside 9–18 each calendar day touched; false = overlaps outside hours */
export function isTaskTimeWithinWorkWindow(startIso?: string | null, endIso?: string | null): boolean | null {
  if (!startIso || !endIso) return null;
  const segStartMs = new Date(startIso).getTime();
  const segEndMs = new Date(endIso).getTime();
  if (!Number.isFinite(segStartMs) || !Number.isFinite(segEndMs) || segEndMs < segStartMs) return null;

  let cursor = new Date(segStartMs);
  cursor.setHours(0, 0, 0, 0);
  while (cursor.getTime() <= segEndMs) {
    const dayStartMs = cursor.getTime();
    const nextDayMs = dayBoundary(cursor.getFullYear(), cursor.getMonth(), cursor.getDate() + 1);
    const overlapLeft = Math.max(segStartMs, dayStartMs);
    const overlapRight = Math.min(segEndMs, nextDayMs - 1);
    if (overlapLeft <= overlapRight) {
      const { workStartMs, workEndMs } = workBoundsForDay(dayStartMs);
      if (overlapLeft < workStartMs || overlapRight > workEndMs) return false;
    }
    cursor = new Date(nextDayMs);
  }
  return true;
}

/** Late check-in vs 9:00. Returns rounded late minutes or null */
export function getLateCheckInMinutes(checkInIso: string | null | undefined): number | null {
  if (!checkInIso) return null;
  const d = new Date(checkInIso);
  if (!Number.isFinite(d.getTime())) return null;
  const startOfDay = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const { workStartMs } = workBoundsForDay(startOfDay);
  const lateMs = d.getTime() - workStartMs;
  return lateMs > 30 * 1000 ? Math.round(lateMs / 60000) : null;
}

/** True if timestamp falls strictly outside 09:00–18:00 on its local calendar day */
export function isInstantOutsideWorkWindow(iso: string | null | undefined): boolean | null {
  if (!iso) return null;
  const d = new Date(iso).getTime();
  if (!Number.isFinite(d)) return null;
  const dd = new Date(d);
  const dayStartMs = new Date(dd.getFullYear(), dd.getMonth(), dd.getDate()).getTime();
  const { workStartMs, workEndMs } = workBoundsForDay(dayStartMs);
  return d < workStartMs || d > workEndMs;
}

/** Check-out strictly before end of scheduled day window */
export function isEarlyCheckout(checkOutIso: string | null | undefined): boolean {
  if (!checkOutIso) return false;
  const d = new Date(checkOutIso);
  if (!Number.isFinite(d.getTime())) return false;
  const startOfDay = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const { workEndMs } = workBoundsForDay(startOfDay);
  return d.getTime() < workEndMs - 30 * 1000;
}
