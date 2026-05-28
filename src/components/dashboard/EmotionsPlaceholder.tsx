'use client';

import type { CSSProperties } from 'react';
import { C, T } from '@/lib/ui/theme';

export default function EmotionsPlaceholder() {
  const wrap: CSSProperties = {
    position: 'relative',
    height: '100%',
    minHeight: 320,
  };
  const back: CSSProperties = {
    position: 'absolute',
    inset: 0,
    background: C.placeholderBg,
    border: `1.5px solid ${C.placeholderBorder}`,
    borderRadius: 10,
    transform: 'translate(-8px, 8px) rotate(-0.8deg)',
    zIndex: 0,
  };
  const front: CSSProperties = {
    position: 'relative',
    background: C.placeholderBg,
    border: `1.5px solid ${C.placeholderBorder}`,
    borderRadius: 10,
    padding: '20px 24px',
    height: '100%',
    boxShadow: '0 4px 14px rgba(0,0,0,0.08)',
    zIndex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: 14,
  };

  const line = (w: string): CSSProperties => ({
    height: 2,
    width: w,
    background: C.placeholderLine,
    borderRadius: 1,
  });

  return (
    <div style={wrap}>
      <div style={back} />
      <div style={front}>
        <div style={{ ...T.tinyLabel(), color: C.placeholderText }}>
          Emotions analyzer · placeholder
        </div>
        <div style={{ ...T.sectionTitle(), color: C.placeholderText }}>emotions been like…</div>
        <div style={{ ...T.sectionPhrase(C.placeholderText), marginTop: -8 }}>
          what your week of feelings looks like.
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 8 }}>
          <div style={line('92%')} />
          <div style={line('85%')} />
          <div style={line('78%')} />
          <div style={line('88%')} />
          <div style={line('70%')} />
          <div style={line('60%')} />
        </div>
        <div
          style={{
            ...T.tinyLabel(),
            color: C.placeholderText,
            marginTop: 'auto',
            textAlign: 'right',
          }}
        >
          Connects in step 9
        </div>
      </div>
    </div>
  );
}
