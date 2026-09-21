import { Link } from 'react-router-dom'
import {
  BUSINESS_SEED_IDS,
  useBusinessCases,
} from '../../business/BusinessCaseContext'
import { CaseProcessPanel } from '../business/CaseProcessPanel'
import {
  OA_BLOCKER_SELF_HEAL_MAX,
  SELF_HEAL_MAX,
} from '../../business/packLoops'

/**
 * 专家工作台 · F5/F6/F9→F3 环边样机面板（Knife1–3）
 * F5：重试 n/3 · 附图退回 · 需人工接手
 * F6：N 通计数 · 策略驳回 · 超范围 0 次自修复
 * F9→F3：布局漏洞回流 → 布局待拍板（≠ FTO）
 */
export function PackLoopsPanel() {
  const caseIdF5 = BUSINESS_SEED_IDS.B
  const caseIdF6 = BUSINESS_SEED_IDS.C
  const caseIdF9 = BUSINESS_SEED_IDS.D
  const { getCase, getProgress, runLoopDemo } = useBusinessCases()
  const c5 = getCase(caseIdF5)
  const c6 = getCase(caseIdF6)
  const c9 = getCase(caseIdF9)
  const p6 = getProgress(caseIdF6)
  const p9 = getProgress(caseIdF9)

  return (
    <div className="space-y-3" data-testid="pack-loops-panel">
      <div
        className="rounded-xl border border-violet-200 bg-violet-50/40 p-3 shadow-sm"
        data-testid="pack-loops-f5"
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
            to={`/agent/cases/${caseIdF5}`}
            className="rounded-full border border-violet-300 bg-white px-2.5 py-0.5 text-[11px] font-medium text-violet-900"
            data-testid="pack-loops-open-case"
          >
            打开样机案子 · {c5?.title ?? '传感校准套件'}
          </Link>
        </div>
        <div className="mb-2 flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => runLoopDemo(caseIdF5, 'draft_heal')}
            className="btn-press focus-ring rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-950"
            data-testid="pack-loops-retry-demo"
          >
            演示重试 n/{SELF_HEAL_MAX}
          </button>
          <button
            type="button"
            onClick={() => runLoopDemo(caseIdF5, 'figure_feedback')}
            className="btn-press focus-ring rounded-full border border-sky-300 bg-sky-50 px-2 py-0.5 text-[10px] font-semibold text-sky-950"
            data-testid="pack-loops-figure-demo"
          >
            附图退回撰写
          </button>
          <button
            type="button"
            onClick={() => runLoopDemo(caseIdF5, 'draft_escalate')}
            className="btn-press focus-ring rounded-full border border-rose-300 bg-rose-50 px-2 py-0.5 text-[10px] font-semibold text-rose-950"
            data-testid="pack-loops-escalate-demo"
          >
            超{SELF_HEAL_MAX}次→需人工接手
          </button>
        </div>
        <CaseProcessPanel caseId={caseIdF5} showDemos />
      </div>

      <div
        className="rounded-xl border border-orange-200 bg-orange-50/40 p-3 shadow-sm"
        data-testid="pack-loops-f6"
      >
        <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
          <div>
            <h2 className="text-xs font-semibold text-orange-950">
              F6 OA · N 通外循环
            </h2>
            <p className="mt-0.5 text-[11px] text-orange-900/80">
              理由分类 · 子任务汇入 · HITL⑥ 策略确认/驳回 · 第 N 通计数 ·
              超范围 blocker（自修复 {OA_BLOCKER_SELF_HEAL_MAX} 次）· 无真局端
            </p>
            <p
              className="mt-1 text-[11px] font-semibold text-orange-950"
              data-testid="pack-loops-oa-round"
            >
              当前样机：第 {p6.oaRound || 0} 通
              {p6.filed ? ' · 已递交' : ' · 未递交（锁定）'}
            </p>
          </div>
          <Link
            to={`/agent/cases/${caseIdF6}`}
            className="rounded-full border border-orange-300 bg-white px-2.5 py-0.5 text-[11px] font-medium text-orange-950"
            data-testid="pack-loops-open-oa-case"
          >
            打开审查答复案子 · {c6?.title ?? '边缘散热结构'}
          </Link>
        </div>
        <div className="mb-2 flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => runLoopDemo(caseIdF6, 'oa_inventive')}
            className="btn-press focus-ring rounded-full border border-violet-300 bg-violet-50 px-2 py-0.5 text-[10px] font-semibold text-violet-950"
            data-testid="pack-loops-oa-inventive"
          >
            创造性 + 补充检索
          </button>
          <button
            type="button"
            onClick={() => runLoopDemo(caseIdF6, 'oa_clarity')}
            className="btn-press focus-ring rounded-full border border-sky-300 bg-sky-50 px-2 py-0.5 text-[10px] font-semibold text-sky-950"
            data-testid="pack-loops-oa-clarity"
          >
            清楚性 + 修术语
          </button>
          <button
            type="button"
            onClick={() => runLoopDemo(caseIdF6, 'oa_strategy_reject')}
            className="btn-press focus-ring rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-950"
            data-testid="pack-loops-oa-reject"
          >
            策略驳回重做
          </button>
          <button
            type="button"
            onClick={() => runLoopDemo(caseIdF6, 'oa_round2')}
            className="btn-press focus-ring rounded-full border border-orange-400 bg-orange-100 px-2 py-0.5 text-[10px] font-semibold text-orange-950"
            data-testid="pack-loops-oa-round2"
          >
            第 2 通到达
          </button>
          <button
            type="button"
            onClick={() => runLoopDemo(caseIdF6, 'oa_blocker')}
            className="btn-press focus-ring rounded-full border border-rose-300 bg-rose-50 px-2 py-0.5 text-[10px] font-semibold text-rose-950"
            data-testid="pack-loops-oa-blocker"
          >
            超范围→需人工接手
          </button>
        </div>
        <CaseProcessPanel caseId={caseIdF6} showDemos />
      </div>

      <div
        className="rounded-xl border border-teal-200 bg-teal-50/40 p-3 shadow-sm"
        data-testid="pack-loops-f9"
      >
        <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
          <div>
            <h2 className="text-xs font-semibold text-teal-950">
              F9→F3 飞轮 · 布局漏洞回流
            </h2>
            <p className="mt-0.5 text-[11px] text-teal-900/80">
              维权/监测 mock → 布局漏洞报告 feedback → 布局策略师（F3）·
              串联查新不乐观 / 立项低分灰回流 · 无真爬虫 ·{' '}
              <span className="font-semibold">≠ FTO（expert-fto）</span>
            </p>
            <p
              className="mt-1 text-[11px] font-semibold text-teal-950"
              data-testid="pack-loops-layout-status"
            >
              样机案子：
              {p9.moreSeatIds.includes('expert-layout')
                ? '已启用布局 · 业务面可出「请确认布局调整」'
                : '未启用布局 · 仅专家台故事线'}
            </p>
          </div>
          <Link
            to={`/agent/cases/${caseIdF9}`}
            className="rounded-full border border-teal-300 bg-white px-2.5 py-0.5 text-[11px] font-medium text-teal-950"
            data-testid="pack-loops-open-layout-case"
          >
            打开飞轮案子 · {c9?.title ?? '空白点补局'}
          </Link>
        </div>
        <div className="mb-2 flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => runLoopDemo(caseIdF9, 'layout_flywheel')}
            className="btn-press focus-ring rounded-full border border-teal-400 bg-teal-100 px-2 py-0.5 text-[10px] font-semibold text-teal-950"
            data-testid="pack-loops-flywheel-demo"
          >
            布局漏洞回流→布局待拍板
          </button>
          <button
            type="button"
            onClick={() => runLoopDemo(caseIdF5, 'layout_flywheel')}
            className="btn-press focus-ring rounded-full border border-slate-300 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold text-slate-700"
            data-testid="pack-loops-flywheel-expert-only"
          >
            未启用布局·仅专家台
          </button>
          <button
            type="button"
            onClick={() => runLoopDemo(caseIdF9, 'research_pessimistic')}
            className="btn-press focus-ring rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-medium text-slate-500"
            data-testid="pack-loops-pessimistic"
          >
            查新不乐观(灰)
          </button>
          <button
            type="button"
            onClick={() => runLoopDemo(caseIdF9, 'intake_low_score')}
            className="btn-press focus-ring rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-medium text-slate-500"
            data-testid="pack-loops-low-score"
          >
            立项低分回流(灰)
          </button>
        </div>
        <CaseProcessPanel caseId={caseIdF9} showDemos />
      </div>
    </div>
  )
}
