'use client';

import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { useRouter } from 'next/navigation';
import { C, T, mono } from '@/lib/ui/theme';
import PageShell from '@/lib/ui/PageShell';
import Loading from '@/components/Loading';
import ErrorState from '@/components/ErrorState';
import PageBackground from '@/components/PageBackground';
import Card from '@/lib/ui/Card';
import HabitCheckinGrid, { type Checkin } from '@/components/habits/HabitCheckinGrid';
import { currentRound, todayLocalIso } from '@/lib/habits/days';

type Category = { id: string; name: string };

type HabitListItem = {
  id: string;
  name: string;
  targetDays: number;
  isActive: boolean;
  categoryId: string | null;
  categoryName: string | null;
  createdAt: string;
  startDate: string;
};

type HabitWithCheckins = HabitListItem & { checkins: Checkin[] };

type FilterKey = 'active' | 'date' | 'category';

export default function HabitsListPage() {
  const router = useRouter();
  const today = todayLocalIso();

  const [openFilter, setOpenFilter] = useState<FilterKey | null>(null);
  const [activeOnly, setActiveOnly] = useState(true);
  const [from, setFrom] = useState('');
  const [categoryId, setCategoryId] = useState('');

  const [categories, setCategories] = useState<Category[]>([]);
  const [habits, setHabits] = useState<HabitWithCheckins[]>([]);
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
        // optional
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
        if (!activeOnly) params.set('active', 'false');
        if (from) params.set('from', from);
        if (categoryId) params.set('categoryId', categoryId);
        const qs = params.toString();
        const res = await fetch(`/api/habits${qs ? `?${qs}` : ''}`);
        const data = (await res.json().catch(() => ({}))) as {
          habits?: HabitListItem[];
          error?: string;
        };
        if (!alive) return;
        if (!res.ok) {
          if (initialLoad) setHasFatalError(true);
          else {
            setErrorMsg(data.error || 'could not load habits');
            setHabits([]);
          }
          return;
        }
        const list = data.habits ?? [];
        // Fetch checkins for each habit in parallel so the row strips render.
        const enriched = await Promise.all(
          list.map(async (h) => {
            try {
              const r = await fetch(`/api/habits/${h.id}`);
              if (!r.ok) return { ...h, checkins: [] };
              const d = (await r.json()) as { habit?: HabitWithCheckins };
              return { ...h, checkins: d.habit?.checkins ?? [] };
            } catch {
              return { ...h, checkins: [] };
            }
          }),
        );
        if (!alive) return;
        setHabits(enriched);
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
  }, [activeOnly, from, categoryId, reloadKey]);

  const retry = () => {
    setHasFatalError(false);
    setInitialLoad(true);
    setReloadKey((k) => k + 1);
  };

  const activeCount = useMemo(() => {
    let n = 0;
    if (!activeOnly) n++; // showing "all" counts as an applied non-default
    if (from) n++;
    if (categoryId) n++;
    return n;
  }, [activeOnly, from, categoryId]);

  const clearAll = () => {
    setActiveOnly(true);
    setFrom('');
    setCategoryId('');
    setOpenFilter(null);
  };

  const toggle = (k: FilterKey) => setOpenFilter((prev) => (prev === k ? null : k));

  // ---------- styles ----------
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

  // ---------- loading / error gates ----------
  if (initialLoad) {
    return (
      <PageShell title="habit tracker" subtitle="Your habits">
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
    <PageShell title="habit tracker" subtitle="Your habits" maxWidth={1080}>
      <div
        style={{
          display: 'flex',
          gap: 10,
          flexWrap: 'wrap',
          alignItems: 'center',
          marginBottom: 4,
        }}
      >
        <button type="button" style={pill(!activeOnly, openFilter === 'active')} onClick={() => toggle('active')}>
          {activeOnly ? 'Active only' : 'Showing all'}
        </button>
        <button type="button" style={pill(Boolean(from), openFilter === 'date')} onClick={() => toggle('date')}>
          Start date
        </button>
        <button type="button" style={pill(Boolean(categoryId), openFilter === 'category')} onClick={() => toggle('category')}>
          Category
        </button>
        <button type="button" style={clearBtn} onClick={clearAll} disabled={!activeCount}>
          Clear filters{activeCount ? ` (${activeCount})` : ''}
        </button>
        <button
          type="button"
          style={{ ...addBtn, marginLeft: 'auto' }}
          onClick={() => router.push('/habits/new')}
          onMouseEnter={(e) => (e.currentTarget.style.background = C.btnHover)}
          onMouseLeave={(e) => (e.currentTarget.style.background = C.btnColor)}
        >
          + Add new habit
        </button>
      </div>

      {openFilter === 'active' ? (
        <div style={filterPanel}>
          <span style={fieldLabel}>Show</span>
          <label style={{ ...fieldLabel, color: C.textPrimary }}>
            <input
              type="radio"
              checked={activeOnly}
              onChange={() => setActiveOnly(true)}
              style={{ marginRight: 6 }}
            />
            Active only
          </label>
          <label style={{ ...fieldLabel, color: C.textPrimary }}>
            <input
              type="radio"
              checked={!activeOnly}
              onChange={() => setActiveOnly(false)}
              style={{ marginRight: 6 }}
            />
            All habits
          </label>
        </div>
      ) : null}

      {openFilter === 'date' ? (
        <div style={filterPanel}>
          <span style={fieldLabel}>Started on or after</span>
          <input type="date" value={from} max={today} onChange={(e) => setFrom(e.target.value)} style={inputStyle} />
        </div>
      ) : null}

      {openFilter === 'category' ? (
        <div style={filterPanel}>
          <span style={fieldLabel}>Category</span>
          <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} style={{ ...inputStyle, minWidth: 220 }}>
            <option value="">— all —</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
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

        <div style={{ ...T.tinyLabel(), color: C.textSecondary, marginBottom: 8 }}>
          {loading ? 'loading…' : `${habits.length} ${habits.length === 1 ? 'habit' : 'habits'}`}
        </div>

        {!loading && habits.length === 0 ? (
          <div style={{ ...T.sectionPhrase(), padding: '28px 8px', textAlign: 'center' }}>
            no habits match these filters yet.
          </div>
        ) : null}

        {habits.map((h) => {
          const round = currentRound(h.startDate, today);
          const goDetails = () => router.push(`/habits/${h.id}`);
          return (
            <div
              key={h.id}
              style={{
                padding: '16px 4px',
                borderBottom: `1px solid ${C.inputBorderDefault}`,
              }}
            >
              <div
                role="button"
                tabIndex={0}
                onClick={goDetails}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    goDetails();
                  }
                }}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 90px 110px 70px 140px',
                  gap: 16,
                  alignItems: 'center',
                  cursor: 'pointer',
                  padding: '4px 0',
                }}
              >
                <span style={{ fontFamily: mono, fontSize: 14, color: C.darkPink, fontWeight: 600 }}>
                  {h.name}
                </span>
                <span style={{ fontFamily: mono, fontSize: 12, color: C.textSecondary }}>
                  {h.targetDays} days
                </span>
                <span style={{ fontFamily: mono, fontSize: 12, color: C.textSecondary }}>
                  {h.startDate}
                </span>
                <span style={{ fontFamily: mono, fontSize: 12, color: C.textSecondary }}>
                  R{round}
                </span>
                <span style={{ fontFamily: mono, fontSize: 12, color: h.categoryName ? C.textPrimary : C.textSecondary, opacity: h.categoryName ? 1 : 0.6 }}>
                  {h.categoryName ?? '—'}
                </span>
              </div>
              <div style={{ marginTop: 10 }}>
                <HabitCheckinGrid
                  startDate={h.startDate}
                  targetDays={h.targetDays}
                  checkins={h.checkins}
                  cols={22}
                  cellSize={22}
                  maxCells={66}
                  truncateLink={{ href: `/habits/${h.id}` }}
                  fillWidth
                />
              </div>
            </div>
          );
        })}
      </div>
    </PageShell>
  );
}
