'use client';

import type { CSSProperties } from 'react';
import { C, mono } from '@/lib/ui/theme';
import { ROUND_SIZE, type ActiveHabit } from './types';

type Props = {
  habit: ActiveHabit;
  onMore: () => void;
};

export default function ActiveHabitCard({ habit, onMore }: Props) {
  const tile: CSSProperties = {
    background: C.cardBg,
    border: `1.5px solid ${C.lineColor}`,
    borderRadius: 6,
    padding: 7,
    display: 'flex',
    flexDirection: 'column',
    gap: 5,
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
    fontSize: 8,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    color: C.textSecondary,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  };

  const round: CSSProperties = {
    fontFamily: mono,
    fontSize: 7,
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
    gridTemplateColumns: 'repeat(5, minmax(0, 1fr))',
    gap: 2,
    alignContent: 'start',
    minWidth: 0,
  };

  const moreBtn: CSSProperties = {
    gridColumn: 'span 3',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    fontFamily: mono,
    fontSize: 8,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    color: C.textSecondary,
    background: 'transparent',
    border: 'none',
    padding: 0,
    cursor: 'pointer',
  };

  const plus: CSSProperties = {
    width: 12,
    height: 12,
    borderRadius: '50%',
    border: `1px solid ${C.lineColor}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 10,
    lineHeight: 1,
    color: C.lineColor,
  };

  return (
    <div style={tile}>
      <div style={head}>
        <div style={name}>{habit.name}</div>
        <div style={round}>R{habit.round}</div>
      </div>
      <div style={grid}>
        {Array.from({ length: ROUND_SIZE }).map((_, i) => {
          const checked = i < habit.cells.length && habit.cells[i] === true;
          const missed = i < habit.cells.length && habit.cells[i] === false;
          return (
            <div
              key={i}
              style={{
                aspectRatio: '1 / 1',
                background: checked ? C.darkPink : 'transparent',
                border: `1px solid ${C.lineColor}`,
                borderRadius: 1,
                opacity: checked ? 0.9 : missed ? 0.35 : 0.4,
              }}
            />
          );
        })}
        <button type="button" onClick={onMore} style={moreBtn}>
          <span style={plus}>+</span>
          ver más
        </button>
      </div>
    </div>
  );
}
