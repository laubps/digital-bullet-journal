'use client';

import { useEditor, EditorContent, type Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import type { CSSProperties } from 'react';
import { C, mono } from '@/lib/ui/theme';

type Props = {
  initialContent?: string;
  minHeight?: number;
  onChange?: (html: string) => void;
  /** Background color of the toolbar strip. Defaults to theme headerBg (pink). */
  toolbarBg?: string;
};

function ToolbarBtn({
  editor,
  cmd,
  label,
  isActive,
}: {
  editor: Editor;
  cmd: () => void;
  label: string;
  isActive?: boolean;
}) {
  const style: CSSProperties = {
    fontFamily: mono,
    fontSize: 10,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    padding: '4px 8px',
    border: `1px solid ${C.lineColor}`,
    borderRadius: 3,
    background: isActive ? C.darkPink : 'transparent',
    color: isActive ? '#fff' : C.textPrimary,
    cursor: 'pointer',
    transition: 'background 0.15s ease, color 0.15s ease',
  };
  void editor; // silence unused
  return (
    <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={cmd} style={style}>
      {label}
    </button>
  );
}

export default function RichTextEditor({
  initialContent = '',
  minHeight = 280,
  onChange,
  toolbarBg = C.headerBg,
}: Props) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: initialContent,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: 'petal-editor',
        style: `min-height:${minHeight}px;outline:none;padding:18px 22px;font-family:'Times New Roman',Georgia,serif;font-size:15px;line-height:1.7;color:${C.textPrimary};`,
      },
    },
    onUpdate: ({ editor: e }) => onChange?.(e.getHTML()),
  });

  if (!editor) return null;

  const toolbar: CSSProperties = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 6,
    padding: '8px 10px',
    borderBottom: `1px solid ${C.lineColor}`,
    background: toolbarBg,
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={toolbar}>
        <ToolbarBtn
          editor={editor}
          cmd={() => editor.chain().focus().toggleBold().run()}
          label="B"
          isActive={editor.isActive('bold')}
        />
        <ToolbarBtn
          editor={editor}
          cmd={() => editor.chain().focus().toggleItalic().run()}
          label="I"
          isActive={editor.isActive('italic')}
        />
        <ToolbarBtn
          editor={editor}
          cmd={() => editor.chain().focus().toggleStrike().run()}
          label="S"
          isActive={editor.isActive('strike')}
        />
        <ToolbarBtn
          editor={editor}
          cmd={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          label="H2"
          isActive={editor.isActive('heading', { level: 2 })}
        />
        <ToolbarBtn
          editor={editor}
          cmd={() => editor.chain().focus().toggleBulletList().run()}
          label="• List"
          isActive={editor.isActive('bulletList')}
        />
        <ToolbarBtn
          editor={editor}
          cmd={() => editor.chain().focus().toggleOrderedList().run()}
          label="1. List"
          isActive={editor.isActive('orderedList')}
        />
        <ToolbarBtn
          editor={editor}
          cmd={() => editor.chain().focus().toggleBlockquote().run()}
          label="Quote"
          isActive={editor.isActive('blockquote')}
        />
        <ToolbarBtn
          editor={editor}
          cmd={() => editor.chain().focus().setHorizontalRule().run()}
          label="—"
        />
        <div style={{ marginLeft: 'auto' }}>
          <ToolbarBtn
            editor={editor}
            cmd={() => {
              const md = window.prompt('Paste markdown / text:');
              if (md) editor.chain().focus().insertContent(md).run();
            }}
            label="Copy from .md"
          />
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', background: C.cardBg }}>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
