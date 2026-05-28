'use client';

import type { CSSProperties } from 'react';
import { C, T } from '@/lib/ui/theme';
import MoodWidget from '@/components/dashboard/MoodWidget';
import HabitsWidget from '@/components/dashboard/HabitsWidget';
import JournalWidget from '@/components/dashboard/JournalWidget';
import EmotionsPlaceholder from '@/components/dashboard/EmotionsPlaceholder';
import PageBackground from '@/components/PageBackground';

export default function DashboardClient() {
  const page: CSSProperties = {
    position: 'relative',
    minHeight: '100vh',
    width: '100%',
    padding: '32px 28px 56px',
    overflow: 'hidden',
  };

  const outer: CSSProperties = {
    position: 'relative',
    zIndex: 1,
    width: '100%',
    maxWidth: 1280,
    margin: '0 auto',
    background: C.outerCard,
    borderRadius: 14,
    padding: 12,
    boxShadow: '0 16px 60px rgba(0,0,0,0.5), 0 2px 8px rgba(0,0,0,0.3)',
    transform: 'rotate(-0.25deg)',
  };

  const inner: CSSProperties = {
    background: C.cardBg,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  };

  // Login-style pink header bar
  const headerBar: CSSProperties = {
    background: C.headerBg,
    margin: 6,
    borderRadius: '4px 4px 0 0',
    padding: '18px 32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  };

  const burger: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    cursor: 'pointer',
  };

  const burgerLine: CSSProperties = {
    width: 22,
    height: 2,
    background: C.darkPink,
    borderRadius: 1,
    opacity: 0.7,
  };

  const stampBoxStyle: CSSProperties = {
    width: 56,
    height: 50,
    border: `1.5px solid ${C.darkPink}`,
    borderRadius: 2,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const body: CSSProperties = {
    padding: '28px 32px 42px',
    borderTop: `1px solid ${C.lineColor}`,
    margin: '0 6px 6px',
  };

  const sectionDivider: CSSProperties = {
    height: 1,
    background: C.lineColor,
    margin: '36px 0',
  };

  return (
    <main style={page}>
      <PageBackground />
      <div style={outer}>
        <div style={inner}>
          {/* Header — Login-style pink bar */}
          <div style={headerBar}>
            <div style={burger} aria-label="menu">
              <span style={burgerLine} />
              <span style={burgerLine} />
              <span style={burgerLine} />
            </div>
            <div style={T.brandTitle(36)}>your emotions matter</div>
            <div style={stampBoxStyle}>
              <svg width="24" height="22" viewBox="0 0 24 22" fill={C.darkPink} style={{ opacity: 0.8 }}>
                <path d="M12 21s-7.5-4.7-10-9.2C0 8 1.8 4 5.5 4c2 0 3.6 1 4.5 2.5C10.9 5 12.5 4 14.5 4 18.2 4 20 8 18 11.8 17.5 16.3 12 21 12 21z" />
              </svg>
            </div>
          </div>

          {/* Body */}
          <div style={body}>
            {/* Top row: Mood + Habits */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '260px minmax(0, 1fr)',
                gap: 32,
                alignItems: 'stretch',
                minHeight: 380,
              }}
            >
              <div style={{ borderRight: `1px solid ${C.lineColor}`, paddingRight: 28 }}>
                <MoodWidget />
              </div>
              <div>
                <HabitsWidget />
              </div>
            </div>

            <div style={sectionDivider} />

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1.4fr 1fr',
                gap: 72,
                alignItems: 'stretch',
                minHeight: 380,
              }}
            >
              <JournalWidget />
              <EmotionsPlaceholder />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
