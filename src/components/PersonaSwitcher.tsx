import { useEffect, useRef, useState } from 'react'
import { UserCog, ChevronDown } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { PERSONAS, PERSONA_LABELS } from '../data/persona'
import type { PersonaId } from '../types'

type Props = {
  variant?: 'sidebar' | 'topbar'
  className?: string
}

/**
 * 演示用 Persona 切换器（非真 SSO/IAM）。
 * 切换会执法到 canPerformHandoff / Agent 闸 / Inbox / 门户。
 */
export function PersonaSwitcher({ variant = 'sidebar', className = '' }: Props) {
  const { persona, setPersona } = useApp()
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    window.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  const pick = (id: PersonaId) => {
    setPersona(id)
    setOpen(false)
  }

  const trigger =
    variant === 'topbar' ? (
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="btn-press focus-ring flex items-center gap-1.5 rounded-lg border border-violet-200 bg-violet-50 px-2 py-1 text-xs text-violet-800 hover:border-violet-300"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label="切换 Persona"
      >
        <UserCog className="h-3 w-3" aria-hidden />
        <span className="font-medium">{PERSONA_LABELS[persona]}</span>
        <ChevronDown className="h-3 w-3 text-violet-400" aria-hidden />
      </button>
    ) : (
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="btn-press focus-ring flex w-full items-center gap-2 rounded-xl border border-violet-200 bg-violet-50/80 px-2.5 py-2 text-left hover:border-violet-300 hover:bg-violet-50"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label="切换 Persona"
      >
        <UserCog className="h-3.5 w-3.5 text-violet-700" aria-hidden />
        <div className="min-w-0 flex-1">
          <div className="truncate text-xs font-medium text-violet-900">
            {PERSONA_LABELS[persona]}
          </div>
          <div className="truncate text-[10px] text-violet-600">演示 · 可执法</div>
        </div>
        <ChevronDown className="h-3.5 w-3.5 text-violet-400" aria-hidden />
      </button>
    )

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      {variant === 'sidebar' && (
        <div className="mb-1.5 text-xs uppercase tracking-wider text-slate-400">
          Persona 切换
        </div>
      )}
      {trigger}
      {open && (
        <div
          className={`menu-enter absolute z-40 mt-1 overflow-hidden rounded-lg border border-violet-200 bg-white elevated ${
            variant === 'topbar' ? 'left-0 w-64' : 'left-0 right-0'
          }`}
          role="listbox"
          aria-label="Persona 列表"
        >
          {PERSONAS.map((p) => (
            <button
              key={p.id}
              type="button"
              role="option"
              aria-selected={p.id === persona}
              onClick={() => pick(p.id)}
              className={`btn-press focus-ring flex w-full flex-col gap-0.5 px-3 py-2 text-left hover:bg-violet-50 ${
                p.id === persona ? 'bg-violet-50' : ''
              }`}
            >
              <span className="text-xs font-medium text-slate-900">{p.label}</span>
              <span className="text-[10px] leading-snug text-slate-500">
                {p.description}
              </span>
            </button>
          ))}
          <p className="border-t border-slate-100 px-3 py-1.5 text-[10px] text-slate-400">
            非真 SSO/IAM · 执法以 Persona 为准
          </p>
        </div>
      )}
    </div>
  )
}
