import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  businessSeatLabel,
  seatsForCase,
  teamRosterRows,
} from '../../business/businessSeats'
import {
  applyTeamDrop,
  buildTeamRecommendPlan,
} from '../../business/deptRoster'
import { useBusinessCases } from '../../business/BusinessCaseContext'
import type { ProjectExpertId } from '../../projects/types'

type Props = {
  caseId: string
  /** 侧栏紧凑样式 */
  compact?: boolean
}

const DND_MIME = 'application/x-ip-team-seat'

/**
 * 本案团队：勾选 + 拖入托盘 · 按阶段推荐（理由/缺口）· 进组队讨论
 */
export function CaseTeamPanel({ caseId, compact = false }: Props) {
  const { getProgress, setCaseTeam } = useBusinessCases()
  const prog = getProgress(caseId)
  const rows = useMemo(
    () => teamRosterRows(seatsForCase({ moreSeatIds: prog.moreSeatIds })),
    [prog.moreSeatIds],
  )
  const selected = new Set(prog.teamMemberIds ?? [])
  const plan = useMemo(
    () => buildTeamRecommendPlan(prog.stageId, prog.teamMemberIds ?? []),
    [prog.stageId, prog.teamMemberIds],
  )
  const [hint, setHint] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const [showPlan, setShowPlan] = useState(true)

  const toggle = (id: ProjectExpertId) => {
    const next = new Set(selected)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setCaseTeam(caseId, [...next])
    setHint(null)
  }

  const applyRecommend = () => {
    setCaseTeam(caseId, plan.ids)
    setHint(`已采纳推荐 ${plan.ids.length} 人`)
  }

  const clear = () => {
    setCaseTeam(caseId, [])
    setHint('已清空讨论组')
  }

  const onDropTray = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const raw =
      e.dataTransfer.getData(DND_MIME) ||
      e.dataTransfer.getData('text/plain')
    if (!raw) return
    const next = applyTeamDrop(prog.teamMemberIds ?? [], raw)
    setCaseTeam(caseId, next)
    setHint(`已加入讨论组 · ${next.length} 人`)
  }

  return (
    <div
      className={
        compact
          ? 'rounded-md border border-slate-200/80 bg-white/70 p-1.5'
          : 'rounded-lg border border-slate-200 bg-white p-3'
      }
      data-testid="case-team-panel"
    >
      <p
        className={`mb-1.5 text-slate-500 ${compact ? 'text-[9px]' : 'text-[11px]'}`}
      >
        勾选或拖入节点里的专家。一个人的节点就写节点名。
      </p>

      <div
        className="mb-1.5 rounded-md border border-slate-100 bg-slate-50/90 px-1.5 py-1"
        data-testid="case-team-plan"
      >
        <button
          type="button"
          className="flex w-full items-center justify-between gap-1 text-left"
          onClick={() => setShowPlan((v) => !v)}
          data-testid="case-team-plan-toggle"
        >
          <span
            className={`font-medium text-slate-700 ${compact ? 'text-[9px]' : 'text-[10px]'}`}
          >
            本阶段推荐 · {plan.ids.length} 人
          </span>
          <span className="text-[9px] text-slate-400">
            {showPlan ? '收起' : '展开'}
          </span>
        </button>
        {showPlan && (
          <div className="mt-1 space-y-1">
            <p
              className={`leading-snug text-slate-600 ${compact ? 'text-[9px]' : 'text-[10px]'}`}
              data-testid="case-team-plan-blurb"
            >
              {plan.blurb}
            </p>
            <ul className="space-y-0.5" data-testid="case-team-plan-reasons">
              {plan.reasons.map((r) => (
                <li
                  key={r.seatId}
                  className={`text-slate-500 ${compact ? 'text-[9px]' : 'text-[10px]'}`}
                >
                  · {businessSeatLabel(r.seatId)}：{r.reason}
                </li>
              ))}
            </ul>
            {plan.missingIds.length > 0 ? (
              <p
                className={`text-amber-800 ${compact ? 'text-[9px]' : 'text-[10px]'}`}
                data-testid="case-team-plan-missing"
              >
                还缺：
                {plan.missingIds.map((id) => businessSeatLabel(id)).join('、')}
              </p>
            ) : (
              <p
                className={`text-emerald-700 ${compact ? 'text-[9px]' : 'text-[10px]'}`}
                data-testid="case-team-plan-complete"
              >
                推荐班底已齐
              </p>
            )}
          </div>
        )}
      </div>

      <ul className="mb-1.5 max-h-36 space-y-0.5 overflow-y-auto">
        {rows.map((row, index) => {
          const id = row.id
          const on = selected.has(id)
          const showGroup = Boolean(row.group) && rows[index - 1]?.group !== row.group
          return (
            <li key={id}>
              {showGroup ? (
                <div className="px-1.5 pt-1 text-[9px] font-medium text-slate-400">
                  {row.group}
                </div>
              ) : null}
              <label
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData(DND_MIME, id)
                  e.dataTransfer.setData('text/plain', id)
                  e.dataTransfer.effectAllowed = 'copy'
                }}
                className={`flex cursor-grab items-center gap-1.5 rounded px-1.5 py-1 active:cursor-grabbing hover:bg-slate-50 ${
                  compact ? 'text-[11px]' : 'text-[12px]'
                }`}
                data-testid={`case-team-opt-${id}`}
                title="可拖入下方托盘"
              >
                <input
                  type="checkbox"
                  checked={on}
                  onChange={() => toggle(id)}
                  className="rounded border-slate-300"
                  data-testid={`case-team-check-${id}`}
                  onClick={(e) => e.stopPropagation()}
                />
                <span className="truncate text-slate-700">{row.label}</span>
              </label>
            </li>
          )
        })}
      </ul>

      <div
        className={`mb-1.5 min-h-[2.5rem] rounded-md border border-dashed px-2 py-1.5 transition ${
          dragOver
            ? 'border-violet-400 bg-violet-50'
            : 'border-slate-200 bg-slate-50/80'
        }`}
        data-testid="case-team-drop-tray"
        onDragOver={(e) => {
          e.preventDefault()
          e.dataTransfer.dropEffect = 'copy'
          setDragOver(true)
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDropTray}
      >
        <div className="mb-0.5 text-[9px] font-medium text-slate-400">
          讨论组托盘 · 拖入专家
        </div>
        {selected.size === 0 ? (
          <p className="text-[10px] text-slate-400">空 · 勾选或拖入</p>
        ) : (
          <div className="flex flex-wrap gap-1">
            {[...selected].map((id) => (
              <button
                key={id}
                type="button"
                className="rounded-full border border-violet-200 bg-violet-50 px-1.5 py-px text-[10px] text-violet-900"
                data-testid={`case-team-chip-${id}`}
                title="点击移出"
                onClick={() => toggle(id)}
              >
                {businessSeatLabel(id)} ×
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-1">
        <button
          type="button"
          onClick={applyRecommend}
          className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] font-medium text-slate-700 hover:bg-slate-100"
          data-testid="case-team-recommend"
        >
          一键采纳推荐
        </button>
        <button
          type="button"
          onClick={clear}
          className="rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] text-slate-500 hover:bg-slate-50"
          data-testid="case-team-clear"
        >
          清空
        </button>
        <Link
          to={`/agent/cases/${caseId}/room`}
          className="rounded border border-violet-200 bg-violet-50 px-1.5 py-0.5 text-[10px] font-medium text-violet-900 hover:bg-violet-100"
          data-testid="case-team-go-room"
        >
          进入讨论
        </Link>
      </div>
      {hint && (
        <p
          className="mt-1 text-[9px] text-emerald-700"
          data-testid="case-team-hint"
        >
          {hint}
        </p>
      )}
    </div>
  )
}
