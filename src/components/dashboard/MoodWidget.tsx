'use client';

import { useMemo, useState, type CSSProperties } from 'react';
import { useRouter } from 'next/navigation';
import { C, T, mono } from '@/lib/ui/theme';

const MOODS = ['Happy', 'Sad', 'Anxious', 'Calm', 'Angry', 'Excited', 'Tired', 'Neutral'] as const;

export type MoodSummary = {
  today: string[];
  last: { mood: string; entryDate: string; createdAt: string } | null;
};

type Props = {
  summary: MoodSummary;
};

export default function MoodWidget({ summary }: Props) {
  const router = useRouter();
  const todaySet = useMemo(() => new Set(summary.today ?? []), [summary.today]);
  const lastMood = summary.last?.mood ?? null;
  const [btnHover, setBtnHover] = useState<'add' | 'link' | null>(null);

  const itemStyle = (active: boolean): CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '4px 0',
    fontFamily: mono,
    fontSize: 13,
    color: C.textPrimary,
    cursor: 'default',
    userSelect: 'none',
    opacity: active ? 1 : 0.85,
  });

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

  const addBtn: CSSProperties = {
    ...T.button(),
    fontSize: 11,
    padding: '8px 16px',
    border: 'none',
    borderRadius: 6,
    background: btnHover === 'add' ? C.btnHover : C.btnColor,
    color: '#fff',
    cursor: 'pointer',
    transition: 'background 0.18s ease',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ ...T.tinyLabel(), marginBottom: 4 }}>Mood tracker</div>
      <div style={T.sectionTitle()}>today I feel...</div>
      <div style={{ ...T.sectionPhrase(), marginTop: 4, marginBottom: 20 }}>
        name the emotion, hold it gently.
      </div>

      <div
        style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 24 }}
        role="list"
        aria-label="today's moods"
      >
        {MOODS.map((m) => {
          const active = todaySet.has(m);
          return (
            <div key={m} style={itemStyle(active)} role="listitem" aria-checked={active}>
              <span style={checkStyle(active)}>{active ? '✓' : ''}</span>
              <span style={{ textTransform: 'lowercase' }}>{m}</span>
            </div>
          );
        })}
      </div>

      <div style={{ ...T.tinyLabel(), marginBottom: 14 }}>
        {lastMood ? `last emotion: ${lastMood.toLowerCase()}` : '<none yet>'}
      </div>

      <div style={{ display: 'flex', gap: 10, marginTop: 'auto' }}>
        <button
          type="button"
          onClick={() => router.push('/mood')}
          onMouseEnter={() => setBtnHover('add')}
          onMouseLeave={() => setBtnHover(null)}
          style={addBtn}
        >
          Add an entry
        </button>
      </div>

      <button
        type="button"
        onClick={() => router.push('/mood/dashboard')}
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
