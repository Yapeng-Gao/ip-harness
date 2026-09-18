import { Send } from 'lucide-react'
import { AGENT_CATALOG, AGENT_TIER_LABEL } from '@shared/data/agents'
import type { PatentCase } from '@shared/types'

type Props = {
  goal: string
  onGoalChange: (v: string) => void
  agentPick: string
  onAgentPickRequest: (nextAgentId: string) => void
  casePick: string
  onCasePick: (caseId: string) => void
  visibleCases: PatentCase[]
  composerRef: React.RefObject<HTMLTextAreaElement | null>
  caseSelectRef: React.RefObject<HTMLSelectElement | null>
  onSubmit: () => void
  pendingAgentSwitch: { id: string; reason?: string } | null
  onConfirmAgentSwitch: () => void
  onCancelAgentSwitch: () => void
  hitlActive?: boolean
  /** R-P1-3 · 仅复述 Confirm 主因 */
  hitlDisableReason?: string | null
}

export function SessionComposer({
  goal,
  onGoalChange,
  agentPick,
  onAgentPickRequest,
  casePick,
  onCasePick,
  visibleCases,
  composerRef,
  caseSelectRef,
  onSubmit,
  pendingAgentSwitch,
  onConfirmAgentSwitch,
  onCancelAgentSwitch,
  hitlActive = false,
  hitlDisableReason = null,
}: Props) {
  return (
    <div className="shrink-0 border-t border-slate-200/90 bg-white px-4 py-3.5 shadow-[0_-4px_16px_rgba(15,23,42,0.04)] lg:px-5 lg:py-4">
      {pendingAgentSwitch && (
        <div className="mx-auto mb-2 flex max-w-3xl flex-wrap items-center gap-2 border-l-4 border-l-amber-500 bg-amber-50/60 px-3 py-2 text-xs text-slate-800">
          <span className="min-w-0 flex-1">换人后要重新确认，继续？</span>
          <button
            type="button"
            onClick={onConfirmAgentSwitch}
            className="btn-press focus-ring rounded-md bg-slate-900 px-2.5 py-1 text-xs font-medium text-white hover:bg-slate-800"
          >
            继续
          </button>
          <button
            type="button"
            onClick={onCancelAgentSwitch}
            className="btn-press focus-ring rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-700"
          >
            取消
          </button>
        </div>
      )}
      <div className="mx-auto max-w-3xl overflow-hidden rounded-[var(--radius-lg)] border border-slate-200 bg-white shadow-[var(--shadow-rest)] focus-within:border-slate-400">
        <textarea
          ref={composerRef}
          value={goal}
          onChange={(e) => onGoalChange(e.target.value)}
          rows={2}
          aria-label="会话目标输入"
          placeholder="描述要办的事… 例如：对固态电解质配方做现有技术检索并输出结论"
          className="focus-ring w-full resize-none bg-transparent px-3.5 pt-3 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus-visible:rounded-[var(--radius-md)]"
          disabled={hitlActive}
        />
        <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 px-3 py-2.5">
          <select
            value={agentPick}
            onChange={(e) => onAgentPickRequest(e.target.value)}
            className="ui-input ui-input-sm focus-ring w-auto"
            aria-label="选择 Agent"
          >
            <option value="auto">自动匹配</option>
            {AGENT_CATALOG.map((a) => (
              <option key={a.id} value={a.id}>
                {AGENT_TIER_LABEL[a.tier]} · {a.name}
              </option>
            ))}
          </select>
          <select
            ref={caseSelectRef}
            value={casePick}
            onChange={(e) => onCasePick(e.target.value)}
            className="ui-input ui-input-sm focus-ring max-w-[180px] truncate w-auto"
            aria-label="关联案件"
          >
            <option value="">案件 · 未关联</option>
            {visibleCases.map((cs) => (
              <option key={cs.id} value={cs.id}>
                {cs.title}
              </option>
            ))}
          </select>
          {hitlActive ? (
            <span className="agent-confirm-cta-wrap ml-auto">
              <button
                type="button"
                disabled
                title={hitlDisableReason ?? '请先完成上方确认步骤'}
                aria-label="确认完成后再办理"
                aria-describedby="agent-confirm-reason-composer"
                className="ui-btn ui-btn-sm ui-btn-primary agent-confirm-cta"
              >
                <Send className="h-3.5 w-3.5" aria-hidden /> 确认完成后再办理
              </button>
              <span
                id="agent-confirm-reason-composer"
                className="agent-confirm-reason"
                role="status"
              >
                {hitlDisableReason ?? '请先完成上方确认步骤'}
              </span>
            </span>
          ) : (
            <button
              type="button"
              onClick={onSubmit}
              className="ui-btn ui-btn-sm ui-btn-primary btn-press focus-ring cta-work ml-auto"
            >
              <Send className="h-3.5 w-3.5" /> 启动
            </button>
          )}
        </div>
      </div>
      <p className="mx-auto mt-1.5 max-w-3xl text-center text-[11px] text-slate-400">
        办理结果会写回业务台账（演示）
      </p>
    </div>
  )
}
