'use client';

import { useCallback, useEffect, useState, type CSSProperties } from 'react';
import { useParams } from 'next/navigation';
import { C, T, mono } from '@/lib/ui/theme';
import PageShell from '@/lib/ui/PageShell';
import Loading from '@/components/Loading';
import ErrorState from '@/components/ErrorState';
import PageBackground from '@/components/PageBackground';
import Card from '@/lib/ui/Card';
import HabitCheckinGrid, { type Checkin } from '@/components/habits/HabitCheckinGrid';
import { currentRound } from '@/lib/habits/days';

type Category = { id: string; name: string };

type Habit = {
  id: string;
  name: string;
  targetDays: number;
  isActive: boolean;
  categoryId: string | null;
  categoryName: string | null;
  startDate: string;
  createdAt: string;
  checkins: Checkin[];
};

const MIN_DAYS = 22;
const MAX_DAYS = 365;

export default function HabitDetailsPage() {
  const params = useParams<{ id: string }>();
  const habitId = params.id;

  const [habit, setHabit] = useState<Habit | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [initialLoad, setInitialLoad] = useState(true);
  const [hasFatalError, setHasFatalError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const [editing, setEditing] = useState(false);
  const [draftTargetDaysStr, setDraftTargetDaysStr] = useState(String(MIN_DAYS));
  const [draftCategoryId, setDraftCategoryId] = useState('');
  const [draftIsActive, setDraftIsActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const loadHabit = useCallback(async () => {
    const res = await fetch(`/api/habits/${habitId}`);
    if (!res.ok) throw new Error(`habit ${res.status}`);
    const data = (await res.json()) as { habit: Habit };
    return data.habit;
  }, [habitId]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [h, catsRes] = await Promise.all([
          loadHabit(),
          fetch('/api/categories'),
        ]);
        if (!alive) return;
        setHabit(h);
        setDraftTargetDaysStr(String(h.targetDays));
        setDraftCategoryId(h.categoryId ?? '');
        setDraftIsActive(h.isActive);
        if (catsRes.ok) {
          const cd = (await catsRes.json()) as { categories?: Category[] };
          if (Array.isArray(cd.categories)) setCategories(cd.categories);
        }
      } catch {
        if (alive) setHasFatalError(true);
      } finally {
        if (alive) setInitialLoad(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [loadHabit, reloadKey]);

  useEffect(() => {
    if (!successMsg) return;
    const t = setTimeout(() => setSuccessMsg(null), 2500);
    return () => clearTimeout(t);
  }, [successMsg]);

  const startEdit = () => {
    if (!habit) return;
    setDraftTargetDaysStr(String(habit.targetDays));
    setDraftCategoryId(habit.categoryId ?? '');
    setDraftIsActive(habit.isActive);
    setEditing(true);
    setErrorMsg(null);
  };

  const cancelEdit = () => {
    if (!habit) return;
    setDraftTargetDaysStr(String(habit.targetDays));
    setDraftCategoryId(habit.categoryId ?? '');
    setDraftIsActive(habit.isActive);
    setEditing(false);
    setErrorMsg(null);
  };

  const saveEdit = async () => {
    if (!habit || saving) return;

    const parsedDays = parseInt(draftTargetDaysStr, 10);
    if (Number.isNaN(parsedDays) || parsedDays < MIN_DAYS || parsedDays > MAX_DAYS) {
      setErrorMsg(`duration must be between ${MIN_DAYS} and ${MAX_DAYS} days`);
      return;
    }

    setSaving(true);
    setErrorMsg(null);
    try {
      const body: Record<string, unknown> = {};
      if (parsedDays !== habit.targetDays) body.targetDays = parsedDays;
      if ((draftCategoryId || null) !== habit.categoryId) {
        body.categoryId = draftCategoryId || null;
      }
      if (draftIsActive !== habit.isActive) body.isActive = draftIsActive;

      if (Object.keys(body).length === 0) {
        setEditing(false);
        setSaving(false);
        return;
      }

      const res = await fetch(`/api/habits/${habit.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const d = (await res.json().catch(() => ({}))) as { error?: string };
        setErrorMsg(d.error || 'could not save changes');
        setSaving(false);
        return;
      }
      const fresh = await loadHabit();
      setHabit(fresh);
      setEditing(false);
      setSuccessMsg('changes saved');
      setSaving(false);
    } catch {
      setErrorMsg('network error, try again');
      setSaving(false);
    }
  };

  const toggleCheckin = async (_dayIndex: number, date: string, currentDone: boolean) => {
    if (!habit) return;
    const nextDone = !currentDone;
    // Optimistic.
    const others = habit.checkins.filter((c) => c.checkDate !== date);
    const optimistic = nextDone ? [...others, { checkDate: date, done: true }] : others;
    setHabit({ ...habit, checkins: optimistic });

    try {
      const res = await fetch(`/api/habits/${habit.id}/checkins`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ checkDate: date, done: nextDone }),
      });
      if (!res.ok) throw new Error('checkin failed');
    } catch {
      // Revert.
      const revert = currentDone ? [...others, { checkDate: date, done: true }] : others;
      setHabit({ ...habit, checkins: revert });
    }
  };

  // ---------- gates ----------
  if (initialLoad) {
    return (
      <PageShell title="habit" subtitle="Details">
        <Loading minHeight={420} />
      </PageShell>
    );
  }
  if (hasFatalError || !habit) {
    return (
      <main
        style={{
          position: 'relative',
          minHeight: '100vh',
          width: '100%',
          padding: '32px 24px',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'safe center',
          justifyContent: 'safe center',
        }}
      >
        <PageBackground />
        <Card maxWidth={560}>
          <ErrorState onRetry={() => setReloadKey((k) => k + 1)} minHeight={240} />
        </Card>
      </main>
    );
  }

  // ---------- styles ----------
  const label: CSSProperties = {
    fontFamily: mono,
    fontSize: 10,
    letterSpacing: '0.2em',
    textTransform: 'uppercase',
    color: C.textSecondary,
    display: 'block',
    marginBottom: 6,
  };

  const readonlyText: CSSProperties = {
    fontFamily: mono,
    fontSize: 14,
    color: C.textPrimary,
    padding: '8px 0',
    borderBottom: `1.5px solid ${C.inputBorderDefault}`,
    opacity: 0.7,
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

  const filledBtn: CSSProperties = {
    height: 40,
    padding: '0 22px',
    background: C.btnColor,
    color: '#fff',
    border: 'none',
    borderRadius: 6,
    fontFamily: mono,
    fontSize: 12,
    letterSpacing: '0.16em',
    textTransform: 'uppercase',
    cursor: saving ? 'not-allowed' : 'pointer',
    opacity: saving ? 0.6 : 1,
  };

  const outlineBtn: CSSProperties = {
    height: 40,
    padding: '0 22px',
    background: 'transparent',
    color: C.textPrimary,
    border: `1.5px solid ${C.lineColor}`,
    borderRadius: 6,
    fontFamily: mono,
    fontSize: 12,
    letterSpacing: '0.16em',
    textTransform: 'uppercase',
    cursor: saving ? 'not-allowed' : 'pointer',
    opacity: saving ? 0.6 : 1,
  };

  const round = currentRound(habit.startDate, new Date().toISOString().slice(0, 10));

  return (
    <PageShell title={habit.name.toLowerCase()} subtitle="Habit details" maxWidth={1080}>
      {/* Top action row */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 18, gap: 10 }}>
        {!editing ? (
          <button type="button" style={filledBtn} onClick={startEdit}>
            Edit
          </button>
        ) : (
          <>
            <button type="button" style={outlineBtn} onClick={cancelEdit} disabled={saving}>
              Cancel
            </button>
            <button type="button" style={filledBtn} onClick={saveEdit} disabled={saving} aria-busy={saving}>
              {saving ? 'Saving…' : 'Save'}
            </button>
          </>
        )}
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

      {/* Form */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
        <div>
          <span style={label}>Name</span>
          <div style={readonlyText}>{habit.name}</div>
        </div>
        <div>
          <span style={label}>Start date</span>
          <div style={readonlyText}>{habit.startDate}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 24, marginBottom: 24 }}>
        <div>
          <label htmlFor="h-target" style={label}>Target days</label>
          {editing ? (
            <input
              id="h-target"
              type="number"
              min={MIN_DAYS}
              max={MAX_DAYS}
              value={draftTargetDaysStr}
              onChange={(e) => setDraftTargetDaysStr(e.target.value)}
              onBlur={() => {
                const n = parseInt(draftTargetDaysStr, 10);
                if (Number.isNaN(n) || n < MIN_DAYS) setDraftTargetDaysStr(String(MIN_DAYS));
                else if (n > MAX_DAYS) setDraftTargetDaysStr(String(MAX_DAYS));
                else setDraftTargetDaysStr(String(n));
              }}
              disabled={saving}
              style={inputStyle}
            />
          ) : (
            <div style={readonlyText}>{habit.targetDays} days</div>
          )}
        </div>

        <div>
          <label htmlFor="h-category" style={label}>Category</label>
          {editing ? (
            <select
              id="h-category"
              value={draftCategoryId}
              onChange={(e) => setDraftCategoryId(e.target.value)}
              disabled={saving}
              style={{ ...inputStyle, cursor: saving ? 'not-allowed' : 'pointer' }}
            >
              <option value="">— none —</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          ) : (
            <div style={readonlyText}>{habit.categoryName ?? '—'}</div>
          )}
        </div>

        <div>
          <span style={label}>Status</span>
          {editing ? (
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 0', fontFamily: mono, fontSize: 13 }}>
              <input
                type="checkbox"
                checked={draftIsActive}
                onChange={(e) => setDraftIsActive(e.target.checked)}
                disabled={saving}
              />
              Active
            </label>
          ) : (
            <div style={readonlyText}>{habit.isActive ? 'Active' : 'Archived'}</div>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
        <div style={{ ...T.tinyLabel(), color: C.textSecondary }}>
          All days · current round: R{round}
        </div>
        <div style={{ ...T.tinyLabel(), color: C.textSecondary }}>
          {habit.checkins.filter((c) => c.done).length} / {habit.targetDays} done
        </div>
      </div>

      <HabitCheckinGrid
        startDate={habit.startDate}
        targetDays={habit.targetDays}
        checkins={habit.checkins}
        onToggle={toggleCheckin}
        cols={22}
        cellSize={22}
        fillWidth
      />
    </PageShell>
  );
}
