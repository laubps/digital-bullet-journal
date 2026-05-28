'use client';

import { useState, type CSSProperties, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { C, mono } from '@/lib/ui/theme';
import PageShell from '@/lib/ui/PageShell';

const MOODS = ['Happy', 'Sad', 'Anxious', 'Calm', 'Angry', 'Excited', 'Tired', 'Neutral'] as const;

export default function MoodPage() {
  const router = useRouter();
  const [mood, setMood] = useState<string>('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [note, setNote] = useState('');
  const [hover, setHover] = useState(false);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    console.warn('mood submit (UI only, wiring in step 5)', { mood, date, note });
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

  const chip = (active: boolean): CSSProperties => ({
    padding: '10px 12px',
    border: `1.5px solid ${active ? C.darkPink : C.lineColor}`,
    background: active ? C.darkPink : 'transparent',
    color: active ? '#fff' : C.textPrimary,
    borderRadius: 6,
    fontFamily: mono,
    fontSize: 11,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    cursor: 'pointer',
    transition: 'all 0.18s ease',
  });

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

  return (
    <PageShell title="how are you feeling?" subtitle="Mood entry">
      <form onSubmit={onSubmit}>
        <div style={{ marginBottom: 24 }}>
          <span style={label}>Pick a mood</span>
          <div style={grid}>
            {MOODS.map((m) => (
              <button key={m} type="button" onClick={() => setMood(m)} style={chip(mood === m)}>
                {m}
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: 24 }}>
          <label htmlFor="mood-date" style={label}>Date</label>
          <input
            id="mood-date"
            type="date"
            value={date}
            max={new Date().toISOString().slice(0, 10)}
            onChange={(e) => setDate(e.target.value)}
            style={inputStyle}
          />
        </div>

        <div style={{ marginBottom: 28 }}>
          <label htmlFor="mood-note" style={label}>Note (optional)</label>
          <textarea
            id="mood-note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={4}
            style={{
              ...inputStyle,
              height: 'auto',
              borderBottom: 'none',
              border: `1.5px solid ${C.inputBorderDefault}`,
              borderRadius: 6,
              padding: 12,
              resize: 'vertical',
              fontFamily: "'Times New Roman', Georgia, serif",
              fontSize: 15,
              lineHeight: 1.6,
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <button
            type="submit"
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            style={submitBtn}
            disabled={!mood}
          >
            Save mood
          </button>
          <button type="button" onClick={() => router.push('/dashboard')} style={cancelBtn}>
            Cancel
          </button>
        </div>
      </form>
    </PageShell>
  );
}
