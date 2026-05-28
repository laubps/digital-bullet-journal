'use client';

import { useState, type CSSProperties } from 'react';
import { useRouter } from 'next/navigation';
import { C, T, mono } from '@/lib/ui/theme';
import ActiveHabitCard, { type ActiveHabit } from './habits/ActiveHabitCard';
import PlaceholderHabitCard from './habits/PlaceholderHabitCard';
import { currentRound, todayLocalIso } from '@/lib/habits/days';

const SLOTS = 8;

type Props = {
  habits: ActiveHabit[];
  onToggleCheckin: (habitId: string, date: string, currentDone: boolean) => void;
};

export default function HabitsWidget({ habits, onToggleCheckin }: Props) {
  const router = useRouter();
  const today = todayLocalIso();
  const [btnHover, setBtnHover] = useState<'update' | 'add' | 'link' | null>(null);

  const visible = habits.slice(0, SLOTS);
  const placeholderCount = Math.max(0, SLOTS - visible.length);

  const statsWrap: CSSProperties = { position: 'relative' };
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

  // Top-3 stats by completion in the current round (just a snapshot).
  const stats = visible
    .map((h) => {
      const round = currentRound(h.startDate, today);
      const totalDone = h.checkins.filter((c) => c.done).length;
      return { name: h.name, round, totalDone, target: h.targetDays };
    })
    .sort((a, b) => b.totalDone - a.totalDone)
    .slice(0, 5);

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
            {visible.map((h) => (
              <ActiveHabitCard key={h.id} habit={h} onToggle={onToggleCheckin} />
            ))}
            {Array.from({ length: placeholderCount }).map((_, i) => (
              <PlaceholderHabitCard key={`ph-${i}`} />
            ))}
          </div>
          <button
            type="button"
            onClick={() => router.push('/habits')}
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
              {stats.length === 0 ? (
                <div style={{ ...statRow, borderBottom: 'none', justifyContent: 'flex-start' }}>
                  no habits yet
                </div>
              ) : (
                stats.map((s, i) => (
                  <div
                    key={s.name}
                    style={{ ...statRow, borderBottom: i === stats.length - 1 ? 'none' : statRow.borderBottom }}
                  >
                    <span>{s.name}</span>
                    <span>R{s.round} · {s.totalDone}/{s.target}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div style={T.sectionPhrase()}>
            these are the habits with the strongest streaks this round — small wins that quietly compound day after day.
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 'auto' }}>
            <button
              type="button"
              onClick={() => router.push('/habits')}
              onMouseEnter={() => setBtnHover('update')}
              onMouseLeave={() => setBtnHover(null)}
              style={filledBtn('update')}
            >
              Update tracker
            </button>
            <button
              type="button"
              onClick={() => router.push('/habits/new')}
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
