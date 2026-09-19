import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import type { AgentStep, AgentStepKind } from '@shared/types'
import { toolCatalogLabel } from '@shared/data/sessions'
import { TOOL_TO_COMMAND } from '@shared/domain/commands'

const KIND_LABEL: Record<AgentStepKind, string> = {
  thinking: '思考',
  tool_call: '办理动作',
  tool_result: '办理结果',
  artifact: '产物',
  question_to_human: '询问你',
  system: '系统',
}

const ARG_KEY_ZH: Record<string, string> = {
  query: '检索词',
  caseId: '案件',
  oaRound: 'OA 轮次',
  db: '数据库',
  limit: '条数',
  note: '备注',
  agencyId: '代理所',
}

function summarizeArgs(args?: Record<string, unknown>): string | null {
  if (!args || typeof args !== 'object') return null
  const parts: string[] = []
  for (const [k, v] of Object.entries(args)) {
    if (v == null || v === '') continue
    const label = ARG_KEY_ZH[k] ?? k
    const val = typeof v === 'object' ? JSON.stringify(v) : String(v)
    parts.push(`${label}：${val.length > 48 ? val.slice(0, 48) + '…' : val}`)
  }
  return parts.length ? parts.join('；') : null
}

/** Tool card success ≠ domain write. Labels: 未写库 · 缓冲 / 已写库 / 预览不写库 */
function toolWriteTag(
  step: AgentStep,
  later: AgentStep[],
  runMode: 'dry-run' | 'formal' | null,
): string | null {
  if (step.kind !== 'tool_call' && step.kind !== 'tool_result') return null
  if (!step.toolName) return null
  if (runMode === 'dry-run') return '预览不写库'
  const mapped = TOOL_TO_COMMAND[step.toolName]
  if (mapped == null) return '未写库 · 缓冲'
  const wrote = later.some(
    (s) =>
      s.kind === 'system' &&
      (s.title === '已写入领域' ||
        s.title.includes('已写入领域') ||
        s.content.includes('已写入领域')),
  )
  return wrote ? '已写库' : '未写库 · 缓冲'
}

