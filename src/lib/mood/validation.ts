export const MOODS = [
  'Happy',
  'Sad',
  'Anxious',
  'Calm',
  'Angry',
  'Excited',
  'Tired',
  'Neutral',
] as const;
export type Mood = (typeof MOODS)[number];

export const NOTE_MAX_LENGTH = 5000;
const ENTRY_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type MoodFieldError = {
  field: 'mood' | 'entryDate' | 'note' | 'categoryId' | 'general';
  message: string;
};

export type MoodInputFields = {
  mood: Mood;
  entryDate: string; // YYYY-MM-DD
  note: string | null; // null when empty/whitespace only
  categoryId: string | null; // null when not provided
};

export type MoodValidation =
  | { ok: true; fields: MoodInputFields }
  | { ok: false; error: MoodFieldError };

/**
 * Validates the POST /api/mood payload.
 *
 * Rules:
 * - mood: must be one of the 8 fixed moods (case-sensitive — matches the DB seed).
 * - entryDate: 'YYYY-MM-DD', a real calendar date, not in the future (UTC).
 *              Earliest allowed: 5 years before today (guards against typos).
 * - note: optional. Trimmed; treated as null when empty. Max 5000 chars.
 */
export function validateMoodInput(data: unknown): MoodValidation {
  if (typeof data !== 'object' || data === null) {
    return { ok: false, error: { field: 'general', message: 'invalid request body' } };
  }
  const { mood, entryDate, note, categoryId } = data as Record<string, unknown>;

  // mood
  if (typeof mood !== 'string' || mood.trim() === '') {
    return { ok: false, error: { field: 'mood', message: 'please pick a mood' } };
  }
  if (!(MOODS as readonly string[]).includes(mood)) {
    return { ok: false, error: { field: 'mood', message: 'unknown mood' } };
  }

  // entryDate
  if (typeof entryDate !== 'string' || !ENTRY_DATE_REGEX.test(entryDate)) {
    return { ok: false, error: { field: 'entryDate', message: 'date must be YYYY-MM-DD' } };
  }
  const parsed = new Date(`${entryDate}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== entryDate) {
    return { ok: false, error: { field: 'entryDate', message: 'invalid date' } };
  }
  const todayUtc = new Date();
  const todayIso = todayUtc.toISOString().slice(0, 10);
  if (entryDate > todayIso) {
    return { ok: false, error: { field: 'entryDate', message: 'date cannot be in the future' } };
  }
  const minDate = new Date(todayUtc);
  minDate.setUTCFullYear(minDate.getUTCFullYear() - 5);
  if (parsed < minDate) {
    return { ok: false, error: { field: 'entryDate', message: 'date is too far in the past' } };
  }

  // note (optional)
  let finalNote: string | null = null;
  if (note !== undefined && note !== null) {
    if (typeof note !== 'string') {
      return { ok: false, error: { field: 'note', message: 'note must be text' } };
    }
    const trimmed = note.trim();
    if (trimmed.length > NOTE_MAX_LENGTH) {
      return {
        ok: false,
        error: { field: 'note', message: `note must be ${NOTE_MAX_LENGTH} characters or fewer` },
      };
    }
    finalNote = trimmed === '' ? null : trimmed;
  }

  // categoryId (optional)
  let finalCategoryId: string | null = null;
  if (categoryId !== undefined && categoryId !== null && categoryId !== '') {
    if (typeof categoryId !== 'string' || !UUID_REGEX.test(categoryId)) {
      return { ok: false, error: { field: 'categoryId', message: 'invalid category' } };
    }
    finalCategoryId = categoryId;
  }

  return {
    ok: true,
    fields: { mood: mood as Mood, entryDate, note: finalNote, categoryId: finalCategoryId },
  };
}
