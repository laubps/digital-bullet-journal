'use client';

import type { CSSProperties, ReactNode } from 'react';
import { C } from './theme';

type Props = {
  children: ReactNode;
  maxWidth?: number | string;
  rotate?: number;
  style?: CSSProperties;
  innerStyle?: CSSProperties;
};

export default function PetalCard({ children, maxWidth = 1180, rotate = -0.4, style, innerStyle }: Props) {
  const outer: CSSProperties = {
    position: 'relative',
    width: '100%',
    maxWidth,
    background: C.outerCard,
    borderRadius: 14,
    padding: 10,
    boxShadow: '0 16px 60px rgba(0,0,0,0.5), 0 2px 8px rgba(0,0,0,0.3)',
    transform: `rotate(${rotate}deg)`,
    ...style,
  };
  const inner: CSSProperties = {
    width: '100%',
    background: C.cardBg,
    borderRadius: 8,
    overflow: 'hidden',
    ...innerStyle,
  };
  return (
    <div style={outer}>
      <div style={inner}>{children}</div>
    </div>
  );
}
