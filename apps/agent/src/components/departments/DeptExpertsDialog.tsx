import { useMemo, useState } from 'react'
import { Plus, Settings2, Trash2, UserPlus, X } from 'lucide-react'
import { getProjectExpert } from '../../projects/experts'
import { ExpertAvatar } from './ExpertAvatar'
import { useOrgConfig } from '../../departments/OrgConfigContext'
import type { OrgDept, OrgSeatId } from '../../departments/orgDepts'

export type DeptExpertListItem = {
  id: string
  seatId: OrgSeatId | null
  name: string
  kind: 'lead' | 'peer' | 'extra'
  /** 建议岗尚未启用 */
  peerId?: string
  removable: boolean
}

type Props = {
  dept: OrgDept
  onClose: () => void
  onEditExpert: (seatId: OrgSeatId, name: string) => void
}

export function buildDeptExpertList(
  dept: OrgDept,
  extras: { id: string; name: string; fromPeerId?: string }[],
): DeptExpertListItem[] {
  const lead = getProjectExpert(dept.leadSeatId)
  const hiredPeerIds = new Set(
    extras.filter((e) => e.fromPeerId).map((e) => e.fromPeerId!),
  )
  const rows: DeptExpertListItem[] = [
    {
      id: dept.leadSeatId,
      seatId: dept.leadSeatId,
      name: lead?.name ?? dept.leadSeatId,
      kind: 'lead',
      removable: false,
    },
  ]

  for (const p of dept.peers) {
    if (p.kind === 'session' && p.sessionSeatId) {
      rows.push({
        id: p.id,
        seatId: p.sessionSeatId,
        name: p.label,
        kind: 'peer',
        removable: false,
      })
      continue
    }
    if (hiredPeerIds.has(p.id)) {
      const hired = extras.find((e) => e.fromPeerId === p.id)
      if (hired) {
        rows.push({
          id: hired.id,
          seatId: hired.id,
          name: hired.name,
          kind: 'extra',
          peerId: p.id,
          removable: true,
        })
      }
      continue
    }
    rows.push({
      id: p.id,
      seatId: null,
      name: p.label,
      kind: 'peer',
      peerId: p.id,
      removable: false,
    })
  }

  for (const e of extras) {
    if (e.fromPeerId) continue
    rows.push({
      id: e.id,
      seatId: e.id,
      name: e.name,
      kind: 'extra',
      removable: true,
    })
  }

  return rows
}

/**
 * 点部门 → 弹窗管专家
 * - 已在编：点开改能力
 * - 建议岗：产品预设角色，点「启用」纳入编制（不是办活「请来」）
 * - 底部：自定义添加专家
 */
