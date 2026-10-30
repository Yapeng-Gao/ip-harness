import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { Building2, Scale } from 'lucide-react'
import { useAuthSession } from '../../business/AuthSessionContext'
import {
  ENTRY_ROLE_LABEL,
  resolveEntryLandingPath,
  type EntryRole,
} from '../../business/entryRole'
import { useEntryRole } from '../../business/useEntryRole'

const OPTIONS: EntryRole[] = ['agency', 'enterprise']

/**
 * product-pages §4.0 登录壳
 * 定位句 + 角色二选一 + 进入 → 产品首页 /agent（§4.0a）；样机本地会话。
 */
export function AgentLoginPage() {
  const { loggedIn, login } = useAuthSession()
  const { setEntryRole } = useEntryRole()
  const navigate = useNavigate()

  const [selected, setSelected] = useState<EntryRole | null>(null)
  const [error, setError] = useState<string | null>(null)

  if (loggedIn) {
    return <Navigate to={resolveEntryLandingPath('agency')} replace />
  }

  const enter = () => {
    setError(null)
    if (!selected) {
      setError('请先选择入口角色')
      return
    }
    setEntryRole(selected)
    const ok = login()
    if (!ok) {
      setError('本地会话写入失败，请重试')
      return
    }
    navigate(resolveEntryLandingPath(selected), { replace: true })
  }

  return (
    <div
      className="app-shell-bg flex min-h-full items-center justify-center px-4 py-10"
      data-testid="agent-login-page"
    >
      <div className="w-full max-w-md rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[var(--shadow-rest)] sm:p-8">
        <div className="mb-6 flex items-center gap-2">
          <div className="shell-brand-mark flex h-8 w-8 items-center justify-center text-[10px] font-semibold">
            NT
          </div>
          <div>
            <div className="text-base font-semibold tracking-tight text-slate-900">
              Novada Team
            </div>
            <p className="text-xs text-slate-500">专家向你汇报 · 按部门办事</p>
          </div>
        </div>

        <p className="mb-4 text-sm text-slate-600">
          选择入口角色后进入 Novada Team 大厅；再从大厅进部门或公司案首页。
        </p>

        <fieldset className="mb-5">
          <legend className="mb-2 text-xs font-medium text-slate-500">入口角色</legend>
          <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="入口角色">
            {OPTIONS.map((role) => {
              const active = selected === role
              return (
                <button
                  key={role}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => {
                    setSelected(role)
                    setError(null)
                  }}
                  className={`btn-press focus-ring flex items-center gap-2 rounded-xl border px-3 py-3 text-left text-sm ${
                    active
                      ? 'border-[color-mix(in_srgb,var(--color-accent)_40%,transparent)] bg-accent-soft text-slate-900'
                      : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300'
                  }`}
                  data-testid={`login-role-${role}`}
                >
                  {role === 'enterprise' ? (
                    <Building2 className="h-4 w-4 shrink-0 text-slate-500" aria-hidden />
                  ) : (
                    <Scale className="h-4 w-4 shrink-0 text-slate-500" aria-hidden />
                  )}
                  <span className="font-medium">{ENTRY_ROLE_LABEL[role]}</span>
                </button>
              )
            })}
          </div>
        </fieldset>

        {error && (
          <p className="mb-3 text-xs text-red-600" role="alert" data-testid="login-error">
            {error}
          </p>
        )}

        <button
          type="button"
          onClick={enter}
          className="btn-press focus-ring hit-40 w-full rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
          data-testid="login-enter"
        >
          进入
        </button>

        <p className="mt-4 text-center text-[11px] text-slate-400">
          样机：本地会话，非真登录
        </p>
        <p className="mt-2 text-center text-[11px]">
          <Link
            to="/agent/welcome"
            className="focus-ring text-slate-500 underline-offset-2 hover:text-slate-800 hover:underline"
            data-testid="welcome-from-login"
          >
            先了解产品货架
          </Link>
        </p>
      </div>
    </div>
  )
}
