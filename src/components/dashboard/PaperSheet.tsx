'use client';

import type { CSSProperties, ReactNode } from 'react';
import { C } from '@/lib/ui/theme';

type Props = {
  children: ReactNode;
  style?: CSSProperties;
  showBack?: boolean;
};

export default function PaperSheet({ children, style, showBack = true }: Props) {
  const wrap: CSSProperties = {
    position: 'relative',
    ...style,
  };
  const back: CSSProperties = {
    position: 'absolute',
    inset: 0,
    background: C.paperBg,
    border: `1.5px solid ${C.lineColor}`,
    borderRadius: 10,
    transform: 'translate(8px, 10px) rotate(0.6deg)',
    boxShadow: `0 4px 14px ${C.paperShadow}`,
    zIndex: 0,
  };
  const front: CSSProperties = {
    position: 'relative',
    background: C.cardBg,
    border: `1.5px solid ${C.lineColor}`,
    borderRadius: 10,
    overflow: 'hidden',
    boxShadow: showBack ? `0 6px 18px ${C.paperShadow}, 0 2px 4px rgba(0,0,0,0.08)` : 'none',
    zIndex: 1,
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  };
  return (
    <div style={wrap}>
      {showBack ? <div style={back} /> : null}
      <div style={front}>{children}</div>
    </div>
  );
}
