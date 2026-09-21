import { useBusinessCases } from '../../business/BusinessCaseContext'
import { businessSeatLabel } from '../../business/businessSeats'
import type { ProcessLogEntry } from '../../business/packLoops'

type Props = {
  caseId: string
  /** 专家台可展示演示按钮；业务面默认只读过程 */
  showDemos?: boolean
}

function LogRow({ log }: { log: ProcessLogEntry }) {
  const tone =
    log.kind === 'escalate' || log.kind === 'oa_blocker'
      ? 'border-rose-200 bg-rose-50 text-rose-900'
      : log.kind === 'layout_gap' ||
          log.kind === 'layout_flywheel' ||
          log.kind === 'layout_pending' ||
          log.kind === 'monitor_event'
        ? 'border-teal-200 bg-teal-50 text-teal-950'
        : log.kind === 'figure_feedback' ||
            log.kind === 'hitl_return' ||
            log.kind === 'oa_round'
          ? 'border-amber-200 bg-amber-50 text-amber-950'
          : log.kind === 'oa_classify' ||
              log.kind === 'oa_subtask' ||
              log.kind === 'oa_submit'
            ? 'border-violet-200 bg-violet-50 text-violet-950'
            : log.muted
              ? 'border-slate-100 bg-slate-50 text-slate-400'
              : 'border-slate-100 bg-white text-slate-700'
  return (
    <li
      className={`rounded-lg border px-2.5 py-1.5 text-[11px] ${tone}`}
      data-testid={`process-log-${log.kind}`}
      data-muted={log.muted ? '1' : '0'}
      data-attempt={log.attempt ?? ''}
    >
      <div className="flex flex-wrap items-center gap-1.5">
        {log.seatId && (
          <span className="rounded bg-slate-100 px-1 text-[9px] text-slate-600">
            {businessSeatLabel(log.seatId)}
          </span>
        )}
        {typeof log.oaRound === 'number' && log.oaRound > 0 && (
          <span className="rounded bg-violet-100 px-1 text-[9px] font-semibold text-violet-900">
            第 {log.oaRound} 通
          </span>
        )}
        {typeof log.attempt === 'number' &&
          log.maxAttempts != null &&
          log.kind !== 'oa_blocker' && (
            <span className="rounded bg-amber-100 px-1 text-[9px] font-semibold text-amber-900">
              重试 {log.attempt}/{log.maxAttempts}
            </span>
          )}
        {log.kind === 'oa_blocker' && (
          <span className="rounded bg-rose-200 px-1 text-[9px] font-semibold text-rose-950">
            超范围 · 0 次自修复
          </span>
        )}
        {(log.kind === 'layout_flywheel' || log.kind === 'layout_pending') && (
          <span className="rounded bg-teal-200 px-1 text-[9px] font-semibold text-teal-950">
            F9→F3
          </span>
        )}
        {(log.kind === 'escalate' || log.kind === 'oa_blocker') && (
          <span className="rounded bg-rose-200 px-1 text-[9px] font-semibold text-rose-950">
            需人工接手
          </span>
        )}
        {log.muted && (
          <span className="rounded bg-slate-200 px-1 text-[9px] text-slate-500">
            示意（灰）
          </span>
        )}
        <span className="ml-auto text-[9px] text-slate-400">{log.at}</span>
      </div>
      <div className="mt-0.5 font-medium">{log.message}</div>
      {log.detail && (
        <div className="mt-0.5 text-[10px] opacity-80">{log.detail}</div>
      )}
    </li>
  )
}

/**
 * 办理过程 / 环边可见 · Knife1–3
 * 业务面人话；专家台可跑演示剧本
 */
export function CaseProcessPanel({ caseId, showDemos = false }: Props) {
  const { getProcessLogs, runLoopDemo } = useBusinessCases()
  const logs = getProcessLogs(caseId)

  return (
    <section
      className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
      data-testid="case-process-panel"
    >
      <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
        办理过程
      </h2>
      <p className="mb-2 text-[11px] text-slate-500">
        退回修改 / 再查一轮 / 检查重试 · 第 N 通 · 布局飞轮 · 超限需人工接手（样机）
      </p>

      {showDemos && (
        <div
          className="mb-3 flex flex-wrap gap-1.5"
          data-testid="case-process-demos"
        >
          {(
            [
              ['disclosure_ask', '交底追问'],
              ['research_heal', '查新自修复'],
              ['draft_heal', '撰写自修复'],
              ['draft_escalate', '超3次升级'],
              ['figure_feedback', '附图退回撰写'],
              ['research_pessimistic', '查新不乐观(灰)'],
              ['intake_low_score', '立项低分(灰)'],
              ['oa_inventive', 'OA·创造性+补充检索'],
              ['oa_clarity', 'OA·清楚性+修术语'],
              ['oa_strategy_reject', 'OA·策略驳回'],
              ['oa_round2', '第2通到达'],
              ['oa_blocker', '超范围blocker'],
              ['layout_flywheel', '飞轮·漏洞→待拍板'],
              ['layout_flywheel_biz', '飞轮·启用布局待确认'],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => runLoopDemo(caseId, key)}
              className="btn-press focus-ring rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-medium text-slate-700"
              data-testid={`loop-demo-${key}`}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {logs.length === 0 ? (
        <p className="text-xs text-slate-400" data-testid="case-process-empty">
          暂无过程行
        </p>
      ) : (
        <ul className="max-h-64 space-y-1.5 overflow-y-auto">
          {logs.map((log) => (
            <LogRow key={log.id} log={log} />
          ))}
        </ul>
      )}
    </section>
  )
}
