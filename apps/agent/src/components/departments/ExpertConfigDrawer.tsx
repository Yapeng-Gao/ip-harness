import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { useOrgConfig } from '../../departments/OrgConfigContext'
import type { OrgDept, OrgSeatId } from '../../departments/orgDepts'
import { getProjectExpert } from '../../projects/experts'
import { ExpertAvatar } from './ExpertAvatar'
import type { ProjectExpertId } from '../../projects/types'

type Props = {
  seatId: OrgSeatId
  dept: OrgDept
  displayName?: string
  onClose: () => void
}

/**
 * 点专家 → 居中弹窗（与部门弹窗同构）：这人干什么、会哪些本事。
 */
export function ExpertConfigDrawer({
  seatId,
  dept,
  displayName,
  onClose,
}: Props) {
  const {
    getExpertConfig,
    patchExpertConfig,
    addSkill,
    toggleSkill,
    removeSkill,
    expertDisplayName,
    capabilitiesForDept,
    addCapability,
  } = useOrgConfig()
  const cfg = getExpertConfig(seatId)
  const rosterSeat =
    typeof seatId === 'string' &&
    /^(expert-|orchestrator|general-)/.test(seatId)
  const def = rosterSeat
    ? getProjectExpert(seatId as ProjectExpertId)
    : undefined
  const title =
    displayName?.trim() ||
    expertDisplayName(seatId, def?.name ?? String(seatId))
  const [roleDraft, setRoleDraft] = useState(
    cfg.role || def?.description?.slice(0, 80) || '',
  )
  const [newHook, setNewHook] = useState('')

  const catalog = capabilitiesForDept(dept.id)
  const hookedCount = cfg.skills.filter((s) => s.enabled).length

  const commitRole = () => {
    if (roleDraft !== cfg.role) patchExpertConfig(seatId, { role: roleDraft })
  }

  const addFromCatalog = (name: string) => {
    if (cfg.skills.some((s) => s.name === name)) {
      const hit = cfg.skills.find((s) => s.name === name)
      if (hit && !hit.enabled) toggleSkill(seatId, hit.id)
      return
    }
    addSkill(seatId, name, 'core')
  }

  const catalogNames = catalog.map((c) => c.name)

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/30 p-3 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="expert-config-title"
      data-testid="expert-config-drawer"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="flex max-h-[min(88vh,40rem)] w-full max-w-md flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[var(--shadow-elevated)]">
        <header className="flex shrink-0 items-start gap-2 border-b border-slate-200 px-4 py-3">
          <span className="mt-0.5 shrink-0">
            <ExpertAvatar name={title} size="md" seed={String(seatId)} />
          </span>
          <div className="min-w-0 flex-1">
            <h2
              id="expert-config-title"
              className="truncate text-[15px] font-semibold text-slate-900"
            >
              {title}
            </h2>
            <p className="mt-0.5 text-[12px] text-slate-600">
              {dept.label} · 改这个专家会干什么
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="focus-ring hit-40 shrink-0 rounded-md px-2 text-[12px] text-slate-600 hover:bg-slate-100"
          >
            完成
          </button>
        </header>

        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-4 py-4">
          <section>
            <label
              htmlFor="expert-role"
              className="block text-[13px] font-semibold text-slate-900"
            >
              这人负责什么
            </label>
            <p className="mt-0.5 text-[12px] text-slate-500">
              一句话说明岗位；可改。
            </p>
            <textarea
              id="expert-role"
              value={roleDraft}
              onChange={(e) => setRoleDraft(e.target.value)}
              onBlur={commitRole}
              rows={2}
              placeholder="例如：把交底写全、追缺项、过质检"
              className="focus-ring mt-2 w-full resize-y rounded-md border border-slate-200 px-2.5 py-2 text-[13px] leading-relaxed text-slate-800 placeholder:text-slate-400"
              data-testid="expert-role-input"
            />
          </section>

          <section>
            <div className="flex items-baseline justify-between gap-2">
              <h3 className="text-[13px] font-semibold text-slate-900">
                会哪些本事
              </h3>
              <span className="tabular text-[12px] text-slate-500">
                开着 {hookedCount}/{cfg.skills.length}
              </span>
            </div>
            <p className="mt-0.5 text-[12px] leading-snug text-slate-500">
              开关＝这个专家会不会这项。点一下切换。
            </p>

            <ul className="mt-2 space-y-1.5" data-testid="expert-skill-list">
              {cfg.skills.map((s) => (
                <li key={s.id}>
                  <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-2.5 py-2">
                    <button
                      type="button"
                      role="switch"
                      aria-checked={s.enabled}
                      onClick={() => toggleSkill(seatId, s.id)}
                      className={`focus-ring relative h-6 w-10 shrink-0 rounded-full transition-colors ${
                        s.enabled ? 'bg-emerald-600' : 'bg-slate-300'
                      }`}
                      aria-label={`${s.enabled ? '关闭' : '打开'} ${s.name}`}
                    >
                      <span
                        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                          s.enabled ? 'left-4.5 translate-x-0' : 'left-0.5'
                        }`}
                        style={{
                          left: s.enabled ? '1.25rem' : '0.125rem',
                        }}
                      />
                    </button>
                    <span
                      className={`min-w-0 flex-1 truncate text-[13px] ${
                        s.enabled
                          ? 'font-medium text-slate-900'
                          : 'text-slate-500'
                      }`}
                    >
                      {s.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeSkill(seatId, s.id)}
                      className="focus-ring shrink-0 rounded p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-700"
                      aria-label={`删除 ${s.name}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden />
                    </button>
                  </div>
                </li>
              ))}
              {cfg.skills.length === 0 ? (
                <li className="rounded-lg border border-dashed border-slate-200 px-3 py-3 text-[12px] text-slate-500">
                  还没挂本事。可从下方本部门目录点选，或自己写一条。
                </li>
              ) : null}
            </ul>

            {catalogNames.length > 0 ? (
              <div className="mt-3">
                <p className="mb-1.5 text-[12px] font-medium text-slate-600">
                  从能力库点选（本部 + 通用）
                </p>
                <ul className="flex flex-wrap gap-1.5">
                  {catalog.map((cap) => {
                    const on = cfg.skills.some(
                      (s) => s.name === cap.name && s.enabled,
                    )
                    return (
                      <li key={cap.id}>
                        <button
                          type="button"
                          onClick={() => addFromCatalog(cap.name)}
                          disabled={on}
                          className={`focus-ring rounded-full border px-2.5 py-1 text-[12px] ${
                            on
                              ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                              : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          {on ? `✓ ${cap.name}` : `+ ${cap.name}`}
                        </button>
                      </li>
                    )
                  })}
                </ul>
              </div>
            ) : (
              <p className="mt-3 text-[12px] text-slate-500">
                能力库里还没有可挂项。请先回部门管理打开「能力库」新增。
              </p>
            )}

            <div className="mt-3 flex gap-1.5">
              <input
                value={newHook}
                onChange={(e) => setNewHook(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    const n = newHook.trim()
                    if (!n) return
                    addSkill(seatId, n)
                    addCapability({ name: n, deptId: dept.id })
                    setNewHook('')
                  }
                }}
                placeholder="临时加一条（同时写入能力库）"
                aria-label="新增本事"
                className="focus-ring min-h-10 min-w-0 flex-1 rounded-md border border-slate-200 px-2.5 text-[13px] placeholder:text-slate-400"
                data-testid="expert-skill-input"
              />
              <button
                type="button"
                onClick={() => {
                  const n = newHook.trim()
                  if (!n) return
                  addSkill(seatId, n)
                  addCapability({ name: n, deptId: dept.id })
                  setNewHook('')
                }}
                className="btn-press focus-ring inline-flex min-h-10 items-center gap-1 rounded-md bg-slate-900 px-3 text-[13px] font-medium text-white hover:bg-slate-800"
                data-testid="expert-skill-add"
              >
                <Plus className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
                加上
              </button>
            </div>
          </section>
        </div>

        <footer className="shrink-0 border-t border-slate-200 px-4 py-2.5">
          <p className="text-[11px] text-slate-500">
            改的是编制：这个专家会什么。办活请回大厅进部台。
          </p>
        </footer>
      </div>
    </div>
  )
}
