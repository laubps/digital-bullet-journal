import { validateMoodInput, MOODS, NOTE_MAX_LENGTH } from '@/lib/mood/validation';

const today = new Date().toISOString().slice(0, 10);

function tomorrow(): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
}

describe('validateMoodInput', () => {
  it('accepts a valid payload', () => {
    const r = validateMoodInput({ mood: 'Happy', entryDate: today, note: 'feeling good' });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.fields.mood).toBe('Happy');
      expect(r.fields.entryDate).toBe(today);
      expect(r.fields.note).toBe('feeling good');
    }
  });

  it('treats whitespace-only note as null', () => {
    const r = validateMoodInput({ mood: 'Calm', entryDate: today, note: '   \n  ' });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.fields.note).toBeNull();
  });

  it('treats omitted note as null', () => {
    const r = validateMoodInput({ mood: 'Calm', entryDate: today });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.fields.note).toBeNull();
  });

  it('rejects unknown mood', () => {
    const r = validateMoodInput({ mood: 'Hungry', entryDate: today });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.field).toBe('mood');
  });

  it('rejects empty mood', () => {
    const r = validateMoodInput({ mood: '', entryDate: today });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.field).toBe('mood');
  });

  it('rejects malformed date', () => {
    const r = validateMoodInput({ mood: 'Happy', entryDate: '2026/05/27' });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.field).toBe('entryDate');
  });

  it('rejects impossible date (Feb 30)', () => {
    const r = validateMoodInput({ mood: 'Happy', entryDate: '2026-02-30' });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.field).toBe('entryDate');
  });

  it('rejects future date', () => {
    const r = validateMoodInput({ mood: 'Happy', entryDate: tomorrow() });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.field).toBe('entryDate');
  });

  it('rejects date too far in the past', () => {
    const r = validateMoodInput({ mood: 'Happy', entryDate: '2000-01-01' });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.field).toBe('entryDate');
  });

  it('rejects note over max length', () => {
    const longNote = 'a'.repeat(NOTE_MAX_LENGTH + 1);
    const r = validateMoodInput({ mood: 'Happy', entryDate: today, note: longNote });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.field).toBe('note');
  });

  it('rejects non-string note', () => {
    const r = validateMoodInput({ mood: 'Happy', entryDate: today, note: 123 });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.field).toBe('note');
  });

  it('rejects non-object body', () => {
    const r = validateMoodInput(null);
    expect(r.ok).toBe(false);
  });

  it('accepts every whitelisted mood', () => {
    for (const m of MOODS) {
      const r = validateMoodInput({ mood: m, entryDate: today });
      expect(r.ok).toBe(true);
    }
  });

  it('accepts a valid categoryId (UUID)', () => {
    const uuid = '11111111-2222-3333-4444-555555555555';
    const r = validateMoodInput({ mood: 'Happy', entryDate: today, categoryId: uuid });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.fields.categoryId).toBe(uuid);
  });

  it('treats empty/null/undefined categoryId as null', () => {
    for (const v of ['', null, undefined]) {
      const r = validateMoodInput({ mood: 'Happy', entryDate: today, categoryId: v });
      expect(r.ok).toBe(true);
      if (r.ok) expect(r.fields.categoryId).toBeNull();
    }
  });

  it('rejects a malformed categoryId', () => {
    const r = validateMoodInput({ mood: 'Happy', entryDate: today, categoryId: 'not-a-uuid' });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.field).toBe('categoryId');
  });
});
