import { useEditorState, type Editor } from '@tiptap/react'
import { Bold, Italic, List, ListOrdered, Redo2, Undo2 } from 'lucide-react'
import type { ReactNode } from 'react'

type Props = {
  editor: Editor | null
}

export function EditorToolbar({ editor }: Props) {
  const active = useEditorState({
    editor,
    selector: ({ editor: ed }) => {
      if (!ed) {
        return {
          bold: false,
          italic: false,
          h2: false,
          h3: false,
          bullet: false,
          ordered: false,
          canUndo: false,
          canRedo: false,
        }
      }
      return {
        bold: ed.isActive('bold'),
        italic: ed.isActive('italic'),
        h2: ed.isActive('heading', { level: 2 }),
        h3: ed.isActive('heading', { level: 3 }),
        bullet: ed.isActive('bulletList'),
        ordered: ed.isActive('orderedList'),
        canUndo: ed.can().undo(),
        canRedo: ed.can().redo(),
      }
    },
  })

  if (!editor || !active) return null

  return (
    <div
      className="flex flex-wrap items-center gap-0.5 border-t border-slate-100 px-3 py-1.5"
      role="toolbar"
      aria-label="正文格式"
    >
      <ToolBtn
        label="加粗"
        pressed={active.bold}
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <Bold className="h-3.5 w-3.5" aria-hidden />
      </ToolBtn>
      <ToolBtn
        label="斜体"
        pressed={active.italic}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <Italic className="h-3.5 w-3.5" aria-hidden />
      </ToolBtn>
      <Sep />
      <ToolBtn
        label="标题 H2"
        pressed={active.h2}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      >
        <span className="px-0.5 text-[11px] font-semibold tracking-tight">H2</span>
      </ToolBtn>
      <ToolBtn
        label="标题 H3"
        pressed={active.h3}
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
      >
        <span className="px-0.5 text-[11px] font-semibold tracking-tight">H3</span>
      </ToolBtn>
      <Sep />
      <ToolBtn
        label="无序列表"
        pressed={active.bullet}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        <List className="h-3.5 w-3.5" aria-hidden />
      </ToolBtn>
      <ToolBtn
        label="有序列表"
        pressed={active.ordered}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        <ListOrdered className="h-3.5 w-3.5" aria-hidden />
      </ToolBtn>
      <Sep />
      <ToolBtn
        label="撤销"
        disabled={!active.canUndo}
        onClick={() => editor.chain().focus().undo().run()}
      >
        <Undo2 className="h-3.5 w-3.5" aria-hidden />
      </ToolBtn>
      <ToolBtn
        label="重做"
        disabled={!active.canRedo}
        onClick={() => editor.chain().focus().redo().run()}
      >
        <Redo2 className="h-3.5 w-3.5" aria-hidden />
      </ToolBtn>
    </div>
  )
}

function Sep() {
  return <span className="mx-1 h-4 w-px bg-slate-200" aria-hidden />
}

function ToolBtn({
  label,
  pressed,
  disabled,
  onClick,
  children,
}: {
  label: string
  pressed?: boolean
  disabled?: boolean
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={pressed}
      disabled={disabled}
      onClick={onClick}
      className={`btn-press focus-ring inline-flex h-7 min-w-7 items-center justify-center rounded-md px-1.5 ${
        pressed
          ? 'bg-slate-900 text-white shadow-sm'
          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
      } disabled:cursor-not-allowed disabled:opacity-30`}
    >
      {children}
    </button>
  )
}
