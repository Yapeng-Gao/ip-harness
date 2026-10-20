import { useState } from 'react'
import { FlaskConical, Plus, Power, Trash2 } from 'lucide-react'
import { useOrgConfig } from '../../departments/OrgConfigContext'
import type { OrgDept } from '../../departments/orgDepts'
import {
  LEVEL_LABEL,
  DEPT_MAIN_XP,
  xpProgress,
} from '../../departments/orgData'
import { getProjectExpert, expertAccentClass } from '../../projects/experts'
import type { ProjectExpertId } from '../../projects/types'
import { toolCatalogLabel } from '@shared/data/sessions'

type Props = {
  seatId: ProjectExpertId
  dept: OrgDept
  onClose: () => void
}

/**
 * 专家配置抽屉 · role / skill / 培养
 * 只写 OrgConfigContext，不改 expertsPatent.ts；不产生 pending。
 */
function SkillCapabilityPicker({
  value,
  onChange,
  label,
}: {
  value: 1 | 2 | 3 | 4 | 5
  onChange: (v: 1 | 2 | 3 | 4 | 5) => void
  label: string
}) {
  return (
    <div
      className="flex shrink-0 items-center gap-0.5 rounded-full bg-white p-0.5"
      role="radiogroup"
      aria-label={label}
      data-testid="skill-capability-picker"
    >
      {([1, 2, 3, 4, 5] as const).map((v) => (
        <button
          key={v}
          type="button"
          role="radio"
          aria-checked={value === v}
          onClick={() => onChange(v)}
          className={`focus-ring h-4 w-4 rounded-full text-[9px] font-semibold tabular transition-colors duration-150 ${
            value === v
              ? 'bg-slate-900 text-white'
              : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
          }`}
        >
          {v}
        </button>
      ))}
    </div>
  )
}

