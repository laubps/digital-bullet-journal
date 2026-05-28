'use client';

import { useEffect, useState, type CSSProperties } from 'react';
import { C, T, mono } from '@/lib/ui/theme';
import PaperSheet from './PaperSheet';
import RichTextEditor from './RichTextEditor';

function todayLocalIso(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function hasVisibleText(html: string): boolean {
  return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/gi, ' ').trim().length > 0;
}

type Category = { id: string; name: string };

export default function JournalWidget() {
  const [btnHover, setBtnHover] = useState<'add' | 'date' | null>(null);
  const [html, setHtml] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [editorKey, setEditorKey] = useState(0);
  const [dateModalOpen, setDateModalOpen] = useState(false);
  const [modalDate, setModalDate] = useState(todayLocalIso());
  const [categoryId, setCategoryId] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch('/api/categories');
        if (!res.ok) return;
        const data = (await res.json()) as { categories?: Category[] };
        if (alive && Array.isArray(data.categories)) setCategories(data.categories);
      } catch {
        // optional field; ignore
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (!successMsg) return;
    const t = setTimeout(() => setSuccessMsg(null), 3500);
    return () => clearTimeout(t);
  }, [successMsg]);

  useEffect(() => {
    if (!dateModalOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setDateModalOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [dateModalOpen]);

  const submitEntry = async (entryDate: string) => {
    if (submitting) return;
    if (!hasVisibleText(html)) {
      setErrorMsg('write something before saving');
      setDateModalOpen(false);
      return;
    }
    setSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const res = await fetch('/api/journal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entryDate,
          content: html,
          categoryId: categoryId || null,
        }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setErrorMsg(data.error || 'could not save entry');
        setSubmitting(false);
        return;
      }
      setSuccessMsg('entry saved');
      setHtml('');
      setCategoryId('');
      setEditorKey((k) => k + 1);
      setSubmitting(false);
      setDateModalOpen(false);
    } catch {
      setErrorMsg('network error, try again');
      setSubmitting(false);
    }
  };

  const onOpenDateModal = () => {
    setModalDate(todayLocalIso());
    setDateModalOpen(true);
  };

  const outlineBtn = (key: 'add' | 'date'): CSSProperties => ({
    ...T.button(),
    fontSize: 11,
    padding: '8px 16px',
    border: `1.5px solid ${C.lineColor}`,
    borderRadius: 6,
    background: btnHover === key ? C.btnColor : 'transparent',
    color: btnHover === key ? '#fff' : C.textPrimary,
    cursor: submitting ? 'not-allowed' : 'pointer',
    opacity: submitting ? 0.6 : 1,
    transition: 'background 0.18s ease, color 0.18s ease',
  });

  const filledBtn = (key: 'add' | 'date'): CSSProperties => ({
    ...T.button(),
    fontSize: 11,
    padding: '8px 16px',
    border: 'none',
    borderRadius: 6,
    background: submitting ? C.btnColor : btnHover === key ? C.btnHover : C.btnColor,
    color: '#fff',
    cursor: submitting ? 'not-allowed' : 'pointer',
    opacity: submitting ? 0.7 : 1,
    transition: 'background 0.18s ease',
  });

  const banner = (kind: 'success' | 'error', text: string): CSSProperties => ({
    marginBottom: 16,
    padding: '8px 12px',
    borderRadius: 6,
    border: `1px solid ${kind === 'success' ? C.success : C.danger}`,
    background: kind === 'success' ? C.successBg : C.dangerBg,
    color: kind === 'success' ? C.success : C.danger,
    fontFamily: mono,
    fontSize: 11,
    letterSpacing: '0.06em',
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ ...T.tinyLabel(), marginBottom: 4 }}>Journal entry</div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <div style={T.sectionTitle()}>better write it down</div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            type="button"
            onClick={() => submitEntry(todayLocalIso())}
            onMouseEnter={() => setBtnHover('add')}
            onMouseLeave={() => setBtnHover(null)}
            style={filledBtn('add')}
            disabled={submitting}
            aria-busy={submitting}
          >
            {submitting ? 'Saving…' : 'Add entry'}
          </button>
          <button
            type="button"
            onClick={onOpenDateModal}
            onMouseEnter={() => setBtnHover('date')}
            onMouseLeave={() => setBtnHover(null)}
            style={outlineBtn('date')}
            disabled={submitting}
          >
            To other date
          </button>
        </div>
      </div>
      <div style={{ ...T.sectionPhrase(), marginTop: 4, marginBottom: 16 }}>
        ink keeps what memory loses.
      </div>

      {errorMsg ? (
        <div role="alert" style={banner('error', errorMsg)}>
          ✕ {errorMsg}
        </div>
      ) : null}
      {successMsg ? (
        <div role="status" aria-live="polite" style={banner('success', successMsg)}>
          ✓ {successMsg}
        </div>
      ) : null}

      <div style={{ marginBottom: 16 }}>
        <label
          htmlFor="jw-category"
          style={{
            ...T.tinyLabel(),
            color: C.textSecondary,
            display: 'block',
            marginBottom: 6,
          }}
        >
          Category (optional)
        </label>
        <select
          id="jw-category"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          disabled={submitting}
          style={{
            width: '100%',
            height: 34,
            border: `1.5px solid ${C.inputBorderDefault}`,
            background: 'transparent',
            outline: 'none',
            fontFamily: mono,
            fontSize: 12,
            color: C.textPrimary,
            padding: '0 10px',
            borderRadius: 6,
            cursor: submitting ? 'not-allowed' : 'pointer',
          }}
        >
          <option value="">— none —</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <PaperSheet style={{ flex: 1, minHeight: 320 }}>
        <RichTextEditor key={editorKey} minHeight={280} onChange={setHtml} />
      </PaperSheet>

      {dateModalOpen ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Pick a date for this entry"
          style={{
            position: 'fixed',
            inset: 0,
            background: C.overlayBg,
            zIndex: 60,
            display: 'flex',
            alignItems: 'safe center',
            justifyContent: 'safe center',
            padding: 24,
          }}
          onClick={() => !submitting && setDateModalOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: C.cardBg,
              borderRadius: 10,
              padding: 24,
              width: '100%',
              maxWidth: 360,
              boxShadow: '0 16px 40px rgba(0,0,0,0.35)',
              display: 'flex',
              flexDirection: 'column',
              gap: 14,
            }}
          >
            <div style={{ ...T.tinyLabel(), color: C.darkPink }}>save entry for…</div>
            <label
              htmlFor="j-modal-date"
              style={{
                fontFamily: mono,
                fontSize: 10,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: C.textSecondary,
              }}
            >
              Date
            </label>
            <input
              id="j-modal-date"
              type="date"
              value={modalDate}
              max={todayLocalIso()}
              onChange={(e) => setModalDate(e.target.value)}
              disabled={submitting}
              autoFocus
              style={{
                height: 40,
                border: `1.5px solid ${C.inputBorderDefault}`,
                background: 'transparent',
                outline: 'none',
                fontFamily: mono,
                fontSize: 14,
                color: C.textPrimary,
                padding: '0 10px',
                borderRadius: 6,
              }}
            />

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
              <button
                type="button"
                onClick={() => setDateModalOpen(false)}
                disabled={submitting}
                style={{
                  ...outlineBtn('date'),
                  padding: '8px 14px',
                  fontSize: 11,
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => submitEntry(modalDate)}
                disabled={submitting}
                aria-busy={submitting}
                style={{
                  ...filledBtn('add'),
                  padding: '8px 14px',
                  fontSize: 11,
                }}
              >
                {submitting ? 'Saving…' : 'Save entry'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
