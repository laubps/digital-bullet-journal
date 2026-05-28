'use client';

import type { CSSProperties } from 'react';
import { C, T } from '@/lib/ui/theme';

type Props = {
  label?: string;
  minHeight?: number | string;
};

export default function Loading({ label = 'loading…', minHeight = 320 }: Props) {
  const wrap: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    minHeight,
    width: '100%',
    padding: '32px 8px',
  };

  return (
    <div style={wrap} role="status" aria-live="polite" aria-busy="true">
      <div style={{ ...T.tinyLabel(), color: C.textSecondary }}>{label}</div>
      <div style={{ ...T.sectionPhrase(), color: C.textSecondary, opacity: 0.7 }}>
        just a moment
      </div>
    </div>
  );
}
