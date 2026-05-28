'use client';

import { useEffect, useState, type CSSProperties, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { C, mono } from '@/lib/ui/theme';
import PageShell from '@/lib/ui/PageShell';

const MOODS = ['Happy', 'Sad', 'Anxious', 'Calm', 'Angry', 'Excited', 'Tired', 'Neutral'] as const;

/** YYYY-MM-DD in the user's local timezone (avoids UTC off-by-one). */
function todayLocalIso(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

type Category = { id: string; name: string };

export default function MoodPage() {
  const router = useRouter();
  const today = todayLocalIso();
  const [mood, setMood] = useState<string>('');
  const [date, setDate] = useState(today);
  const [note, setNote] = useState('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [hover, setHover] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [takenMoods, setTakenMoods] = useState<Set<string>>(new Set());

  // Fetch moods already saved for the selected date so the chips can be
  // disabled — prevents a duplicate POST round-trip in the common case.
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch(`/api/mood?date=${date}`);
        if (!res.ok) return;
        const data = (await res.json()) as { today?: string[] };
        if (alive) setTakenMoods(new Set(data.today ?? []));
      } catch {
        // Silent — the server still enforces uniqueness.
      }
    })();
    return () => {
      alive = false;
    };
  }, [date, successMsg]);

  useEffect(() => {
    if (!successMsg) return;
    const t = setTimeout(() => setSuccessMsg(null), 3500);
    return () => clearTimeout(t);
  }, [successMsg]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch('/api/categories');
        if (!res.ok) return;
        const data = (await res.json()) as { categories?: Category[] };
        if (alive && Array.isArray(data.categories)) setCategories(data.categories);
      } catch {
        // Silent — category is optional; the form still works without it.
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (submitting || !mood) return;
    setSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const res = await fetch('/api/mood', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mood,
          entryDate: date,
          note,
          categoryId: categoryId || null,
        }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setErrorMsg(data.error || 'could not save mood');
        setSubmitting(false);
        return;
      }
      setSuccessMsg(`mood saved — ${mood.toLowerCase()}`);
      setMood('');
      setNote('');
      setCategoryId('');
      setSubmitting(false);
    } catch {
      setErrorMsg('network error, try again');
      setSubmitting(false);
    }
  };

  const label: CSSProperties = {
    fontFamily: mono,
    fontSize: 10,
    letterSpacing: '0.2em',
    textTransform: 'uppercase',
    color: C.textSecondary,
    display: 'block',
    marginBottom: 8,
  };

  const inputStyle: CSSProperties = {
    width: '100%',
    height: 40,
    border: 'none',
    borderBottom: `1.5px solid ${C.inputBorderDefault}`,
    background: 'transparent',
    outline: 'none',
    fontFamily: mono,
    fontSize: 14,
    color: C.textPrimary,
    padding: '0 0 6px 0',
  };

  const grid: CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 10,
    marginBottom: 28,
  };

  const chip = (active: boolean, disabled: boolean, taken: boolean): CSSProperties => ({
    padding: '10px 12px',
    border: `1.5px solid ${active ? C.darkPink : C.lineColor}`,
    background: active ? C.darkPink : taken ? C.headerBg : 'transparent',
    color: active ? '#fff' : taken ? C.textSecondary : C.textPrimary,
    borderRadius: 6,
    fontFamily: mono,
    fontSize: 11,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.55 : 1,
    textDecoration: taken && !active ? 'line-through' : 'none',
    transition: 'all 0.18s ease',
  });

  const disabledSubmit = !mood || submitting;

  const submitBtn: CSSProperties = {
    height: 44,
    padding: '0 28px',
    background: disabledSubmit ? C.btnColor : hover ? C.btnHover : C.btnColor,
    color: '#fff',
    border: 'none',
    borderRadius: 6,
    fontFamily: mono,
    fontSize: 12,
    letterSpacing: '0.16em',
    textTransform: 'uppercase',
    cursor: disabledSubmit ? 'not-allowed' : 'pointer',
    opacity: disabledSubmit ? 0.6 : 1,
    transition: 'background 0.18s ease',
  };

  const cancelBtn: CSSProperties = {
    height: 44,
    padding: '0 22px',
    background: 'transparent',
    color: C.textPrimary,
    border: `1.5px solid ${C.lineColor}`,
    borderRadius: 6,
    fontFamily: mono,
    fontSize: 12,
    letterSpacing: '0.16em',
    textTransform: 'uppercase',
    cursor: submitting ? 'not-allowed' : 'pointer',
    opacity: submitting ? 0.6 : 1,
  };

  return (
    <PageShell title="how are you feeling?" subtitle="Mood entry" maxWidth={810}>
      <form onSubmit={onSubmit}>
        <div style={{ marginBottom: 24 }}>
          <span style={label}>Pick a mood</span>
          <div style={grid}>
            {MOODS.map((m) => {
              const taken = takenMoods.has(m);
              const disabled = submitting || taken;
              return (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMood(m)}
                  disabled={disabled}
                  title={taken ? 'already saved for this date' : undefined}
                  style={chip(mood === m, disabled, taken)}
                >
                  {m}
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ marginBottom: 24 }}>
          <label htmlFor="mood-date" style={label}>Date</label>
          <input
            id="mood-date"
            type="date"
            value={date}
            max={today}
            onChange={(e) => setDate(e.target.value)}
            disabled={submitting}
            style={inputStyle}
          />
        </div>

        <div style={{ marginBottom: 24 }}>
          <label htmlFor="mood-category" style={label}>Category (optional)</label>
          <select
            id="mood-category"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            disabled={submitting}
            style={{
              ...inputStyle,
              height: 40,
              padding: '0 8px 6px 0',
              cursor: submitting ? 'not-allowed' : 'pointer',
            }}
          >
            <option value="">— none —</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: 28 }}>
          <label htmlFor="mood-note" style={label}>Note (optional)</label>
          <textarea
            id="mood-note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={4}
            maxLength={5000}
            disabled={submitting}
            style={{
              width: '100%',
              boxSizing: 'border-box',
              display: 'block',
              borderWidth: '1.5px',
              borderStyle: 'solid',
              borderColor: C.inputBorderDefault,
              borderRadius: 6,
              background: 'transparent',
              outline: 'none',
              color: C.textPrimary,
              padding: 12,
              resize: 'vertical',
              fontFamily: "'Times New Roman', Georgia, serif",
              fontSize: 15,
              lineHeight: 1.6,
            }}
          />
        </div>

        {errorMsg ? (
          <div
            role="alert"
            style={{
              marginBottom: 16,
              padding: '10px 14px',
              borderRadius: 6,
              border: `1px solid ${C.danger}`,
              background: C.dangerBg,
              color: C.danger,
              fontFamily: mono,
              fontSize: 12,
              letterSpacing: '0.06em',
            }}
          >
            ✕ {errorMsg}
          </div>
        ) : null}

        {successMsg ? (
          <div
            role="status"
            aria-live="polite"
            style={{
              marginBottom: 16,
              padding: '10px 14px',
              borderRadius: 6,
              border: `1px solid ${C.success}`,
              background: C.successBg,
              color: C.success,
              fontFamily: mono,
              fontSize: 12,
              letterSpacing: '0.06em',
            }}
          >
            ✓ {successMsg}
          </div>
        ) : null}

        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <button
            type="submit"
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            style={submitBtn}
            disabled={disabledSubmit}
            aria-busy={submitting}
          >
            {submitting ? 'Saving…' : 'Save mood'}
          </button>
          <button
            type="button"
            onClick={() => router.push('/dashboard')}
            style={cancelBtn}
            disabled={submitting}
          >
            Cancel
          </button>
        </div>
      </form>
    </PageShell>
  );
}
