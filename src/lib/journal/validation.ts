export const CONTENT_MAX_LENGTH = 100_000; // CLOB; very generous, just a sanity bound

const ENTRY_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type JournalFieldError = {
  field: 'entryDate' | 'content' | 'categoryId' | 'general';
  message: string;
};

export type JournalInputFields = {
  entryDate: string;
  content: string; // sanitized-trimmed HTML
  categoryId: string | null;
};

export type JournalValidation =
  | { ok: true; fields: JournalInputFields }
  | { ok: false; error: JournalFieldError };

/** Strip HTML tags then collapse whitespace — checks if the entry has any
 *  user-visible text, not just empty Tiptap markup like `<p></p>`. */
function hasVisibleText(html: string): boolean {
  return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/gi, ' ').trim().length > 0;
}

export function validateJournalInput(data: unknown): JournalValidation {
  if (typeof data !== 'object' || data === null) {
    return { ok: false, error: { field: 'general', message: 'invalid request body' } };
  }
  const { entryDate, content, categoryId } = data as Record<string, unknown>;

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

  // content
  if (typeof content !== 'string') {
    return { ok: false, error: { field: 'content', message: 'content must be text' } };
  }
  if (!hasVisibleText(content)) {
    return { ok: false, error: { field: 'content', message: 'write something before saving' } };
  }
  if (content.length > CONTENT_MAX_LENGTH) {
    return {
      ok: false,
      error: { field: 'content', message: `entry is too long (${CONTENT_MAX_LENGTH} char max)` },
    };
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
    fields: { entryDate, content, categoryId: finalCategoryId },
  };
}
