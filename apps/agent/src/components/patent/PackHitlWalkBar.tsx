import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Play, ChevronRight } from 'lucide-react'
import { useProjectFolder } from '../../projects/ProjectFolderContext'
import {
  MAIN_CHAIN_STORY,
  PACK_DEMO_PROJECT_ID,
  PACK_HITL_WALK_SEATS,
} from '../../projects/pack/patentHitlWalk'
import { mockValidate } from '../../projects/pack/patentValidator'
import { packHitlForSeat } from '../../projects/pack/patentHitl8'
import type { ProjectExpertId } from '../../projects/types'

type Props = {
  compact?: boolean
}

/**
 * Catalog / workspace · 「打开演示项目 → 按序推进」或一键演示 HITL①–⑥
 */
export function PackHitlWalkBar({ compact }: Props) {
  const navigate = useNavigate()
  const {
    jumpToStep,
    setThreadHitl,
    appendMessage,
    patchProject,
    getProject,
    getThread,
  } = useProjectFolder()
  const [busy, setBusy] = useState(false)
  const [cursor, setCursor] = useState(0)
  const [log, setLog] = useState<string[]>([])

  const ensureDemo = () => {
    const p = getProject(PACK_DEMO_PROJECT_ID)
    if (p && !p.caseId) {
      patchProject(PACK_DEMO_PROJECT_ID, {
        caseId: 'case-mock-pack-hf',
        caseBindState: 'bound',
      })
    }
  }

  const runOne = (seatId: ProjectExpertId, label: string, stepId: string) => {
    jumpToStep(PACK_DEMO_PROJECT_ID, seatId, stepId)
    const fail = mockValidate(seatId, 1)
    appendMessage(PACK_DEMO_PROJECT_ID, seatId, {
      role: 'system',
      content: `【演示】样机校验未过×${fail.issues.length} → 自修复…`,
      meta: { backend: 'mock' },
    })
    const pass = mockValidate(seatId, 2)
    const pack = packHitlForSeat(seatId)
    if (pass.pass && pack) {
      setThreadHitl(PACK_DEMO_PROJECT_ID, seatId, true, pack.gate)
      appendMessage(PACK_DEMO_PROJECT_ID, seatId, {
        role: 'system',
        content: `【演示】样机校验通过 → 已到确认点（${label} / ${pack.gate}）· 可确认`,
        meta: { backend: 'mock' },
      })
    }
  }

  const openDemo = () => {
    ensureDemo()
    navigate(`/agent/projects/${PACK_DEMO_PROJECT_ID}/bots/orchestrator`)
  }

  const advanceNext = () => {
    ensureDemo()
    if (cursor >= PACK_HITL_WALK_SEATS.length) {
      setLog((L) => [...L, '①–⑥ 已走完 · 可进⑦⑧后置席或 OA 示意'])
      return
    }
    const row = PACK_HITL_WALK_SEATS[cursor]!
    runOne(row.seatId, row.label, row.hitlStepId)
    setLog((L) => [
      ...L,
      `HITL${['①', '②', '③', '④', '⑤', '⑥'][row.n - 1]} ${row.label} · ${row.seatId}`,
    ])
    setCursor((c) => c + 1)
    navigate(`/agent/projects/${PACK_DEMO_PROJECT_ID}/bots/${row.seatId}`)
  }

  const runAll = async () => {
    if (busy) return
    setBusy(true)
    ensureDemo()
    setLog(['一键演示 HITL①–⑥ 开始…'])
    for (let i = 0; i < PACK_HITL_WALK_SEATS.length; i++) {
      const row = PACK_HITL_WALK_SEATS[i]!
      runOne(row.seatId, row.label, row.hitlStepId)
      setLog((L) => [
        ...L,
        `HITL${['①', '②', '③', '④', '⑤', '⑥'][row.n - 1]} ${row.label} · Pass→HITL`,
      ])
      setCursor(i + 1)
      await new Promise((r) => setTimeout(r, 180))
    }
    setLog((L) => [
      ...L,
      '完成 · 打开任一席可见 Confirm；主链至少检索→立项→交底→撰写→OA 已点通',
    ])
    setBusy(false)
    navigate(`/agent/projects/${PACK_DEMO_PROJECT_ID}/bots/expert-research`)
  }

  const readyCount = PACK_HITL_WALK_SEATS.filter((s) =>
    getThread(PACK_DEMO_PROJECT_ID, s.seatId)?.pendingHitl,
  ).length

  return (
    <div
      className={
        compact
          ? 'rounded-lg border border-emerald-200 bg-emerald-50/50 p-2'
          : 'mt-3 rounded-xl border border-emerald-200 bg-white p-3 shadow-sm'
      }
      data-testid="pack-hitl-walk-bar"
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-emerald-900">
          主链演示 · HITL①–⑥
        </span>
        <span className="text-[10px] text-slate-500">{MAIN_CHAIN_STORY}</span>
        {readyCount > 0 && (
          <span className="rounded bg-amber-100 px-1.5 text-[9px] font-semibold text-amber-900">
            已到 {readyCount}/6
          </span>
        )}
      </div>
      <div className="mt-2 flex flex-wrap gap-1.5">
        <button
          type="button"
          onClick={openDemo}
          className="btn-press focus-ring inline-flex items-center gap-1 rounded-md border border-violet-300 bg-violet-50 px-2.5 py-1 text-[11px] font-semibold text-violet-900"
          data-testid="pack-open-demo"
        >
          打开演示项目
        </button>
        <button
          type="button"
          onClick={advanceNext}
          className="btn-press focus-ring inline-flex items-center gap-1 rounded-md border border-emerald-400 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-950"
          data-testid="pack-walk-next"
        >
          <ChevronRight className="h-3 w-3" aria-hidden />
          按序推进
          {cursor < PACK_HITL_WALK_SEATS.length
            ? ` · 下一闸 ${['①', '②', '③', '④', '⑤', '⑥'][cursor]}`
            : ' · 已完'}
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => void runAll()}
          className="btn-press focus-ring inline-flex items-center gap-1 rounded-md bg-slate-900 px-2.5 py-1 text-[11px] font-semibold text-white disabled:opacity-50"
          data-testid="pack-walk-all"
        >
          <Play className="h-3 w-3" aria-hidden />
          {busy ? '演示中…' : '一键演示①–⑥'}
        </button>
        <Link
          to={`/agent/seats/expert-annuity`}
          className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] text-slate-600"
        >
          后置⑦年费
        </Link>
        <Link
          to={`/agent/seats/expert-monetize`}
          className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] text-slate-600"
        >
          后置⑧转化
        </Link>
      </div>
      {log.length > 0 && (
        <ul
          className="mt-2 max-h-20 space-y-0.5 overflow-y-auto font-mono text-[9px] text-slate-600"
          data-testid="pack-walk-log"
        >
          {log.map((line, i) => (
            <li key={`${i}-${line}`}>{line}</li>
          ))}
        </ul>
      )}
    </div>
  )
}
