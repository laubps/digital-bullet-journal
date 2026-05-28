'use client';

import type { CSSProperties } from 'react';
import { useRouter } from 'next/navigation';
import { C, mono } from '@/lib/ui/theme';
import { ROUND_SIZE, currentRound, todayLocalIso, dateForDayOffset } from '@/lib/habits/days';
import type { Checkin } from '@/components/habits/HabitCheckinGrid';

export type ActiveHabit = {
  id: string;
  name: string;
  targetDays: number;
  startDate: string;
  checkins: Checkin[];
};

type Props = {
  habit: ActiveHabit;
  onToggle: (habitId: string, date: string, currentDone: boolean) => void;
};

export default function ActiveHabitCard({ habit, onToggle }: Props) {
  const router = useRouter();
  const today = todayLocalIso();
  const round = currentRound(habit.startDate, today);
  const roundStart = (round - 1) * ROUND_SIZE;
  const roundEnd = Math.min(roundStart + ROUND_SIZE, habit.targetDays);
  const visible = Math.max(0, roundEnd - roundStart);

  const doneByDate = new Map<string, boolean>();
  for (const c of habit.checkins) doneByDate.set(c.checkDate, c.done);

  const tile: CSSProperties = {
    background: C.cardBg,
    border: `1.5px solid ${C.lineColor}`,
    borderRadius: 6,
    padding: 8,
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    aspectRatio: '1 / 1',
  };

  const head: CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 4,
  };

  const name: CSSProperties = {
    fontFamily: mono,
    fontSize: 9,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: C.textPrimary,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    cursor: 'pointer',
  };

  const roundBadge: CSSProperties = {
    fontFamily: mono,
    fontSize: 8,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    color: C.darkPink,
    border: `1px solid ${C.darkPink}`,
    borderRadius: 2,
    padding: '1px 4px',
    flexShrink: 0,
  };

  const grid: CSSProperties = {
    flex: 1,
    display: 'grid',
    gridTemplateColumns: 'repeat(6, minmax(0, 1fr))',
    gap: 3,
    alignContent: 'start',
    minWidth: 0,
  };

  return (
    <div style={tile}>
      <div style={head}>
        <div style={name} onClick={() => router.push(`/habits/${habit.id}`)} title={habit.name}>
          {habit.name}
        </div>
        <div style={roundBadge}>R{round}</div>
      </div>
      <div style={grid}>
        {Array.from({ length: visible }).map((_, i) => {
          const dayIndex = roundStart + i;
          const dayNumber = dayIndex + 1;
          const date = dateForDayOffset(habit.startDate, dayIndex);
          const done = doneByDate.get(date) === true;
          const isFuture = date > today;

          const cellStyle: CSSProperties = {
            aspectRatio: '1 / 1',
            background: done ? C.darkPink : 'transparent',
            border: `1px solid ${C.lineColor}`,
            borderRadius: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: mono,
            fontSize: 8,
            color: done ? '#fff' : isFuture ? C.textSecondary : C.textPrimary,
            opacity: isFuture ? 0.35 : 1,
            cursor: isFuture ? 'default' : 'pointer',
            padding: 0,
            minWidth: 0,
          };

          if (isFuture) {
            return (
              <div key={dayIndex} style={cellStyle} title={`Day ${dayNumber} · ${date}`}>
                {dayNumber}
              </div>
            );
          }
          return (
            <button
              key={dayIndex}
              type="button"
              onClick={() => onToggle(habit.id, date, done)}
              title={`Day ${dayNumber} · ${date}`}
              style={cellStyle}
            >
              {dayNumber}
            </button>
          );
        })}
      </div>
    </div>
  );
}
