'use client';

import { useState, type CSSProperties } from 'react';
import { useRouter } from 'next/navigation';
import { C, T, mono } from '@/lib/ui/theme';

const MOODS = ['Happy', 'Sad', 'Anxious', 'Calm', 'Angry', 'Excited', 'Tired', 'Neutral'] as const;

export default function MoodWidget() {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set(['Sad', 'Happy']));
  const [btnHover, setBtnHover] = useState<'add' | 'date' | 'link' | null>(null);

  const toggle = (m: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(m)) next.delete(m);
      else next.add(m);
      return next;
    });

  const itemStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '4px 0',
    fontFamily: mono,
    fontSize: 13,
    color: C.textPrimary,
    cursor: 'pointer',
    userSelect: 'none',
  };

  const checkStyle = (active: boolean): CSSProperties => ({
    width: 14,
    height: 14,
    border: `1.5px solid ${C.lineColor}`,
    borderRadius: 2,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: active ? C.darkPink : 'transparent',
    color: '#fff',
    fontSize: 10,
    lineHeight: 1,
    transition: 'background 0.15s ease',
  });

  const btnStyle = (key: 'add' | 'date'): CSSProperties => ({
    ...T.button(),
    fontSize: 11,
    padding: '8px 16px',
    border: `1.5px solid ${C.lineColor}`,
    borderRadius: 6,
    background: btnHover === key ? C.btnColor : 'transparent',
    color: btnHover === key ? '#fff' : C.textPrimary,
    cursor: 'pointer',
    transition: 'background 0.18s ease, color 0.18s ease',
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ ...T.tinyLabel(), marginBottom: 4 }}>Mood tracker</div>
      <div style={T.sectionTitle()}>how you feeling today</div>
      <div style={{ ...T.sectionPhrase(), marginTop: 4, marginBottom: 20 }}>
        name the emotion, hold it gently.
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 24 }}>
        {MOODS.map((m) => {
          const active = selected.has(m);
          return (
            <div key={m} style={itemStyle} onClick={() => toggle(m)}>
              <span style={checkStyle(active)}>{active ? '✓' : ''}</span>
              <span style={{ textTransform: 'lowercase' }}>{m}</span>
            </div>
          );
        })}
      </div>

      <div style={{ ...T.tinyLabel(), marginBottom: 14 }}>&lt;last emotion&gt;</div>

      <div style={{ display: 'flex', gap: 10, marginTop: 'auto' }}>
        <button
          type="button"
          onClick={() => router.push('/mood')}
          onMouseEnter={() => setBtnHover('add')}
          onMouseLeave={() => setBtnHover(null)}
          style={btnStyle('add')}
        >
          Add
        </button>
        <button
          type="button"
          onClick={() => router.push('/mood?date=other')}
          onMouseEnter={() => setBtnHover('date')}
          onMouseLeave={() => setBtnHover(null)}
          style={btnStyle('date')}
        >
          To other date
        </button>
      </div>

      <button
        type="button"
        onClick={() => router.push('/mood?view=history')}
        onMouseEnter={() => setBtnHover('link')}
        onMouseLeave={() => setBtnHover(null)}
        style={{
          ...T.label(),
          fontSize: 11,
          color: btnHover === 'link' ? C.darkPink : C.textSecondary,
          background: 'transparent',
          border: 'none',
          borderBottom: `1px solid ${btnHover === 'link' ? C.darkPink : 'transparent'}`,
          cursor: 'pointer',
          padding: '4px 0',
          marginTop: 12,
          alignSelf: 'flex-start',
          transition: 'color 0.18s ease, border-color 0.18s ease',
        }}
      >
        ver historial →
      </button>
    </div>
  );
}
