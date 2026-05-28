'use client';

import { useState, type CSSProperties } from 'react';
import { useRouter } from 'next/navigation';
import { C, T, mono } from '@/lib/ui/theme';
import ActiveHabitCard from './habits/ActiveHabitCard';
import PlaceholderHabitCard from './habits/PlaceholderHabitCard';
import type { ActiveHabit, PlaceholderHabit } from './habits/types';

type HabitSlot =
  | { kind: 'active'; data: ActiveHabit }
  | { kind: 'placeholder'; data: PlaceholderHabit };

const HABITS: HabitSlot[] = [
  { kind: 'active', data: { name: 'habit 1', round: 1, cells: [true, true, true, false, true, true, true, true, false, true, true, true, true, false, true, true, true, true] } },
  { kind: 'active', data: { name: 'habit 2', round: 2, cells: [true, true, false, true, true] } },
  { kind: 'active', data: { name: 'habit 3', round: 1, cells: [true, false, true, true, false, true, true, true, false] } },
  { kind: 'active', data: { name: 'habit 4', round: 3, cells: [true, true, true, true, true, true, true] } },
  { kind: 'placeholder', data: { name: 'habit 5' } },
  { kind: 'placeholder', data: { name: 'habit 6' } },
  { kind: 'placeholder', data: { name: 'habit 7' } },
  { kind: 'placeholder', data: { name: 'habit 8' } },
];

export default function HabitsWidget() {
  const router = useRouter();
  const [btnHover, setBtnHover] = useState<'update' | 'add' | 'link' | null>(null);

  const statsWrap: CSSProperties = {
    position: 'relative',
  };
  const statsBack: CSSProperties = {
    position: 'absolute',
    inset: 0,
    background: C.placeholderBg,
    border: `1.5px solid ${C.placeholderBorder}`,
    borderRadius: 10,
    transform: 'translate(-8px, 8px) rotate(-0.8deg)',
    zIndex: 0,
  };
  const statsCard: CSSProperties = {
    position: 'relative',
    background: C.placeholderBg,
    border: `1.5px solid ${C.placeholderBorder}`,
    borderRadius: 10,
    padding: '16px 18px',
    boxShadow: '0 4px 14px rgba(0,0,0,0.08)',
    zIndex: 1,
  };

  const statsTitle: CSSProperties = {
    ...T.sectionTitle(),
    fontSize: 18,
    marginBottom: 10,
    color: C.placeholderText,
  };

  const statRow: CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    fontFamily: mono,
    fontSize: 11,
    color: C.placeholderText,
    letterSpacing: '0.04em',
    padding: '4px 0',
    borderBottom: `1px dashed ${C.placeholderLine}`,
  };

  const outlineBtn = (key: 'update' | 'add'): CSSProperties => ({
    ...T.button(),
    fontSize: 10,
    padding: '8px 14px',
    border: `1.5px solid ${C.lineColor}`,
    borderRadius: 6,
    background: btnHover === key ? C.btnColor : 'transparent',
    color: btnHover === key ? '#fff' : C.textPrimary,
    cursor: 'pointer',
    transition: 'background 0.18s ease, color 0.18s ease',
    width: '100%',
  });

  const filledBtn = (key: 'update' | 'add'): CSSProperties => ({
    ...T.button(),
    fontSize: 10,
    padding: '8px 14px',
    border: 'none',
    borderRadius: 6,
    background: btnHover === key ? C.btnHover : C.btnColor,
    color: '#fff',
    cursor: 'pointer',
    transition: 'background 0.18s ease',
    width: '100%',
  });

  const linkStyle: CSSProperties = {
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
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%', minWidth: 0 }}>
      <div style={{ ...T.tinyLabel(), marginBottom: 4 }}>Habit tracker</div>
      <div style={T.sectionTitle()}>habits give us the path, track them.</div>
      <div style={{ ...T.sectionPhrase(), marginTop: 4, marginBottom: 18 }}>
        small repetitions become who you are.
      </div>

      <div style={{ display: 'flex', gap: 72, flex: 1, minWidth: 0 }}>
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
              gap: 8,
              alignContent: 'start',
              width: '100%',
            }}
          >
            {HABITS.map((slot) =>
              slot.kind === 'active' ? (
                <ActiveHabitCard
                  key={slot.data.name}
                  habit={slot.data}
                  onMore={() => router.push(`/habits?name=${encodeURIComponent(slot.data.name)}`)}
                />
              ) : (
                <PlaceholderHabitCard key={slot.data.name} habit={slot.data} />
              ),
            )}
          </div>
          <button
            type="button"
            onClick={() => router.push('/habits?view=all')}
            onMouseEnter={() => setBtnHover('link')}
            onMouseLeave={() => setBtnHover(null)}
            style={linkStyle}
          >
            ve lista completa de tus hábitos →
          </button>
        </div>

        <div style={{ width: 200, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={statsWrap}>
            <div style={statsBack} />
            <div style={statsCard}>
              <div style={statsTitle}>some stats…</div>
              <div style={statRow}><span>habit 1</span><span>R1 · 14/22</span></div>
              <div style={statRow}><span>habit 4</span><span>R3 · 7/22</span></div>
              <div style={statRow}><span>habit 6</span><span>R1 · 5/22</span></div>
              <div style={statRow}><span>habit 2</span><span>R2 · 4/22</span></div>
              <div style={{ ...statRow, borderBottom: 'none' }}><span>habit 3</span><span>R1 · 6/22</span></div>
            </div>
          </div>

          <div style={T.sectionPhrase()}>
            these are the habits with the strongest streaks this round — small wins that quietly compound day after day.
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 'auto' }}>
            <button
              type="button"
              onClick={() => router.push('/habits?mode=update')}
              onMouseEnter={() => setBtnHover('update')}
              onMouseLeave={() => setBtnHover(null)}
              style={filledBtn('update')}
            >
              Update tracker
            </button>
            <button
              type="button"
              onClick={() => router.push('/habits')}
              onMouseEnter={() => setBtnHover('add')}
              onMouseLeave={() => setBtnHover(null)}
              style={outlineBtn('add')}
            >
              Add new habit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