export function DeptExpertsDialog({ dept, onClose, onEditExpert }: Props) {
  const {
    deptLabel,
    deptConfigs,
    patchDeptConfig,
    addDeptExpert,
    hirePeerExpert,
    removeDeptExpert,
    getExpertConfig,
    expertDisplayName,
    capabilitiesForDept,
  } = useOrgConfig()
  const [newName, setNewName] = useState('')
  const extras = deptConfigs[dept.id]?.extraExperts ?? []
  const enabled = deptConfigs[dept.id]?.enabled !== false
  const label = deptLabel(dept)

  const rows = useMemo(
    () => buildDeptExpertList(dept, extras),
    [dept, extras],
  )
  const onRoster = rows.filter((r) => r.seatId != null)
  const suggested = rows.filter((r) => r.seatId == null && r.peerId)

  const capabilityNames = capabilitiesForDept(dept.id).map((c) => c.name)

  const submitAdd = () => {
    const created = addDeptExpert(dept.id, newName)
    if (!created) return
    setNewName('')
    // 加人后留在列表；要改能力再点该专家
  }

  const enableSuggested = (peerId: string, name: string) => {
    hirePeerExpert(dept.id, peerId, name)
    // 启用后留在「已在编」；点专家才打开改能力
  }

  return (
    <div
      className="fixed inset-0 z-40 flex items-end justify-center bg-slate-950/30 p-3 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="dept-experts-title"
      data-testid="dept-experts-dialog"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="flex max-h-[min(88vh,40rem)] w-full max-w-md flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[var(--shadow-elevated)]">
        <header className="flex shrink-0 items-start gap-2 border-b border-slate-200 px-4 py-3">
          <div className="min-w-0 flex-1">
            <h2
              id="dept-experts-title"
              className="truncate text-[15px] font-semibold text-slate-900"
            >
              {label} · 专家
            </h2>
            <p className="mt-0.5 text-[12px] text-slate-600">
              点已在编专家 → 改「负责什么 / 会哪些本事」
            </p>
          </div>
          <label className="mt-0.5 flex shrink-0 cursor-pointer items-center gap-1 text-[11px] text-slate-600">
            <input
              type="checkbox"
              checked={enabled}
              onChange={(e) =>
                patchDeptConfig(dept.id, { enabled: e.target.checked })
              }
              className="h-3.5 w-3.5 accent-sky-600"
              aria-label={`${label} ${enabled ? '已开' : '已关'}`}
            />
            {enabled ? '开部' : '关部'}
          </label>
          <button
            type="button"
            onClick={onClose}
            className="focus-ring hit-40 shrink-0 rounded-md px-2 text-[12px] text-slate-600 hover:bg-slate-100"
            aria-label="关闭"
          >
            <X className="h-4 w-4" strokeWidth={1.75} aria-hidden />
          </button>
        </header>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-3">
          <section>
            <h3 className="mb-1.5 text-[11px] font-semibold text-slate-500">
              已在编 · {onRoster.length}
            </h3>
            <ul className="space-y-1" data-testid="dept-experts-list">
              {onRoster.map((row) => {
                const display = expertDisplayName(row.seatId!, row.name)
                const hooked = getExpertConfig(row.seatId!).skills.filter(
                  (s) => s.enabled,
                ).length
                return (
                  <li key={row.id}>
                    <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white">
                      <button
                        type="button"
                        onClick={() => onEditExpert(row.seatId!, display)}
                        className="focus-ring flex min-w-0 flex-1 items-center gap-2 rounded-lg px-2.5 py-2 text-left hover:bg-slate-50"
                        data-testid={`dept-expert-${row.id}`}
                      >
                        <ExpertAvatar
                          name={display}
                          size="sm"
                          seed={String(row.seatId)}
                        />
                        <span className="min-w-0 flex-1">
                          <span className="flex items-center gap-1.5">
                            <span className="truncate text-[13px] font-medium text-slate-900">
                              {display}
                            </span>
                            {row.kind === 'lead' ? (
                              <span className="shrink-0 rounded bg-sky-50 px-1.5 py-px text-[10px] font-medium text-sky-800">
                                负责人
                              </span>
                            ) : row.peerId ? (
                              <span className="shrink-0 rounded bg-emerald-50 px-1.5 py-px text-[10px] font-medium text-emerald-800">
                                建议岗
                              </span>
                            ) : row.kind === 'extra' ? (
                              <span className="shrink-0 rounded bg-slate-100 px-1.5 py-px text-[10px] font-medium text-slate-600">
                                自建
                              </span>
                            ) : null}
                          </span>
                          <span className="text-[11px] text-slate-500">
                            {hooked} 项本事开着 · 点开修改
                          </span>
                        </span>
                        <Settings2
                          className="h-3.5 w-3.5 shrink-0 text-slate-400"
                          strokeWidth={1.75}
                          aria-hidden
                        />
                      </button>
                      {row.removable ? (
                        <button
                          type="button"
                          onClick={() => removeDeptExpert(dept.id, row.id)}
                          className="focus-ring mr-1.5 shrink-0 rounded-md p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-700"
                          aria-label={`移除 ${display}`}
                          data-testid={`dept-remove-expert-${row.id}`}
                        >
                          <Trash2
                            className="h-3.5 w-3.5"
                            strokeWidth={1.75}
                            aria-hidden
                          />
                        </button>
                      ) : null}
                    </div>
                  </li>
                )
              })}
            </ul>
          </section>

          {suggested.length > 0 ? (
            <section>
              <h3 className="mb-1 text-[11px] font-semibold text-slate-500">
                建议岗 · 可选启用
              </h3>
              <p className="mb-1.5 text-[11px] leading-snug text-slate-500">
                产品预设的部内角色，还没放进你的编制。启用后才能改能力；不是办活用的「请来」。
              </p>
              <ul className="space-y-1" data-testid="dept-suggested-list">
                {suggested.map((row) => (
                  <li key={row.id}>
                    <div className="flex items-center gap-2 rounded-lg border border-dashed border-slate-200 bg-slate-50/70 px-2.5 py-2">
                      <ExpertAvatar name={row.name} size="sm" seed={row.id} />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[13px] text-slate-700">
                          {row.name}
                        </span>
                        <span className="text-[11px] text-slate-500">
                          未启用
                        </span>
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          enableSuggested(row.peerId!, row.name)
                        }
                        className="btn-press focus-ring inline-flex min-h-9 items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 text-[12px] font-medium text-slate-800 hover:bg-slate-50"
                        data-testid={`dept-hire-${row.peerId}`}
                      >
                        <UserPlus
                          className="h-3.5 w-3.5"
                          strokeWidth={1.75}
                          aria-hidden
                        />
                        启用
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {capabilityNames.length > 0 ? (
            <div>
              <p className="mb-1 text-[10px] font-semibold text-slate-500">
                可挂能力（来自能力库）
              </p>
              <ul className="flex flex-wrap gap-1">
                {capabilityNames.map((n) => (
                  <li
                    key={n}
                    className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] text-slate-700"
                  >
                    {n}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>

        <footer className="shrink-0 border-t border-slate-200 px-4 py-3">
          <p className="mb-1.5 text-[11px] font-medium text-slate-600">
            自定义添加专家
          </p>
          <p className="mb-1.5 text-[11px] text-slate-500">
            花名册没有的岗，自己起名加进本部门。
          </p>
          <div className="flex gap-1.5">
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  submitAdd()
                }
              }}
              placeholder="专家名，如「附图校对」"
              aria-label="新专家名称"
              className="focus-ring min-h-10 min-w-0 flex-1 rounded-md border border-slate-200 px-2.5 text-[13px] placeholder:text-slate-400"
              data-testid="dept-add-expert-input"
            />
            <button
              type="button"
              onClick={submitAdd}
              className="btn-press focus-ring inline-flex min-h-10 items-center gap-1 rounded-md bg-slate-900 px-3 text-[13px] font-medium text-white hover:bg-slate-800"
              data-testid="dept-add-expert-btn"
            >
              <Plus className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
              添加
            </button>
          </div>
        </footer>
      </div>
    </div>
  )
}
