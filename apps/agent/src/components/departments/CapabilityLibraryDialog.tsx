import { useMemo, useState } from 'react'
import { Plus, Trash2, X } from 'lucide-react'
import { useOrgConfig } from '../../departments/OrgConfigContext'
import {
  MAIN_CHAIN_DEPTS,
  ORG_DEPTS,
  type OrgDeptId,
} from '../../departments/orgDepts'

type Props = {
  onClose: () => void
}

/**
 * 公司能力库 · 先有本事条目，再给专家挂接
 */
export function CapabilityLibraryDialog({ onClose }: Props) {
  const {
    capabilities,
    addCapability,
    removeCapability,
    deptLabel,
    deptConfigs,
  } = useOrgConfig()
  const [name, setName] = useState('')
  const [deptId, setDeptId] = useState<OrgDeptId | ''>('')
  const [filter, setFilter] = useState<'all' | OrgDeptId | 'common'>('all')

  const depts = useMemo(() => {
    const map = new Map(MAIN_CHAIN_DEPTS.map((d) => [d.id, d] as const))
    return MAIN_CHAIN_DEPTS.filter(
      (d) => deptConfigs[d.id]?.enabled !== false || map.has(d.id),
    )
  }, [deptConfigs])

  const visible = useMemo(() => {
    if (filter === 'all') return capabilities
    if (filter === 'common') return capabilities.filter((c) => !c.deptId)
    return capabilities.filter((c) => c.deptId === filter || !c.deptId)
  }, [capabilities, filter])

  const submit = () => {
    const created = addCapability({
      name,
      deptId: deptId || undefined,
    })
    if (!created) return
    setName('')
  }

  return (
    <div
      className="fixed inset-0 z-40 flex items-end justify-center bg-slate-950/30 p-3 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cap-lib-title"
      data-testid="capability-library-dialog"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="flex max-h-[min(88vh,42rem)] w-full max-w-lg flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[var(--shadow-elevated)]">
        <header className="flex shrink-0 items-start gap-2 border-b border-slate-200 px-4 py-3">
          <div className="min-w-0 flex-1">
            <h2
              id="cap-lib-title"
              className="text-[15px] font-semibold text-slate-900"
            >
              能力库
            </h2>
            <p className="mt-0.5 text-[12px] text-slate-600">
              公司有哪些本事。先在这里加，再到专家上挂。
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="focus-ring hit-40 shrink-0 rounded-md px-2 text-slate-600 hover:bg-slate-100"
            aria-label="关闭"
          >
            <X className="h-4 w-4" strokeWidth={1.75} aria-hidden />
          </button>
        </header>

        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-3">
          <div className="flex flex-wrap gap-1.5">
            <FilterChip
              active={filter === 'all'}
              onClick={() => setFilter('all')}
              label={`全部 ${capabilities.length}`}
            />
            <FilterChip
              active={filter === 'common'}
              onClick={() => setFilter('common')}
              label="通用"
            />
            {depts.map((d) => (
              <FilterChip
                key={d.id}
                active={filter === d.id}
                onClick={() => setFilter(d.id)}
                label={deptLabel(d)}
              />
            ))}
          </div>

          <ul className="space-y-1" data-testid="capability-list">
            {visible.map((c) => (
              <li
                key={c.id}
                className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-2.5 py-2"
              >
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] font-medium text-slate-900">
                    {c.name}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    {c.deptId
                      ? (() => {
                          const d = ORG_DEPTS.find((x) => x.id === c.deptId)
                          return d ? deptLabel(d) : c.deptId
                        })()
                      : '通用'}
                    {c.note ? ` · ${c.note}` : ''}
                  </span>
                </span>
                <button
                  type="button"
                  onClick={() => removeCapability(c.id)}
                  className="focus-ring shrink-0 rounded-md p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-700"
                  aria-label={`删除 ${c.name}`}
                  data-testid={`cap-remove-${c.id}`}
                >
                  <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden />
                </button>
              </li>
            ))}
            {visible.length === 0 ? (
              <li className="rounded-lg border border-dashed border-slate-200 px-3 py-4 text-center text-[12px] text-slate-500">
                还没有能力。在下方新增一条。
              </li>
            ) : null}
          </ul>
        </div>

        <footer className="shrink-0 space-y-2 border-t border-slate-200 px-4 py-3">
          <p className="text-[11px] font-medium text-slate-600">新增能力</p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  submit()
                }
              }}
              placeholder="能力名，如「同族对比」"
              aria-label="新能力名称"
              className="focus-ring min-h-10 min-w-0 flex-1 rounded-md border border-slate-200 px-2.5 text-[13px] placeholder:text-slate-400"
              data-testid="cap-add-input"
            />
            <select
              value={deptId}
              onChange={(e) =>
                setDeptId((e.target.value || '') as OrgDeptId | '')
              }
              className="focus-ring min-h-10 rounded-md border border-slate-200 bg-white px-2 text-[13px] text-slate-700"
              aria-label="归属部门"
              data-testid="cap-add-dept"
            >
              <option value="">通用（各部门可挂）</option>
              {depts.map((d) => (
                <option key={d.id} value={d.id}>
                  {deptLabel(d)}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={submit}
              className="btn-press focus-ring inline-flex min-h-10 items-center justify-center gap-1 rounded-md bg-slate-900 px-3 text-[13px] font-medium text-white hover:bg-slate-800"
              data-testid="cap-add-btn"
            >
              <Plus className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
              加入库
            </button>
          </div>
        </footer>
      </div>
    </div>
  )
}

function FilterChip({
  active,
  onClick,
  label,
}: {
  active: boolean
  onClick: () => void
  label: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`focus-ring rounded-full px-2.5 py-1 text-[11px] font-medium ${
        active
          ? 'bg-slate-900 text-white'
          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
      }`}
    >
      {label}
    </button>
  )
}
