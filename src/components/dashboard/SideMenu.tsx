'use client';

import { useEffect, useState, type CSSProperties } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { C, T, mono } from '@/lib/ui/theme';

type Props = {
  open: boolean;
  onClose: () => void;
};

type Item = {
  label: string;
  href: string;
  disabled?: boolean;
};

const ITEMS: Item[] = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Mood Tracker', href: '/mood/dashboard' },
  { label: 'Habit Tracker', href: '/habits', disabled: true },
  { label: 'Journal', href: '/journal', disabled: true },
  { label: 'Emotions Analyzer', href: '/emotions', disabled: true },
];

export default function SideMenu({ open, onClose }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [hover, setHover] = useState<string | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);

  // Close on Escape and lock body scroll while open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  const navigate = (href: string) => {
    onClose();
    if (href !== pathname) router.push(href);
  };

  const onLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // Best-effort — proceed to login regardless.
    }
    router.replace('/login');
  };

  const backdrop: CSSProperties = {
    position: 'fixed',
    inset: 0,
    background: C.overlayBg,
    opacity: open ? 1 : 0,
    pointerEvents: open ? 'auto' : 'none',
    transition: 'opacity 0.2s ease',
    zIndex: 40,
  };

  const drawer: CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    bottom: 0,
    width: 280,
    background: C.cardBg,
    boxShadow: '4px 0 24px rgba(0,0,0,0.25)',
    transform: open ? 'translateX(0)' : 'translateX(-100%)',
    transition: 'transform 0.22s ease',
    zIndex: 41,
    display: 'flex',
    flexDirection: 'column',
    padding: '24px 0',
  };

  const header: CSSProperties = {
    padding: '0 24px 16px',
    borderBottom: `1px solid ${C.lineColor}`,
    marginBottom: 12,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  };

  const closeBtn: CSSProperties = {
    background: 'transparent',
    border: 'none',
    color: C.textSecondary,
    fontSize: 22,
    lineHeight: 1,
    cursor: 'pointer',
    padding: 4,
  };

  const itemStyle = (h: string, disabled: boolean, active: boolean): CSSProperties => ({
    display: 'block',
    width: '100%',
    textAlign: 'left',
    padding: '12px 24px',
    fontFamily: mono,
    fontSize: 12,
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    color: disabled ? C.textSecondary : active ? C.darkPink : C.textPrimary,
    background: hover === h && !disabled ? C.headerBg : 'transparent',
    border: 'none',
    borderLeft: `3px solid ${active ? C.darkPink : 'transparent'}`,
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.55 : 1,
    transition: 'background 0.15s ease, color 0.15s ease',
  });

  const logoutBtn: CSSProperties = {
    margin: '12px 24px 0',
    padding: '12px 16px',
    background: 'transparent',
    color: C.darkPink,
    border: `1.5px solid ${C.darkPink}`,
    borderRadius: 6,
    fontFamily: mono,
    fontSize: 12,
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    cursor: loggingOut ? 'not-allowed' : 'pointer',
    opacity: loggingOut ? 0.6 : 1,
  };

  return (
    <>
      <div style={backdrop} onClick={onClose} aria-hidden={!open} />
      <aside
        id="side-menu"
        style={drawer}
        role="dialog"
        aria-modal="true"
        aria-label="navigation menu"
        aria-hidden={!open}
      >
        <div style={header}>
          <div style={{ ...T.tinyLabel(), color: C.darkPink }}>menu</div>
          <button type="button" style={closeBtn} onClick={onClose} aria-label="close menu">
            ×
          </button>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column' }}>
          {ITEMS.map((it) => {
            const active = pathname === it.href;
            return (
              <button
                key={it.href}
                type="button"
                onClick={() => !it.disabled && navigate(it.href)}
                onMouseEnter={() => setHover(it.href)}
                onMouseLeave={() => setHover(null)}
                disabled={it.disabled}
                style={itemStyle(it.href, !!it.disabled, active)}
              >
                {it.label}
                {it.disabled ? (
                  <span
                    style={{
                      marginLeft: 8,
                      fontSize: 9,
                      letterSpacing: '0.18em',
                      color: C.textSecondary,
                      opacity: 0.7,
                    }}
                  >
                    soon
                  </span>
                ) : null}
              </button>
            );
          })}
        </nav>

        <div style={{ marginTop: 'auto', paddingBottom: 8 }}>
          <button
            type="button"
            onClick={onLogout}
            disabled={loggingOut}
            style={logoutBtn}
          >
            {loggingOut ? 'logging out…' : 'log out'}
          </button>
        </div>
      </aside>
    </>
  );
}
