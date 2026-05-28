'use client';

import { useState, type CSSProperties } from 'react';
import { useRouter } from 'next/navigation';
import { C, T } from '@/lib/ui/theme';
import PaperSheet from './PaperSheet';
import RichTextEditor from './RichTextEditor';

export default function JournalWidget() {
  const router = useRouter();
  const [btnHover, setBtnHover] = useState<'add' | 'date' | null>(null);

  const btnStyle = (key: 'add' | 'date'): CSSProperties => ({
    ...T.button(),
    fontSize: 11,
    padding: '8px 16px',
    border: `1.5px solid ${C.lineColor}`,
    borderRadius: 6,
    background: btnHover === key ? C.btnColor : 'transparent',
    color: btnHover === key ? '#fff' : C.textPrimary,
    cursor: 'pointer',
    transition: 'background 0.18s ease, color 0.18s ease',
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ ...T.tinyLabel(), marginBottom: 4 }}>Journal entry</div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <div style={T.sectionTitle()}>better write it down</div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            type="button"
            onClick={() => router.push('/journal')}
            onMouseEnter={() => setBtnHover('add')}
            onMouseLeave={() => setBtnHover(null)}
            style={btnStyle('add')}
          >
            Add entry
          </button>
          <button
            type="button"
            onClick={() => router.push('/journal?date=other')}
            onMouseEnter={() => setBtnHover('date')}
            onMouseLeave={() => setBtnHover(null)}
            style={btnStyle('date')}
          >
            To other date
          </button>
        </div>
      </div>
      <div style={{ ...T.sectionPhrase(), marginTop: 4, marginBottom: 16 }}>
        ink keeps what memory loses.
      </div>

      <PaperSheet style={{ flex: 1, minHeight: 320 }}>
        <RichTextEditor minHeight={280} />
      </PaperSheet>
    </div>
  );
}
