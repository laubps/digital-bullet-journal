'use client';

import type { CSSProperties } from 'react';
import { C, mono } from '@/lib/ui/theme';
import { ROUND_SIZE, type PlaceholderHabit } from './types';

type Props = {
  habit: PlaceholderHabit;
};

export default function PlaceholderHabitCard({ habit }: Props) {
  const tile: CSSProperties = {
    background: C.placeholderBg,
    border: `1.5px dashed ${C.placeholderBorder}`,
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
    color: C.placeholderText,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
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
    color: C.placeholderText,
    background: 'transparent',
    border: 'none',
    padding: 0,
    cursor: 'default',
  };

  const plus: CSSProperties = {
    width: 12,
    height: 12,
    borderRadius: '50%',
    border: `1px dashed ${C.placeholderLine}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 10,
    lineHeight: 1,
    color: C.placeholderText,
  };

  return (
    <div style={tile}>
      <div style={head}>
        <div style={name}>{habit.name}</div>
      </div>
      <div style={grid}>
        {Array.from({ length: ROUND_SIZE }).map((_, i) => (
          <div
            key={i}
            style={{
              aspectRatio: '1 / 1',
              background: 'transparent',
              border: `1px dashed ${C.placeholderLine}`,
              borderRadius: 1,
              opacity: 0.5,
            }}
          />
        ))}
        <button type="button" disabled style={moreBtn}>
          <span style={plus}>+</span>
          ver más
        </button>
      </div>
    </div>
  );
}
