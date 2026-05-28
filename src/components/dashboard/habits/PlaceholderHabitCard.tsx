'use client';

import type { CSSProperties } from 'react';
import { C } from '@/lib/ui/theme';
import { ROUND_SIZE } from '@/lib/habits/days';

export default function PlaceholderHabitCard() {
  const tile: CSSProperties = {
    background: C.placeholderBg,
    border: `1.5px dashed ${C.placeholderBorder}`,
    borderRadius: 6,
    padding: 8,
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    aspectRatio: '1 / 1',
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
      </div>
    </div>
  );
}
