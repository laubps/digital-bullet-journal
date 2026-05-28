'use client';

import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { useRouter } from 'next/navigation';
import { C, T, mono } from '@/lib/ui/theme';
import PageShell from '@/lib/ui/PageShell';
import Loading from '@/components/Loading';
import ErrorState from '@/components/ErrorState';
import PageBackground from '@/components/PageBackground';
import Card from '@/lib/ui/Card';

type Category = { id: string; name: string };

type Entry = {
  id: string;
  entryDate: string;
  createdAt: string;
  categoryId: string | null;
  categoryName: string | null;
  content: string;
};

type FilterKey = 'date' | 'category';

/** Strip HTML and collapse whitespace for a one-line preview. */
function plainPreview(html: string, max = 180): string {
  const text = html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return text.length > max ? `${text.slice(0, max)}…` : text;
}

export default function JournalDashboardPage() {
  const router = useRouter();
  const [openFilter, setOpenFilter] = useState<FilterKey | null>(null);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [categoryId, setCategoryId] = useState('');

  const [categories, setCategories] = useState<Category[]>([]);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [hasFatalError, setHasFatalError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/categories');
        if (!res.ok) return;
        const data = (await res.json()) as { categories?: Category[] };
        if (Array.isArray(data.categories)) setCategories(data.categories);
      } catch {
        // optional; ignore
      }
    })();
  }, []);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      setErrorMsg(null);
      try {
        const params = new URLSearchParams();
        if (from) params.set('from', from);
        if (to) params.set('to', to);
        if (categoryId) params.set('categoryId', categoryId);
        const qs = params.toString();
        const res = await fetch(`/api/journal/history${qs ? `?${qs}` : ''}`);
        const data = (await res.json().catch(() => ({}))) as {
          entries?: Entry[];
          error?: string;
        };
        if (!alive) return;
        if (!res.ok) {
          if (initialLoad) setHasFatalError(true);
          else {
            setErrorMsg(data.error || 'could not load entries');
            setEntries([]);
          }
        } else {
          setEntries(data.entries ?? []);
        }
      } catch {
        if (!alive) return;
        if (initialLoad) setHasFatalError(true);
        else setErrorMsg('network error, try again');
      } finally {
        if (alive) {
          setLoading(false);
          setInitialLoad(false);
        }
      }
    })();
    return () => {
      alive = false;
    };
  }, [from, to, categoryId, reloadKey]);

  const retry = () => {
    setHasFatalError(false);
    setInitialLoad(true);
    setReloadKey((k) => k + 1);
  };

  const activeCount = useMemo(() => {
    let n = 0;
    if (from || to) n++;
    if (categoryId) n++;
    return n;
  }, [from, to, categoryId]);

  const clearAll = () => {
    setFrom('');
    setTo('');
    setCategoryId('');
    setOpenFilter(null);
  };

  const toggle = (k: FilterKey) => setOpenFilter((prev) => (prev === k ? null : k));

  const pill = (active: boolean, open: boolean): CSSProperties => ({
    padding: '8px 16px',
    border: `1.5px solid ${active || open ? C.darkPink : C.lineColor}`,
    background: open ? C.darkPink : active ? C.headerBg : 'transparent',
    color: open ? '#fff' : active ? C.darkPink : C.textPrimary,
    borderRadius: 999,
    fontFamily: mono,
    fontSize: 11,
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  });

  const clearBtn: CSSProperties = {
    padding: '8px 14px',
    border: 'none',
    background: 'transparent',
    color: activeCount ? C.darkPink : C.textSecondary,
    fontFamily: mono,
    fontSize: 11,
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    cursor: activeCount ? 'pointer' : 'not-allowed',
    opacity: activeCount ? 1 : 0.5,
    textDecoration: activeCount ? 'underline' : 'none',
  };

  const inputStyle: CSSProperties = {
    height: 36,
    border: `1.5px solid ${C.inputBorderDefault}`,
    background: 'transparent',
    outline: 'none',
    fontFamily: mono,
    fontSize: 13,
    color: C.textPrimary,
    padding: '0 10px',
    borderRadius: 6,
    boxSizing: 'border-box',
  };

  const filterPanel: CSSProperties = {
    marginTop: 12,
    padding: 14,
    border: `1px dashed ${C.inputBorderDefault}`,
    borderRadius: 8,
    background: 'rgba(236,208,220,0.18)',
    display: 'flex',
    gap: 12,
    flexWrap: 'wrap',
    alignItems: 'center',
  };

  const fieldLabel: CSSProperties = {
    ...T.tinyLabel(),
    color: C.textSecondary,
    marginRight: 6,
  };

  const card: CSSProperties = {
    display: 'grid',
    gridTemplateColumns: '120px 1fr 140px',
    gap: 18,
    alignItems: 'start',
    padding: '16px 4px',
    borderBottom: `1px solid ${C.inputBorderDefault}`,
    fontFamily: mono,
    fontSize: 13,
    color: C.textPrimary,
  };

  const datePill = (d: string): string => {
    const [y, m, day] = d.split('-');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${day} ${months[parseInt(m, 10) - 1]} ${y}`;
  };

  const addBtn: CSSProperties = {
    padding: '10px 18px',
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

  if (initialLoad) {
    return (
      <PageShell title="journal" subtitle="Your past entries">
        <Loading minHeight={420} />
      </PageShell>
    );
  }

  if (hasFatalError) {
    return (
      <main
        style={{
          position: 'relative',
          minHeight: '100vh',
          width: '100%',
          padding: '32px 24px',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'safe center',
          justifyContent: 'safe center',
        }}
      >
        <PageBackground />
        <Card maxWidth={560}>
          <ErrorState onRetry={retry} minHeight={240} />
        </Card>
      </main>
    );
  }

  return (
    <PageShell title="journal" subtitle="Your past entries">
      <div
        style={{
          display: 'flex',
          gap: 10,
          flexWrap: 'wrap',
          alignItems: 'center',
          marginBottom: 4,
        }}
      >
        <button type="button" style={pill(Boolean(from || to), openFilter === 'date')} onClick={() => toggle('date')}>
          Date
        </button>
        <button
          type="button"
          style={pill(Boolean(categoryId), openFilter === 'category')}
          onClick={() => toggle('category')}
        >
          Category
        </button>
        <button type="button" style={clearBtn} onClick={clearAll} disabled={!activeCount}>
          Clear filters{activeCount ? ` (${activeCount})` : ''}
        </button>
        <button
          type="button"
          style={{ ...addBtn, marginLeft: 'auto' }}
          onClick={() => router.push('/journal')}
          onMouseEnter={(e) => (e.currentTarget.style.background = C.btnHover)}
          onMouseLeave={(e) => (e.currentTarget.style.background = C.btnColor)}
        >
          + Add new entry
        </button>
      </div>

      {openFilter === 'date' ? (
        <div style={filterPanel}>
          <span style={fieldLabel}>From</span>
          <input type="date" value={from} max={to || undefined} onChange={(e) => setFrom(e.target.value)} style={inputStyle} />
          <span style={fieldLabel}>To</span>
          <input type="date" value={to} min={from || undefined} onChange={(e) => setTo(e.target.value)} style={inputStyle} />
        </div>
      ) : null}

      {openFilter === 'category' ? (
        <div style={filterPanel}>
          <span style={fieldLabel}>Category</span>
          <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} style={{ ...inputStyle, minWidth: 220 }}>
            <option value="">— all —</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      ) : null}

      <div style={{ marginTop: 28 }}>
        {errorMsg ? (
          <div
            role="alert"
            style={{
              padding: '10px 14px',
              borderRadius: 6,
              border: `1px solid ${C.danger}`,
              background: C.dangerBg,
              color: C.danger,
              fontFamily: mono,
              fontSize: 12,
              marginBottom: 12,
            }}
          >
            ✕ {errorMsg}
          </div>
        ) : null}

        <div
          style={{
            ...T.tinyLabel(),
            color: C.textSecondary,
            marginBottom: 8,
          }}
        >
          {loading ? 'loading…' : `${entries.length} ${entries.length === 1 ? 'entry' : 'entries'}`}
        </div>

        {!loading && entries.length === 0 ? (
          <div style={{ ...T.sectionPhrase(), padding: '28px 8px', textAlign: 'center' }}>
            no entries match these filters yet.
          </div>
        ) : null}

        {entries.length > 0 ? (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '120px 1fr 140px',
              gap: 18,
              padding: '8px 4px',
              borderBottom: `1.5px solid ${C.lineColor}`,
              ...T.tinyLabel(),
              color: C.textSecondary,
            }}
          >
            <span>Date</span>
            <span>Entry</span>
            <span style={{ textAlign: 'right' }}>Category</span>
          </div>
        ) : null}

        {entries.map((e) => (
          <div key={e.id} style={card}>
            <span style={{ color: C.textSecondary }}>{datePill(e.entryDate)}</span>
            <span style={{ color: C.textPrimary, lineHeight: 1.6 }}>
              {plainPreview(e.content) || <em style={{ color: C.textSecondary }}>(empty)</em>}
            </span>
            <span style={{ color: e.categoryName ? C.textPrimary : C.textSecondary, opacity: e.categoryName ? 1 : 0.6, textAlign: 'right' }}>
              {e.categoryName ?? '—'}
            </span>
          </div>
        ))}
      </div>
    </PageShell>
  );
}