export function ExpertConfigDrawer({ seatId, dept, onClose }: Props) {
  const {
    getExpertConfig,
    patchExpertConfig,
    addSkill,
    toggleSkill,
    removeSkill,
    patchSkill,
    trainExpert,
  } = useOrgConfig()
  const cfg = getExpertConfig(seatId)
  const def = getProjectExpert(seatId)
  const [newSkill, setNewSkill] = useState('')
  const [roleDraft, setRoleDraft] = useState(cfg.role)
  const [notesDraft, setNotesDraft] = useState(cfg.notes)
  const [lastTrained, setLastTrained] = useState<number | null>(null)

  /** 养成面板：基准 xp（样机）+ 用户训练量 */
  const baseXp = DEPT_MAIN_XP[dept.id] ?? 0
  const totalXp = baseXp + cfg.xp
  const xp = xpProgress(totalXp)

  const commitRole = () => {
    if (roleDraft !== cfg.role) patchExpertConfig(seatId, { role: roleDraft })
  }
  const commitNotes = () => {
    if (notesDraft !== cfg.notes) patchExpertConfig(seatId, { notes: notesDraft })
  }

  const enabledCount = cfg.skills.filter((s) => s.enabled).length

  return (
    <div
      className="fixed inset-0 z-40 flex justify-end bg-slate-950/20"
      role="dialog"
      aria-modal="true"
      aria-labelledby="expert-config-title"
      data-testid="expert-config-drawer"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <aside className="flex h-full w-full max-w-md flex-col border-l border-slate-200 bg-white shadow-[var(--shadow-elevated)]">
        <header className="flex shrink-0 items-start gap-2 border-b border-slate-200 px-4 py-3">
          <span
            className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-[11px] font-semibold ${expertAccentClass(def?.accent ?? 'slate')}`}
            aria-hidden
          >
            {(def?.name ?? seatId).slice(0, 1)}
          </span>
          <div className="min-w-0 flex-1">
            <h2
              id="expert-config-title"
              className="truncate text-[14px] font-semibold text-slate-900"
            >
              {def?.name ?? seatId}
            </h2>
            <p className="mt-0.5 truncate text-[11px] text-slate-600">
              {dept.label} · {def?.specialty ?? '专家'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="focus-ring hit-40 shrink-0 rounded-[var(--radius-sm)] px-2 text-[12px] text-slate-600 hover:bg-slate-100"
          >
            关闭
          </button>
        </header>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-3">
          <section>
            <label
              htmlFor="expert-role"
              className="block text-[11px] font-semibold uppercase tracking-wide text-slate-600"
            >
              Role · 岗位说明
            </label>
            <p className="mt-0.5 text-[11px] text-slate-500">
              留空则沿用既有说明：{def?.description?.slice(0, 40) ?? '—'}
            </p>
            <textarea
              id="expert-role"
              value={roleDraft}
              onChange={(e) => setRoleDraft(e.target.value)}
              onBlur={commitRole}
              rows={3}
              placeholder="例如：负责权要与从属项的范围设计，交卷前自查支持性"
              className="focus-ring mt-1 w-full resize-y rounded-[var(--radius-md)] border border-slate-200 px-2.5 py-2 text-[12px] leading-relaxed text-slate-800 placeholder:text-slate-500"
              data-testid="expert-role-input"
            />
          </section>

          <section>
            <div className="flex items-baseline justify-between">
              <h3 className="text-[11px] font-semibold uppercase tracking-wide text-slate-600">
                Skills · 能力
              </h3>
              <span className="tabular text-[11px] text-slate-500">
                {enabledCount}/{cfg.skills.length} 启用
              </span>
            </div>
            <ul className="mt-1.5 space-y-1" data-testid="expert-skill-list">
              {cfg.skills.map((s) => (
                <li
                  key={s.id}
                  className="rounded-[var(--radius-sm)] border border-slate-100 bg-slate-50/60 px-2 py-1.5"
                >
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => toggleSkill(seatId, s.id)}
                      aria-pressed={s.enabled}
                      aria-label={`${s.enabled ? '停用' : '启用'} ${s.name}`}
                      className={`focus-ring shrink-0 rounded p-0.5 ${s.enabled ? 'text-emerald-700' : 'text-slate-400'}`}
                    >
                      <Power className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden />
                    </button>
                    <span
                      className={`min-w-0 flex-1 truncate text-[12px] ${
                        s.enabled ? 'text-slate-800' : 'text-slate-500 line-through'
                      }`}
                    >
                      {s.name}
                    </span>
                    <SkillCapabilityPicker
                      value={s.capability}
                      onChange={(v) => patchSkill(seatId, s.id, { capability: v })}
                      label={`调整 ${s.name} 能力档`}
                    />
                    <span
                      className={`shrink-0 rounded px-1 py-px text-[10px] font-medium ${
                        s.level === 'core'
                          ? 'bg-sky-100 text-sky-800'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {s.level === 'core' ? '核心' : '可选'}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeSkill(seatId, s.id)}
                      className="focus-ring shrink-0 rounded p-0.5 text-slate-500 hover:text-rose-700"
                      aria-label={`删除 ${s.name}`}
                    >
                      <Trash2 className="h-3 w-3" strokeWidth={1.75} aria-hidden />
                    </button>
                  </div>
                  <textarea
                    value={s.prompt}
                    onChange={(e) => patchSkill(seatId, s.id, { prompt: e.target.value })}
                    rows={2}
                    placeholder="提示词 · 这段文字决定该 skill 的执行口径"
                    aria-label={`${s.name} 提示词`}
                    className="focus-ring mt-1 w-full resize-y rounded-[var(--radius-sm)] border border-slate-200 bg-white px-2 py-1.5 text-[11px] leading-relaxed text-slate-700 placeholder:text-slate-400"
                    data-testid={`expert-skill-prompt-${s.id}`}
                  />
                </li>
              ))}
            </ul>
            <div className="mt-1.5 flex gap-1.5">
              <input
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addSkill(seatId, newSkill)
                    setNewSkill('')
                  }
                }}
                placeholder="新增 skill，如「同族对比」"
                aria-label="新增 skill"
                className="focus-ring min-h-9 min-w-0 flex-1 rounded-[var(--radius-sm)] border border-slate-200 px-2 text-[12px] placeholder:text-slate-500"
                data-testid="expert-skill-input"
              />
              <button
                type="button"
                onClick={() => {
                  addSkill(seatId, newSkill)
                  setNewSkill('')
                }}
                className="btn-press focus-ring inline-flex min-h-9 items-center gap-1 rounded-[var(--radius-sm)] bg-slate-900 px-2.5 text-[12px] font-medium text-white hover:bg-slate-800"
                data-testid="expert-skill-add"
              >
                <Plus className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
                添加
              </button>
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between">
              <h3 className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-slate-600">
                <FlaskConical className="h-3.5 w-3.5 text-slate-500" strokeWidth={1.75} aria-hidden />
                养成 · 经验与档位
              </h3>
              <span className="text-[11px] font-medium text-slate-700">
                {LEVEL_LABEL[xp.level]}
              </span>
            </div>
            <p className="mt-0.5 text-[11px] text-slate-500">
              基准 {baseXp} + 已练 {cfg.xp} · 样机，升级不影响真实业务
            </p>
            <div
              className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-200"
              role="progressbar"
              aria-valuenow={xp.pct}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`养成进度 ${xp.pct}%`}
              data-testid="expert-xp-bar"
            >
              <div
                className="h-full rounded-full bg-sky-600 transition-[width] duration-300"
                style={{ width: `${xp.pct}%` }}
              />
            </div>
            <p className="tabular mt-1 text-[10px] text-slate-500">
              {xp.level === 5
                ? '已达最高档 L5'
                : `当前档内 ${xp.current}/${xp.need}，再 ${xp.need - xp.current} 升级 ${
                    LEVEL_LABEL[(xp.level + 1) as 2 | 3 | 4 | 5]
                  }`}
            </p>
            <div className="mt-1.5 flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  const next = trainExpert(seatId, 8)
                  setLastTrained(next)
                }}
                className="btn-press focus-ring min-h-8 rounded-[var(--radius-sm)] border border-sky-200 bg-sky-50 px-2.5 text-[11px] font-medium text-sky-800 hover:bg-sky-100"
                data-testid="expert-train-btn"
              >
                喂一个案例 +8
              </button>
              <button
                type="button"
                onClick={() => {
                  const next = trainExpert(seatId, 25)
                  setLastTrained(next)
                }}
                className="btn-press focus-ring min-h-8 rounded-[var(--radius-sm)] border border-sky-200 bg-sky-50 px-2.5 text-[11px] font-medium text-sky-800 hover:bg-sky-100"
              >
                喂一批语料 +25
              </button>
              {lastTrained !== null && (
                <span className="tabular text-[10px] text-slate-500">
                  累计 {lastTrained}
                </span>
              )}
            </div>
          </section>

          <section>
            <h3 className="text-[11px] font-semibold uppercase tracking-wide text-slate-600">
              培养 · 语料与案例
            </h3>
            <textarea
              value={notesDraft}
              onChange={(e) => setNotesDraft(e.target.value)}
              onBlur={commitNotes}
              rows={3}
              placeholder="补充样本、案例要点或纠正口径；样机不训练，仅记录"
              className="focus-ring mt-1 w-full resize-y rounded-[var(--radius-md)] border border-slate-200 px-2.5 py-2 text-[12px] leading-relaxed text-slate-800 placeholder:text-slate-500"
              data-testid="expert-notes-input"
            />
          </section>

          <section>
            <h3 className="text-[11px] font-semibold uppercase tracking-wide text-slate-600">
              Tools · 只读
            </h3>
            <ul className="mt-1 flex flex-wrap gap-1">
              {(def?.tools ?? []).map((t) => (
                <li
                  key={t}
                  className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[11px] text-slate-700"
                >
                  {toolCatalogLabel(t)}
                </li>
              ))}
              {(def?.tools ?? []).length === 0 && (
                <li className="text-[11px] text-slate-500">该席暂无绑定工具</li>
              )}
            </ul>
          </section>

          <section>
            <h3 className="text-[11px] font-semibold uppercase tracking-wide text-slate-600">
              护栏 · 只读
            </h3>
            <ul className="mt-1 space-y-0.5">
              {(def?.guardrails ?? []).map((g) => (
                <li key={g} className="text-[11px] leading-relaxed text-slate-700">
                  · {g}
                </li>
              ))}
              {(def?.guardrails ?? []).length === 0 && (
                <li className="text-[11px] text-slate-500">无</li>
              )}
            </ul>
          </section>
        </div>

        <footer className="shrink-0 border-t border-slate-200 px-4 py-2.5">
          <p className="text-[11px] leading-relaxed text-slate-500">
            样机 · 配置只在本机保存，不影响在建案子的席位；部门闸仍只由主责交卷。
          </p>
        </footer>
      </aside>
    </div>
  )
}
