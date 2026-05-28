export const ROUND_SIZE = 22;

/** Inclusive YYYY-MM-DD difference in days. start='2026-01-01', end='2026-01-03' → 2. */
export function daysBetween(startIso: string, endIso: string): number {
  const a = new Date(`${startIso}T00:00:00Z`).getTime();
  const b = new Date(`${endIso}T00:00:00Z`).getTime();
  return Math.round((b - a) / 86_400_000);
}

/** 1-based round index for a given day-index (0-based). dayIndex 0–21 → round 1. */
export function roundForDayIndex(dayIndex: number): number {
  return Math.floor(dayIndex / ROUND_SIZE) + 1;
}

/** 1-based round for "today" given the habit's start date. Clamped to at least 1. */
export function currentRound(startIso: string, todayIso: string): number {
  const d = daysBetween(startIso, todayIso);
  if (d < 0) return 1;
  return roundForDayIndex(d);
}

/** Returns YYYY-MM-DD of `start + offset` days. */
export function dateForDayOffset(startIso: string, offset: number): string {
  const d = new Date(`${startIso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + offset);
  return d.toISOString().slice(0, 10);
}

/** YYYY-MM-DD in the user's local timezone. */
export function todayLocalIso(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}
