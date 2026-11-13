import { useEffect, useRef, useState } from 'react'
import { Building2, Scale, ChevronDown, LogOut } from 'lucide-react'
import { useApp } from '@shared/context/AppContext'
import { WORKSPACES } from '@shared/data/workspaces'
import { APP_DEV_URLS } from '@ip/contracts'

type Props = {
  /** sidebar = full-width block; topbar = compact chip */
  variant?: 'sidebar' | 'topbar'
  className?: string
}

/**
 * Mid-local tenant/workspace switcher.
 * Cross-app "重新选择工作区" uses absolute IAM URL (not react-router /login).
 */
export function MidWorkspaceMenu({ variant = 'sidebar', className = '' }: Props) {
  const { workspace, selectWorkspace } = useApp()
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

  const trigger =
    variant === 'topbar' ? (
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="btn-press focus-ring hit-40 flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2 text-xs text-slate-700 hover:border-slate-300"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label="切换工作区"
      >
        {workspace.kind === 'enterprise' ? (
          <Building2 className={`h-3 w-3 ${workspace.brandColor}`} aria-hidden />
        ) : (
          <Scale className={`h-3 w-3 ${workspace.brandColor}`} aria-hidden />
        )}
        <span className={`font-medium ${workspace.brandColor}`}>{workspace.chipLabel}</span>
        <ChevronDown className="h-3 w-3 text-slate-400" aria-hidden />
      </button>
    ) : (
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="btn-press focus-ring flex w-full items-center gap-2 rounded-xl border border-slate-200 bg-white px-2.5 py-2 text-left hover:border-slate-300 hover:bg-slate-50"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label="切换工作区"
      >
        {workspace.kind === 'enterprise' ? (
          <Building2 className={`h-3.5 w-3.5 ${workspace.brandColor}`} aria-hidden />
        ) : (
          <Scale className={`h-3.5 w-3.5 ${workspace.brandColor}`} aria-hidden />
        )}
        <div className="min-w-0 flex-1">
          <div className={`truncate text-xs font-medium ${workspace.brandColor}`}>
            {workspace.chipLabel}
          </div>
        </div>
        <ChevronDown className="h-3.5 w-3.5 text-slate-400" aria-hidden />
      </button>
    )

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      {variant === 'sidebar' && (
        <div className="mb-1.5 text-xs uppercase tracking-wider text-slate-400">工作区切换</div>
      )}
      {trigger}
      {open && (
        <div
          className={`menu-enter absolute z-40 mt-1 overflow-hidden rounded-lg border border-slate-200 bg-white elevated ${
            variant === 'topbar' ? 'left-0 w-52' : 'left-0 right-0'
          }`}
          role="listbox"
          aria-label="工作区列表"
        >
          {WORKSPACES.map((ws) => (
            <button
              key={ws.id}
              type="button"
              role="option"
              aria-selected={ws.id === workspace.id}
              onClick={() => {
                selectWorkspace(ws.id)
                setOpen(false)
              }}
              className={`btn-press focus-ring flex w-full items-center gap-2 px-3 py-2 text-left text-xs hover:bg-slate-100 ${
                ws.id === workspace.id ? 'bg-slate-100 text-slate-800' : 'text-slate-700'
              }`}
            >
              <span
                className={`flex h-5 w-5 items-center justify-center rounded text-xs font-bold text-white ${ws.brandBg}`}
              >
                {ws.logoLetter}
              </span>
              {ws.chipLabel}
            </button>
          ))}
          <a
            href={APP_DEV_URLS.iam}
            className="focus-ring flex items-center gap-2 border-t border-slate-100 px-3 py-2 text-xs text-slate-500 hover:bg-slate-50"
            onClick={() => setOpen(false)}
          >
            <LogOut className="h-3 w-3" aria-hidden /> 重新选择工作区
          </a>
        </div>
      )}
    </div>
  )
}
