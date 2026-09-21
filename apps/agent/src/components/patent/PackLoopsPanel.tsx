import { Link } from 'react-router-dom'
import {
  BUSINESS_SEED_IDS,
  useBusinessCases,
} from '../../business/BusinessCaseContext'
import { CaseProcessPanel } from '../business/CaseProcessPanel'
import { SELF_HEAL_MAX } from '../../business/packLoops'

/**
 * 专家工作台 · F5 环边样机面板（Knife1）
 * 可见：重试 n/3 · 附图退回撰写 · 需人工接手 · HITL④灰示意
 */
export function PackLoopsPanel() {
  const caseId = BUSINESS_SEED_IDS.B
  const { getCase, runLoopDemo } = useBusinessCases()
  const c = getCase(caseId)

  return (
    <div
      className="rounded-xl border border-violet-200 bg-violet-50/40 p-3 shadow-sm"
      data-testid="pack-loops-panel"
    >
      <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="text-xs font-semibold text-violet-900">
            F5 环边样机 · 内循环 + 跨席
          </h2>
          <p className="mt-0.5 text-[11px] text-violet-800/80">
            查新/撰写自修复≤{SELF_HEAL_MAX} · 超限「需人工接手」· 附图→撰写
            feedback · HITL 驳回带批注（无真沙箱）
          </p>
        </div>
        <Link
          to={`/agent/cases/${caseId}`}
          className="rounded-full border border-violet-300 bg-white px-2.5 py-0.5 text-[11px] font-medium text-violet-900"
          data-testid="pack-loops-open-case"
        >
          打开样机案子 · {c?.title ?? '传感校准套件'}
        </Link>
      </div>
      <div className="mb-2 flex flex-wrap gap-1.5">
        <button
          type="button"
          onClick={() => runLoopDemo(caseId, 'draft_heal')}
          className="btn-press focus-ring rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-950"
          data-testid="pack-loops-retry-demo"
        >
          演示重试 n/{SELF_HEAL_MAX}
        </button>
        <button
          type="button"
          onClick={() => runLoopDemo(caseId, 'figure_feedback')}
          className="btn-press focus-ring rounded-full border border-sky-300 bg-sky-50 px-2 py-0.5 text-[10px] font-semibold text-sky-950"
          data-testid="pack-loops-figure-demo"
        >
          附图退回撰写
        </button>
        <button
          type="button"
          onClick={() => runLoopDemo(caseId, 'draft_escalate')}
          className="btn-press focus-ring rounded-full border border-rose-300 bg-rose-50 px-2 py-0.5 text-[10px] font-semibold text-rose-950"
          data-testid="pack-loops-escalate-demo"
        >
          超{SELF_HEAL_MAX}次→需人工接手
        </button>
      </div>
      <CaseProcessPanel caseId={caseId} showDemos />
    </div>
  )
}
