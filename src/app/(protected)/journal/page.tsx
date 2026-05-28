'use client';

import { useState, type CSSProperties, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { C, mono } from '@/lib/ui/theme';
import PageShell from '@/lib/ui/PageShell';
import PaperSheet from '@/components/dashboard/PaperSheet';
import RichTextEditor from '@/components/dashboard/RichTextEditor';

export default function JournalPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [html, setHtml] = useState('');
  const [hover, setHover] = useState(false);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    console.warn('journal submit (UI only, wiring in step 7)', { title, date, html });
  };

  const label: CSSProperties = {
    fontFamily: mono,
    fontSize: 10,
    letterSpacing: '0.2em',
    textTransform: 'uppercase',
    color: C.textSecondary,
    display: 'block',
    marginBottom: 8,
  };

  const inputStyle: CSSProperties = {
    width: '100%',
    height: 40,
    border: 'none',
    borderBottom: `1.5px solid ${C.inputBorderDefault}`,
    background: 'transparent',
    outline: 'none',
    fontFamily: mono,
    fontSize: 14,
    color: C.textPrimary,
    padding: '0 0 6px 0',
  };

  const submitBtn: CSSProperties = {
    height: 44,
    padding: '0 28px',
    background: hover ? C.btnHover : C.btnColor,
    color: '#fff',
    border: 'none',
    borderRadius: 6,
    fontFamily: mono,
    fontSize: 12,
    letterSpacing: '0.16em',
    textTransform: 'uppercase',
    cursor: 'pointer',
    transition: 'background 0.18s ease',
  };

  const cancelBtn: CSSProperties = {
    height: 44,
    padding: '0 22px',
    background: 'transparent',
    color: C.textPrimary,
    border: `1.5px solid ${C.lineColor}`,
    borderRadius: 6,
    fontFamily: mono,
    fontSize: 12,
    letterSpacing: '0.16em',
    textTransform: 'uppercase',
    cursor: 'pointer',
  };

  return (
    <PageShell title="better write it down" subtitle="Journal entry" maxWidth={1080}>
      <form onSubmit={onSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 200px', gap: 24, marginBottom: 20 }}>
          <div>
            <label htmlFor="j-title" style={label}>Title (optional)</label>
            <input
              id="j-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="a name for this page…"
              style={inputStyle}
            />
          </div>
          <div>
            <label htmlFor="j-date" style={label}>Date</label>
            <input
              id="j-date"
              type="date"
              value={date}
              max={new Date().toISOString().slice(0, 10)}
              onChange={(e) => setDate(e.target.value)}
              style={inputStyle}
            />
          </div>
        </div>

        <div style={{ marginBottom: 24 }}>
          <span style={label}>Your entry</span>
          <PaperSheet style={{ minHeight: 420 }}>
            <RichTextEditor minHeight={360} onChange={setHtml} />
          </PaperSheet>
        </div>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
          <button type="button" onClick={() => router.push('/dashboard')} style={cancelBtn}>
            Cancel
          </button>
          <button
            type="submit"
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            style={submitBtn}
          >
            Save entry
          </button>
        </div>
      </form>
    </PageShell>
  );
}
