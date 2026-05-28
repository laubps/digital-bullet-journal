import type { CSSProperties } from 'react';

export const C = {
  pink: '#f192b5',
  darkPink: '#831633',
  cardBg: '#ffffff',
  headerBg: '#ecd0dc',
  btnColor: '#e8a9c6',
  btnHover: '#d48aab',
  lineColor: '#2a1f24',
  outerCard: '#969753',
  bodyBg: '#252122',
  textPrimary: '#2a1f24',
  textSecondary: '#8a7068',
  textSubtle: 'rgba(131,22,51,0.2)',
  inputBorderDefault: 'rgba(42,31,36,0.25)',
  inputBorderFocus: '#2a1f24',
  overlayBg: 'rgba(20,18,18,0.55)',
  laceDot: 'rgba(232,169,198,0.1)',
  paperBg: '#fbf6ee',
  paperShadow: 'rgba(42,31,36,0.35)',
  placeholderBg: '#f3f4f6',
  placeholderBorder: '#cbd5d1',
  placeholderText: '#9ca3af',
  placeholderLine: '#d1d5db',
} as const;

export const serif = "'Times New Roman', 'Georgia', serif";
export const mono = "var(--font-space-mono), 'Space Mono', monospace";
export const script = "var(--font-dancing-script), 'Dancing Script', cursive";

/**
 * Canonical typography tokens for the whole app.
 * Use these instead of hand-rolling fontFamily/size/spacing.
 * Rule: titles are never italic; small phrases under a title are italic.
 */
export const T = {
  /** Brand/page title in serif uppercase dark pink (Login "Petal", dashboard header). */
  brandTitle: (size = 52): CSSProperties => ({
    fontFamily: serif,
    fontSize: size,
    fontWeight: 400,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: C.darkPink,
    textShadow: '1px 2px 0 rgba(131,22,51,0.12)',
    lineHeight: 1,
  }),

  /** Section subtitle ("how you feeling today", "habits give us…", "better write it down"). */
  sectionTitle: (): CSSProperties => ({
    fontFamily: serif,
    fontSize: 22,
    fontWeight: 400,
    color: C.textPrimary,
    letterSpacing: '0.01em',
    lineHeight: 1.2,
  }),

  /** Italic serif phrase under a subtitle or a divider label. */
  sectionPhrase: (color: string = C.textSecondary): CSSProperties => ({
    fontFamily: serif,
    fontSize: 14,
    fontStyle: 'italic',
    color,
    lineHeight: 1.3,
  }),

  /** Big italic quote (Login left panel). */
  quote: (): CSSProperties => ({
    fontFamily: serif,
    fontSize: 28,
    fontStyle: 'italic',
    color: C.textPrimary,
    lineHeight: 1.5,
  }),

  /** Form / button label in mono uppercase. */
  label: (): CSSProperties => ({
    fontFamily: mono,
    fontSize: 10,
    fontWeight: 500,
    letterSpacing: '0.2em',
    textTransform: 'uppercase',
    color: C.textSecondary,
  }),

  /** Tiny tag, e.g. "JOURNAL ENTRY" caption, vertical side text. */
  tinyLabel: (): CSSProperties => ({
    fontFamily: mono,
    fontSize: 9,
    letterSpacing: '0.22em',
    textTransform: 'uppercase',
    color: C.textSecondary,
  }),

  /** Mono input text. */
  bodyMono: (): CSSProperties => ({
    fontFamily: mono,
    fontSize: 14,
    color: C.textPrimary,
    letterSpacing: '0.02em',
  }),

  /** Serif body text (journal-like). */
  bodySerif: (): CSSProperties => ({
    fontFamily: serif,
    fontSize: 15,
    color: C.textPrimary,
    lineHeight: 1.7,
  }),

  /** Button text. */
  button: (): CSSProperties => ({
    fontFamily: mono,
    fontSize: 12,
    fontWeight: 500,
    letterSpacing: '0.16em',
    textTransform: 'uppercase',
  }),
};
