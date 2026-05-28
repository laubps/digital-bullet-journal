'use client';

import type { CSSProperties } from 'react';
import { useRouter } from 'next/navigation';
import { C, mono } from '@/lib/ui/theme';
import { dateForDayOffset, todayLocalIso } from '@/lib/habits/days';

export type Checkin = { checkDate: string; done: boolean };

type Props = {
  /** YYYY-MM-DD of day 1. */
  startDate: string;
  /** Total days the habit lasts. */
  targetDays: number;
  /** Existing check-ins (any subset of dates). */
  checkins: Checkin[];
  /** Optional click handler. If omitted, the grid is read-only. */
  onToggle?: (dayIndex: number, date: string, currentDone: boolean) => void;
  /** Squares per row. */
  cols?: number;
  /** Pixel size of each square. */
  cellSize?: number;
  /** Show the day number (1-based) inside the cell. */
  showDayNumber?: boolean;
  /** First day-index (0-based) to render. Used for "current round" views. */
  dayOffset?: number;
  /** Max number of cells to render (counting from dayOffset). */
  maxCells?: number;
  /** When true and target_days exceeds the rendered slice, show "..." + a Ver más link. */
  truncateLink?: { href: string };
  /** When true, cells expand to fill the parent width (cols use 1fr, cells become square). */
  fillWidth?: boolean;
};

export default function HabitCheckinGrid({
  startDate,
  targetDays,
  checkins,
  onToggle,
  cols = 20,
  cellSize = 22,
  showDayNumber = true,
  dayOffset = 0,
  maxCells,
  truncateLink,
  fillWidth = false,
}: Props) {
  const router = useRouter();
  const today = todayLocalIso();

  const remaining = targetDays - dayOffset;
  const visibleCount = maxCells !== undefined ? Math.min(maxCells, remaining) : remaining;
  const hasMore = remaining > visibleCount;

  const doneByDate = new Map<string, boolean>();
  for (const c of checkins) doneByDate.set(c.checkDate, c.done);

  const wrap: CSSProperties = {
    display: 'grid',
    gridTemplateColumns: `repeat(${cols}, ${cellSize}px)`,
    gap: 4,
    alignItems: 'center',
  };

  const baseCell: CSSProperties = {
    width: cellSize,
    height: cellSize,
    border: `1px solid ${C.lineColor}`,
    borderRadius: 3,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: mono,
    fontSize: Math.max(8, Math.floor(cellSize * 0.42)),
    lineHeight: 1,
    background: 'transparent',
    color: C.textPrimary,
    padding: 0,
  };

  return (
    <div
      style={
        fillWidth
          ? { display: 'flex', flexDirection: 'column', alignItems: 'stretch', gap: 8, width: '100%' }
          : { display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8 }
      }
    >
      <div style={wrap}>
        {Array.from({ length: visibleCount }).map((_, i) => {
          const dayIndex = dayOffset + i; // 0-based
          const dayNumber = dayIndex + 1; // 1-based label
          const date = dateForDayOffset(startDate, dayIndex);
          const isFuture = date > today;
          const isBeforeStart = date < startDate;
          const done = doneByDate.get(date) === true;
          const clickable = !!onToggle && !isFuture && !isBeforeStart;

          const style: CSSProperties = {
            ...baseCell,
            background: done ? C.darkPink : 'transparent',
            color: done ? '#fff' : isFuture ? C.textSecondary : C.textPrimary,
            opacity: isFuture ? 0.35 : 1,
            cursor: clickable ? 'pointer' : 'default',
          };

          const content = showDayNumber ? dayNumber : done ? '✓' : '';

          if (clickable) {
            return (
              <button
                key={dayIndex}
                type="button"
                onClick={() => onToggle?.(dayIndex, date, done)}
                title={`Day ${dayNumber} · ${date}`}
                style={style}
              >
                {content}
              </button>
            );
          }
          return (
            <div
              key={dayIndex}
              role="img"
              aria-label={`Day ${dayNumber} ${isFuture ? '(future)' : done ? '(done)' : '(not done)'}`}
              title={`Day ${dayNumber} · ${date}`}
              style={style}
            >
              {content}
            </div>
          );
        })}
      </div>

      {hasMore ? (
        <div
          style={
            fillWidth
              ? { display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'flex-end' }
              : { display: 'contents' }
          }
        >
          <span
            style={{
              fontFamily: mono,
              fontSize: 14,
              letterSpacing: '0.1em',
              color: C.textSecondary,
            }}
          >
            …
          </span>
          {truncateLink ? (
            <button
              type="button"
              onClick={() => router.push(truncateLink.href)}
              style={{
                fontFamily: mono,
                fontSize: 11,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: C.darkPink,
                background: 'transparent',
                border: 'none',
                borderBottom: `1px solid ${C.darkPink}`,
                cursor: 'pointer',
                padding: '2px 0',
              }}
            >
              Ver más →
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
