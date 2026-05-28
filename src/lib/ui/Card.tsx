'use client';

import type { CSSProperties, ReactNode } from 'react';
import { C } from './theme';

type Props = {
  children: ReactNode;
  maxWidth?: number;
};

/**
 * The signature olive-on-white card used across the app (PageShell, login).
 * Use this when you need the card shell without the title bar.
 */
export default function Card({ children, maxWidth = 900 }: Props) {
  const outer: CSSProperties = {
    position: 'relative',
    zIndex: 1,
    width: '100%',
    maxWidth,
    margin: '0 auto',
    background: C.outerCard,
    borderRadius: 14,
    padding: 12,
    boxShadow: '0 16px 60px rgba(0,0,0,0.5), 0 2px 8px rgba(0,0,0,0.3)',
    transform: 'rotate(-0.3deg)',
  };

  const inner: CSSProperties = {
    background: C.cardBg,
    borderRadius: 8,
    overflow: 'hidden',
    padding: '32px 28px',
  };

  return (
    <div style={outer}>
      <div style={inner}>{children}</div>
    </div>
  );
}
