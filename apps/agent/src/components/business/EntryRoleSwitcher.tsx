import { Building2, Scale, ChevronDown } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ENTRY_ROLE_LABEL,
  type EntryRole,
} from '../../business/entryRole'
import { useEntryRole } from '../../business/useEntryRole'

type Props = {
  className?: string
}

const OPTIONS: EntryRole[] = ['agency', 'enterprise']

/**
 * 顶栏紧凑入口角色切换（现壳 chip 样式，不换肤）。
 * 切换后回 /agent，由 AgentEntryRedirect 按角色落点。
 */
export function EntryRoleSwitcher({ className = '' }: Props) {
  const { entryRole, setEntryRole } = useEntryRole()
  const navigate = useNavigate()
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

  const pick = (role: EntryRole) => {
    setEntryRole(role)
    setOpen(false)
    navigate('/agent', { replace: true })
  }

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="btn-press focus-ring hit-40 flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2 text-xs text-slate-700 hover:border-slate-300"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label="切换入口角色"
        data-testid="entry-role-switcher"
      >
        {entryRole === 'enterprise' ? (
          <Building2 className="h-3 w-3 text-slate-500" aria-hidden />
        ) : (
          <Scale className="h-3 w-3 text-slate-500" aria-hidden />
        )}
        <span className="font-medium">{ENTRY_ROLE_LABEL[entryRole]}</span>
        <ChevronDown className="h-3 w-3 text-slate-400" aria-hidden />
      </button>
      {open && (
        <div
          className="menu-enter absolute left-0 z-40 mt-1 w-44 overflow-hidden rounded-lg border border-slate-200 bg-white elevated"
          role="listbox"
          aria-label="入口角色"
        >
          {OPTIONS.map((role) => (
            <button
              key={role}
              type="button"
              role="option"
              aria-selected={role === entryRole}
              onClick={() => pick(role)}
              className={`btn-press focus-ring flex w-full items-center gap-2 px-3 py-2 text-left text-xs hover:bg-slate-100 ${
                role === entryRole ? 'bg-slate-100 text-slate-800' : 'text-slate-700'
              }`}
              data-testid={`entry-role-${role}`}
            >
              {role === 'enterprise' ? (
                <Building2 className="h-3 w-3 text-slate-500" aria-hidden />
              ) : (
                <Scale className="h-3 w-3 text-slate-500" aria-hidden />
              )}
              {ENTRY_ROLE_LABEL[role]}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
