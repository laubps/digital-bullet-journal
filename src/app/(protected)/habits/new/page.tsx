'use client';

import { useEffect, useState, type CSSProperties, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { C, mono } from '@/lib/ui/theme';
import PageShell from '@/lib/ui/PageShell';

type Category = { id: string; name: string };

const MIN_DAYS = 22;
const MAX_DAYS = 365;

export default function NewHabitPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [targetDaysStr, setTargetDaysStr] = useState(String(MIN_DAYS));
  const [categoryId, setCategoryId] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [hover, setHover] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch('/api/categories');
        if (!res.ok) return;
        const data = (await res.json()) as { categories?: Category[] };
        if (alive && Array.isArray(data.categories)) setCategories(data.categories);
      } catch {
        // optional
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (!successMsg) return;
    const t = setTimeout(() => setSuccessMsg(null), 2500);
    return () => clearTimeout(t);
  }, [successMsg]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (submitting || !name.trim()) return;

    const parsed = parseInt(targetDaysStr, 10);
    if (Number.isNaN(parsed) || parsed < MIN_DAYS || parsed > MAX_DAYS) {
      setErrorMsg(`duration must be between ${MIN_DAYS} and ${MAX_DAYS} days`);
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const res = await fetch('/api/habits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          targetDays: parsed,
          categoryId: categoryId || null,
        }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setErrorMsg(data.error || 'could not create habit');
        setSubmitting(false);
        return;
      }
      setSuccessMsg('habit created');
      // Return the user to whichever page opened the form.
      setTimeout(() => router.back(), 600);
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

  const submitBtn: CSSProperties = {
    height: 44,
    padding: '0 28px',
    background: submitting ? C.btnColor : hover ? C.btnHover : C.btnColor,
    color: '#fff',
    border: 'none',
    borderRadius: 6,
    fontFamily: mono,
    fontSize: 12,
    letterSpacing: '0.16em',
    textTransform: 'uppercase',
    cursor: submitting ? 'not-allowed' : 'pointer',
    opacity: submitting ? 0.6 : 1,
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

  const helper: CSSProperties = {
    fontFamily: mono,
    fontSize: 10,
    letterSpacing: '0.06em',
    color: C.textSecondary,
    marginTop: 6,
  };

  return (
    <PageShell title="start a new habit" subtitle="Habit tracker">
      <form onSubmit={onSubmit}>
        <div style={{ marginBottom: 24 }}>
          <label htmlFor="habit-name" style={label}>Habit name</label>
          <input
            id="habit-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. morning walk"
            disabled={submitting}
            style={inputStyle}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
          <div>
            <label htmlFor="habit-category" style={label}>Category (optional)</label>
            <select
              id="habit-category"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              disabled={submitting}
              style={{ ...inputStyle, cursor: submitting ? 'not-allowed' : 'pointer' }}
            >
              <option value="">— none —</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="habit-days" style={label}>Target days (min {MIN_DAYS})</label>
            <input
              id="habit-days"
              type="number"
              min={MIN_DAYS}
              max={MAX_DAYS}
              value={targetDaysStr}
              onChange={(e) => setTargetDaysStr(e.target.value)}
              onBlur={() => {
                const n = parseInt(targetDaysStr, 10);
                if (Number.isNaN(n) || n < MIN_DAYS) setTargetDaysStr(String(MIN_DAYS));
                else if (n > MAX_DAYS) setTargetDaysStr(String(MAX_DAYS));
                else setTargetDaysStr(String(n));
              }}
              disabled={submitting}
              style={inputStyle}
            />
            <div style={helper}>habits take at least {MIN_DAYS} days to take root.</div>
          </div>
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
            }}
          >
            ✓ {successMsg}
          </div>
        ) : null}

        <div style={{ display: 'flex', gap: 12 }}>
          <button
            type="submit"
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            style={submitBtn}
            disabled={submitting || !name.trim()}
            aria-busy={submitting}
          >
            {submitting ? 'Saving…' : 'Add habit'}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
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
