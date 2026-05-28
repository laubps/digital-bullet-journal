'use client';

import type { CSSProperties } from 'react';
import { C, T, mono } from '@/lib/ui/theme';
import PageShell from '@/lib/ui/PageShell';

const RANGES = ['Day', 'Week', 'Month', 'Year'] as const;

export default function AnalyzerPage() {
  const chip: CSSProperties = {
    ...T.button(),
    fontSize: 11,
    padding: '10px 16px',
    border: `1.5px solid ${C.placeholderBorder}`,
    color: C.placeholderText,
    background: C.placeholderBg,
    borderRadius: 6,
    cursor: 'not-allowed',
  };

  const card: CSSProperties = {
    position: 'relative',
    background: C.placeholderBg,
    border: `1.5px solid ${C.placeholderBorder}`,
    borderRadius: 10,
    padding: '24px 28px',
    boxShadow: '0 4px 14px rgba(0,0,0,0.06)',
  };

  const title: CSSProperties = {
    ...T.sectionTitle(),
    color: C.placeholderText,
    marginBottom: 6,
  };

  const phrase: CSSProperties = {
    ...T.sectionPhrase(C.placeholderText),
    marginBottom: 16,
  };

  const line = (w: string): CSSProperties => ({
    height: 2,
    width: w,
    background: C.placeholderLine,
    borderRadius: 1,
  });

  const tag: CSSProperties = {
    ...T.tinyLabel(),
    color: C.placeholderText,
    marginBottom: 10,
  };

  return (
    <PageShell title="emotions analyzer" subtitle="Placeholder · step 9">
      <div style={{ ...T.sectionPhrase(), marginBottom: 24 }}>
        a psychological-perspective summary of your patterns.
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 28 }}>
        {RANGES.map((r) => (
          <button key={r} type="button" disabled style={chip}>
            past {r}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div style={card}>
          <div style={tag}>summary</div>
          <div style={title}>emotional patterns</div>
          <div style={phrase}>themes the journal has been hinting at.</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={line('94%')} />
            <div style={line('88%')} />
            <div style={line('80%')} />
            <div style={line('72%')} />
            <div style={line('60%')} />
          </div>
        </div>
        <div style={card}>
          <div style={tag}>trend</div>
          <div style={title}>recent observations</div>
          <div style={phrase}>how the past few days have shifted.</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={line('70%')} />
            <div style={line('86%')} />
            <div style={line('78%')} />
            <div style={line('64%')} />
            <div style={line('50%')} />
          </div>
        </div>
      </div>

      <div
        style={{
          marginTop: 24,
          padding: '14px 18px',
          border: `1.5px dashed ${C.placeholderBorder}`,
          borderRadius: 8,
          background: '#fafafa',
          fontFamily: mono,
          fontSize: 10,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: C.placeholderText,
          textAlign: 'center',
        }}
      >
        connects to Claude API in step 9 — these are placeholders only
      </div>
    </PageShell>
  );
}
