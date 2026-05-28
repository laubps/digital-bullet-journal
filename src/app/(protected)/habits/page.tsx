'use client';

import { useState, type CSSProperties, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { C, mono } from '@/lib/ui/theme';
import PageShell from '@/lib/ui/PageShell';

export default function HabitsPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [targetDays, setTargetDays] = useState(22);
  const [description, setDescription] = useState('');
  const [hover, setHover] = useState(false);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    console.warn('habit submit (UI only, wiring in step 6)', { name, targetDays, description });
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
    background: hover ? C.btnHover : C.btnColor,
    color: '#fff',
    border: 'none',
    borderRadius: 6,
    fontFamily: mono,
    fontSize: 12,
    letterSpacing: '0.16em',
    textTransform: 'uppercase',
    cursor: 'pointer',
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
    cursor: 'pointer',
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
            style={inputStyle}
          />
        </div>

        <div style={{ marginBottom: 24 }}>
          <label htmlFor="habit-days" style={label}>Target days (min 22)</label>
          <input
            id="habit-days"
            type="number"
            min={22}
            value={targetDays}
            onChange={(e) => setTargetDays(Math.max(22, Number(e.target.value) || 22))}
            style={inputStyle}
          />
          <div style={helper}>habits take at least 22 days to take root.</div>
        </div>

        <div style={{ marginBottom: 28 }}>
          <label htmlFor="habit-desc" style={label}>Why this habit? (optional)</label>
          <textarea
            id="habit-desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            style={{
              width: '100%',
              border: `1.5px solid ${C.inputBorderDefault}`,
              borderRadius: 6,
              padding: 12,
              resize: 'vertical',
              fontFamily: "'Times New Roman', Georgia, serif",
              fontSize: 15,
              lineHeight: 1.6,
              outline: 'none',
              background: 'transparent',
              color: C.textPrimary,
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <button
            type="submit"
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            style={submitBtn}
            disabled={!name.trim()}
          >
            Add habit
          </button>
          <button type="button" onClick={() => router.push('/dashboard')} style={cancelBtn}>
            Cancel
          </button>
        </div>
      </form>
    </PageShell>
  );
}
