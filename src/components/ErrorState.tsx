'use client';

import type { CSSProperties } from 'react';
import { C, T, mono } from '@/lib/ui/theme';

type Props = {
  title?: string;
  message?: string;
  onRetry?: () => void;
  minHeight?: number | string;
};

export default function ErrorState({
  title = 'we could not load this',
  message = 'the server is not responding right now. check your connection and try again.',
  onRetry,
  minHeight = 320,
}: Props) {
  const wrap: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
    minHeight,
    width: '100%',
    padding: '32px 16px',
    textAlign: 'center',
  };

  const retryBtn: CSSProperties = {
    marginTop: 4,
    padding: '10px 22px',
    border: 'none',
    borderRadius: 6,
    background: C.btnColor,
    color: '#fff',
    fontFamily: mono,
    fontSize: 12,
    letterSpacing: '0.16em',
    textTransform: 'uppercase',
    cursor: 'pointer',
    transition: 'background 0.18s ease',
  };

  return (
    <div style={wrap} role="alert" aria-live="assertive">
      <div style={{ ...T.brandTitle(28), color: C.danger }}>{title}</div>
      <div
        style={{
          fontFamily: mono,
          fontSize: 13,
          letterSpacing: '0.04em',
          color: '#6b7280',
          maxWidth: 420,
          lineHeight: 1.6,
        }}
      >
        {message}
      </div>
      {onRetry ? (
        <button
          type="button"
          style={retryBtn}
          onClick={onRetry}
          onMouseEnter={(e) => (e.currentTarget.style.background = C.btnHover)}
          onMouseLeave={(e) => (e.currentTarget.style.background = C.btnColor)}
        >
          Try again
        </button>
      ) : null}
    </div>
  );
}