function StepBubble({
  step,
  writeTag,
}: {
  step: AgentStep
  writeTag: string | null
}) {
  const isProse =
    step.kind === 'thinking' ||
    step.kind === 'question_to_human' ||
    step.kind === 'system'
  const isTool = step.kind === 'tool_call' || step.kind === 'tool_result'
  const isArtifact = step.kind === 'artifact'
  const [detailOpen, setDetailOpen] = useState(false)
  const [rawOpen, setRawOpen] = useState(false)
  const toolLabel = step.toolName ? toolCatalogLabel(step.toolName) : null
  const argSummary = summarizeArgs(
    step.toolArgs as Record<string, unknown> | undefined,
  )

  if (isProse) {
    const isQuestion = step.kind === 'question_to_human'
    return (
      <div
        className={`max-w-[42rem] px-1 py-1 ${
          isQuestion ? 'ml-0' : ''
        }`}
      >
        <div className="mb-0.5 flex items-baseline gap-2">
          <span
            className={`text-[10px] ${
              isQuestion ? 'font-medium text-amber-700' : 'text-slate-400'
            }`}
          >
            {KIND_LABEL[step.kind]}
          </span>
          <span className="text-[10px] text-slate-300">{step.at}</span>
        </div>
        {step.title && step.kind !== 'thinking' && (
          <div
            className={`text-sm ${
              isQuestion ? 'font-medium text-slate-900' : 'font-medium text-slate-700'
            }`}
          >
            {step.title}
          </div>
        )}
        <p
          className={`whitespace-pre-wrap text-sm leading-relaxed ${
            step.kind === 'thinking'
              ? 'text-slate-600'
              : isQuestion
                ? 'mt-0.5 text-slate-800'
                : 'mt-0.5 text-slate-600'
          }`}
        >
          {step.kind === 'thinking' && !step.content.startsWith(step.title)
            ? step.title
              ? `${step.title}\n${step.content}`
              : step.content
            : step.content}
        </p>
      </div>
    )
  }

  if (isTool) {
    const label = toolLabel ?? step.toolName ?? step.title
    return (
      <div className="max-w-[42rem] px-1 py-0.5">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
          <button
            type="button"
            onClick={() => setDetailOpen((v) => !v)}
            className="btn-press focus-ring inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-xs text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            aria-expanded={detailOpen}
          >
            <ChevronDown
              className={`h-3 w-3 text-slate-400 transition-transform ${
                detailOpen ? 'rotate-180' : ''
              }`}
              aria-hidden
            />
            <span className="text-slate-400">调用 ·</span>
            <span className="font-medium text-slate-700">{label}</span>
          </button>
          <span className="text-[10px] text-slate-300">{step.at}</span>
          {writeTag && (
            <span
              className={`text-[10px] ${
                writeTag === '已写库'
                  ? 'text-emerald-600/80'
                  : writeTag === '预览不写库'
                    ? 'text-amber-600/70'
                    : 'text-slate-300'
              }`}
            >
              {writeTag}
            </span>
          )}
        </div>
        {detailOpen && (
          <div className="mt-1 ml-4 space-y-1 border-l-2 border-slate-100 pl-2.5 text-xs text-slate-600">
            {step.title && step.title !== label && (
              <p className="font-medium text-slate-700">{step.title}</p>
            )}
            {step.content && (
              <p className="whitespace-pre-wrap leading-relaxed text-slate-500">
                {step.content}
              </p>
            )}
            {argSummary && (
              <p>
                <span className="text-slate-400">参数 · </span>
                {argSummary}
              </p>
            )}
            {step.toolResultPreview && (
              <p className="whitespace-pre-wrap leading-relaxed">
                <span className="text-slate-400">结果 · </span>
                {step.toolResultPreview.length > 200
                  ? step.toolResultPreview.slice(0, 200) + '…'
                  : step.toolResultPreview}
              </p>
            )}
            <button
              type="button"
              onClick={() => setRawOpen((v) => !v)}
              className="btn-press focus-ring text-[11px] text-slate-400 hover:text-slate-600"
              aria-expanded={rawOpen}
            >
              {rawOpen ? '收起原始数据' : '原始数据'}
            </button>
            {rawOpen && (
              <div className="overflow-hidden rounded border border-slate-200 bg-slate-50">
                {step.toolArgs && (
                  <pre className="overflow-x-auto px-2.5 py-1.5 font-mono text-[11px] text-slate-600">
                    {JSON.stringify(step.toolArgs, null, 2)}
                  </pre>
                )}
                {step.toolResultPreview && (
                  <pre className="overflow-x-auto border-t border-slate-200 px-2.5 py-1.5 font-mono text-[11px] text-slate-600">
                    {step.toolResultPreview}
                  </pre>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  // artifact — Deep W6 surface card (visual only)
  return (
    <div className="agent-timeline-artifact">
      <div className="mb-0.5 flex items-baseline gap-2">
        <span className="text-[10px] font-medium uppercase tracking-wide text-slate-500">
          {KIND_LABEL[step.kind]}
        </span>
        <span className="tabular text-[10px] text-slate-300">{step.at}</span>
        {writeTag && (
          <span className="ml-auto text-[10px] text-slate-300">{writeTag}</span>
        )}
      </div>
      <div className="text-balance text-sm font-semibold tracking-tight text-slate-900">
        {step.title}
      </div>
      <p className="mt-0.5 whitespace-pre-wrap text-pretty text-xs leading-relaxed text-slate-600">
        {step.content}
      </p>
      {isArtifact && null}
    </div>
  )
}

type Props = {
  steps: AgentStep[]
  playing: boolean
  bottomRef: React.RefObject<HTMLDivElement | null>
  runMode?: 'dry-run' | 'formal' | null
}


type TimelineItem =
  | { type: 'single'; step: AgentStep; index: number }
  | {
      type: 'tool_group'
      toolKey: string
      label: string
      steps: { step: AgentStep; index: number }[]
    }

function toolKeyOf(step: AgentStep): string {
  return step.toolName || step.title || step.id
}

/** SS-S-S3-1 · merge consecutive tool_call/tool_result with same tool into one expandable group */
function groupTimelineSteps(steps: AgentStep[]): TimelineItem[] {
  const items: TimelineItem[] = []
  let i = 0
  while (i < steps.length) {
    const s = steps[i]
    if (s.kind === 'tool_call' || s.kind === 'tool_result') {
      const key = toolKeyOf(s)
      const group: { step: AgentStep; index: number }[] = [{ step: s, index: i }]
      let j = i + 1
      while (j < steps.length) {
        const n = steps[j]
        if (
          (n.kind === 'tool_call' || n.kind === 'tool_result') &&
          toolKeyOf(n) === key
        ) {
          group.push({ step: n, index: j })
          j++
        } else break
      }
      if (group.length > 1) {
        const label =
          toolCatalogLabel(key) ||
          group[0].step.title ||
          key
        items.push({ type: 'tool_group', toolKey: key, label, steps: group })
      } else {
        items.push({ type: 'single', step: s, index: i })
      }
      i = j
    } else {
      items.push({ type: 'single', step: s, index: i })
      i++
    }
  }
  return items
}

function ToolGroupBubble({
  label,
  items,
  allSteps,
  runMode,
}: {
  label: string
  items: { step: AgentStep; index: number }[]
  allSteps: AgentStep[]
  runMode: 'dry-run' | 'formal' | null
}) {
  const [open, setOpen] = useState(false)
  return (
    <div className="max-w-[42rem] px-1 py-0.5" data-testid="timeline-tool-group">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="btn-press focus-ring inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-xs text-slate-600 hover:bg-slate-50 hover:text-slate-900"
        aria-expanded={open}
      >
        <ChevronDown
          className={`h-3 w-3 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`}
          aria-hidden
        />
        <span className="text-slate-400">调用组 ·</span>
        <span className="font-medium text-slate-700">{label}</span>
        <span className="tabular-nums text-slate-400">×{items.length}</span>
      </button>
      {open ? (
        <div className="mt-1 ml-3 space-y-1 border-l-2 border-slate-100 pl-2">
          {items.map(({ step, index }) => (
            <StepBubble
              key={step.id}
              step={step}
              writeTag={toolWriteTag(step, allSteps.slice(index + 1), runMode)}
            />
          ))}
        </div>
      ) : (
        <p className="ml-6 mt-0.5 text-[11px] text-slate-400">
          {items.length} 次同类办理 · 默认折叠细节
        </p>
      )}
    </div>
  )
}

export function SessionTimeline({
  steps,
  playing,
  bottomRef,
  runMode = null,
}: Props) {
  /* SS-M-S2-1 · hollow when empty or only seed system rows */
  const hollow =
    !playing &&
    (steps.length === 0 || steps.every((s) => s.kind === 'system'))
  return (
    <div className="min-h-0 flex-1 space-y-1.5 overflow-y-auto px-4 py-5 lg:px-6" data-testid="session-timeline-scroller">
      {hollow ? (
        <div
          className="mx-auto max-w-md px-2 py-8 text-center"
          data-testid="session-timeline-empty"
          role="status"
        >
          <p className="text-sm font-medium text-slate-700">还没有办理轨迹</p>
          <p className="mt-2 text-xs leading-relaxed text-slate-500">
            下一步：在底部确认目标后点「启动」，系统会按步骤推进并在需要时请你确认。
          </p>
        </div>
      ) : null}
      {groupTimelineSteps(steps).map((item) =>
        item.type === 'tool_group' ? (
          <ToolGroupBubble
            key={`g-${item.toolKey}-${item.steps[0].step.id}`}
            label={item.label}
            items={item.steps}
            allSteps={steps}
            runMode={runMode}
          />
        ) : (
          <StepBubble
            key={item.step.id}
            step={item.step}
            writeTag={toolWriteTag(item.step, steps.slice(item.index + 1), runMode)}
          />
        ),
      )}
      {playing && (
        <div className="flex items-center gap-2 px-1 text-xs text-slate-500">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-slate-400" />
          正在处理…
        </div>
      )}
      <div ref={bottomRef} />
    </div>
  )
}
