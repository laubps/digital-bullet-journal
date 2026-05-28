'use client';

import type { CSSProperties, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { C, T } from './theme';
import PageBackground from '@/components/PageBackground';

type Props = {
  title: string;
  subtitle?: string;
  children: ReactNode;
  maxWidth?: number;
};

export default function PageShell({ title, subtitle, children, maxWidth = 900 }: Props) {
  const router = useRouter();

  const page: CSSProperties = {
    position: 'relative',
    minHeight: '100vh',
    width: '100%',
    padding: '32px 24px 64px',
    overflow: 'hidden',
  };

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
  };

  const headerBar: CSSProperties = {
    background: C.headerBg,
    margin: 6,
    borderRadius: '4px 4px 0 0',
    padding: '16px 28px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  };

  const back: CSSProperties = {
    ...T.label(),
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: 0,
    color: C.darkPink,
  };

  return (
    <main style={page}>
      <PageBackground />
      <div style={outer}>
        <div style={inner}>
          <div style={headerBar}>
            <button type="button" onClick={() => router.push('/dashboard')} style={back}>
              ← dashboard
            </button>
            <div style={T.brandTitle(28)}>{title}</div>
            {subtitle ? (
              <div style={{ ...T.tinyLabel(), color: C.darkPink, opacity: 0.7 }}>{subtitle}</div>
            ) : (
              <div style={{ width: 60 }} />
            )}
          </div>
          <div style={{ padding: '24px 32px 32px', borderTop: `1px solid ${C.lineColor}`, margin: '0 6px 6px' }}>
            {children}
          </div>
        </div>
      </div>
    </main>
  );
}
