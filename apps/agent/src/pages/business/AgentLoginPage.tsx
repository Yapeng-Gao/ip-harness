import { useMemo, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { Building2, Scale } from 'lucide-react'
import { useAuthSession } from '../../business/AuthSessionContext'
import { useBusinessCases } from '../../business/BusinessCaseContext'
import {
  ENTRY_ROLE_LABEL,
  resolveEntryLandingPath,
  type EntryRole,
} from '../../business/entryRole'
import { useEntryRole } from '../../business/useEntryRole'

const OPTIONS: EntryRole[] = ['agency', 'enterprise']

/**
 * product-pages §4.0 登录壳
 * 定位句 + 角色二选一 + 进入；样机本地会话；按角色落点（非同页滤权限）。
 */
export function AgentLoginPage() {
  const { loggedIn, login } = useAuthSession()
  const { entryRole, setEntryRole } = useEntryRole()
  const { cases, getProgress, getProcessLogs } = useBusinessCases()
  const navigate = useNavigate()

  const [selected, setSelected] = useState<EntryRole | null>(null)
  const [error, setError] = useState<string | null>(null)

  const getLogAt = useMemo(
    () => (id: string) => {
      const logs = getProcessLogs(id)
      if (logs.length === 0) return undefined
      return logs.reduce((max, l) => (l.at > max ? l.at : max), logs[0]!.at)
    },
    [getProcessLogs],
  )

  if (loggedIn) {
    const bounce = resolveEntryLandingPath(
      entryRole,
      cases,
      (id) => getProgress(id).updatedAt,
      getLogAt,
    )
    return <Navigate to={bounce} replace />
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
    const target = resolveEntryLandingPath(
      selected,
      cases,
      (id) => getProgress(id).updatedAt,
      getLogAt,
    )
    navigate(target, { replace: true })
  }

  return (
    <div
      className="app-shell-bg flex min-h-full items-center justify-center px-4 py-10"
      data-testid="agent-login-page"
    >
      <div className="w-full max-w-md rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[var(--shadow-rest)] sm:p-8">
        <div className="mb-6 flex items-center gap-2">
          <div className="shell-brand-mark flex h-8 w-8 items-center justify-center text-[11px] font-semibold">
            IP
          </div>
          <div>
            <div className="text-base font-semibold tracking-tight text-slate-900">
              外挂知识产权部
            </div>
            <p className="text-xs text-slate-500">把知产工作当成公司里的一个部门来跑</p>
          </div>
        </div>

        <p className="mb-4 text-sm text-slate-600">
          选择入口角色后进入对应开始页（代理看案盘，企业进本案公司首页）。
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
      </div>
    </div>
  )
}
