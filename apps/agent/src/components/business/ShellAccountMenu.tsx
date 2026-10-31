import { Building2, ChevronDown, Scale } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ENTRY_ROLE_LABEL,
  type EntryRole,
} from '../../business/entryRole'
import { useEntryRole } from '../../business/useEntryRole'
import { useAuthSession } from '../../business/AuthSessionContext'

const OPTIONS: EntryRole[] = ['enterprise', 'agency']

/**
 * 顶栏减负：角色切换 + 退出 + 弱链收进头像菜单（不常驻 chip 墙）。
 */
export function ShellAccountMenu() {
  const { entryRole, setEntryRole } = useEntryRole()
  const { logout } = useAuthSession()
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

  const short =
    entryRole === 'enterprise' ? '企' : entryRole === 'agency' ? '代' : '我'

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="btn-press focus-ring hit-40 flex items-center gap-1.5 rounded-full border border-slate-200 bg-white py-1 pl-1 pr-2 text-xs text-slate-700 hover:border-slate-300"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="账户与角色"
        data-testid="shell-account-menu"
      >
        <span
          className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-[10px] font-semibold text-white"
          aria-hidden
        >
          {short}
        </span>
        <span className="hidden max-w-[4.5rem] truncate font-medium sm:inline">
          {ENTRY_ROLE_LABEL[entryRole].replace(/^我是/, '')}
        </span>
        <ChevronDown className="h-3 w-3 text-slate-400" aria-hidden />
      </button>
      {open ? (
        <div
          className="menu-enter absolute right-0 z-40 mt-1 w-52 overflow-hidden rounded-lg border border-slate-200 bg-white elevated"
          role="menu"
          aria-label="账户菜单"
          data-testid="shell-account-panel"
        >
          <p className="px-3 pt-2 text-[10px] font-medium uppercase tracking-wide text-slate-400">
            入口角色
          </p>
          {OPTIONS.map((role) => (
            <button
              key={role}
              type="button"
              role="menuitemradio"
              aria-checked={role === entryRole}
              onClick={() => pick(role)}
              className={`btn-press focus-ring flex w-full items-center gap-2 px-3 py-2 text-left text-xs hover:bg-slate-100 ${
                role === entryRole ? 'bg-slate-50 text-slate-900' : 'text-slate-700'
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
          <div className="my-1 border-t border-slate-100" />
          <Link
            to="/agent/welcome"
            role="menuitem"
            className="btn-press focus-ring block px-3 py-2 text-xs text-slate-600 hover:bg-slate-100"
            data-testid="shell-account-welcome"
            onClick={() => setOpen(false)}
          >
            宣传站（弱链）
          </Link>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false)
              logout()
              // RequireAuth 未登录会 Navigate→welcome；延后一帧再落到登录壳，避免抢路由
              window.setTimeout(() => {
                navigate('/agent/login', { replace: true })
              }, 0)
            }}
            className="btn-press focus-ring flex w-full px-3 py-2 text-left text-xs text-slate-700 hover:bg-slate-100"
            data-testid="auth-logout"
          >
            退出样机会话
          </button>
        </div>
      ) : null}
    </div>
  )
}
