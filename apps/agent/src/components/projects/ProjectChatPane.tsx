import { useMemo, useState, type KeyboardEvent } from 'react'
import { Send, ChevronRight } from 'lucide-react'
import { useProjectFolder } from '../../projects/ProjectFolderContext'
import {
  expertAccentClass,
  getProjectExpert,
  isOrchestratorExpert,
} from '../../projects/experts'
import type {
  ProjectDispatchExpertId,
  ProjectExpertId,
} from '../../projects/types'
import { ExpertHitlBridge } from './ExpertHitlBridge'
import { SeatMarkdownBody } from '../business/SeatMarkdownBody'
import {
  humanizeToolBubble,
  parseRewindIntent,
  projectToolLabel,
} from '../../lib/stepChatFormat'

type Props = {
  projectId: string
  expertId: ProjectExpertId
  caseId?: string
}

export function ProjectChatPane({ projectId, expertId, caseId }: Props) {
    const {
    getProject,
    getThread,
    appendMessage,
    advanceStep,
    rewindToStep,
    jumpToStep,
    dispatchToExpert,
    reportToProject,
    runL3Demo,
    runL3FullChain,
    fullChainBusy,
  } = useProjectFolder()
  const project = getProject(projectId)
  const isPatentL3 =
    !!project &&
    (project.kind === 'domain' || project.domainPackId === 'patent')
  const expert = getProjectExpert(expertId)
  const thread = getThread(projectId, expertId)
  const showDomainSteps =
    project?.kind === 'domain' || project?.domainPackId === 'patent'
  const [draft, setDraft] = useState('')

  const steps = expert.steps
  const stepIndex = thread?.stepIndex ?? 0

  const toolCards = useMemo(() => {
    const cur = steps[stepIndex]
    return expert.tools.map((t) => ({
      name: t,
      active: cur?.tool?.name === t,
      preview: cur?.tool?.name === t ? cur.tool.preview : undefined,
    }))
  }, [expert.tools, steps, stepIndex])

  if (!thread) {
    return (
      <div className="flex flex-1 items-center justify-center text-sm text-slate-500">
        线程未就绪
      </div>
    )
  }

  const sendUser = () => {
    const text = draft.trim()
    if (!text) return
    appendMessage(projectId, expertId, {
      role: 'user',
      content: text,
      meta: { backend: 'mock' },
    })
    setDraft('')
    if (isOrchestratorExpert(expertId)) {
      appendMessage(projectId, expertId, {
        role: 'assistant',
        content:
          '【总控】收到。请用下方「分派给…」快捷下发任务；我不会替专家跑领域剧本。',
        meta: { backend: 'mock' },
      })
      return
    }
    const rewind = parseRewindIntent(text, steps)
    if (rewind) {
      const r = rewindToStep(projectId, expertId, rewind.stepIndex)
      if (!r.ok) {
        appendMessage(projectId, expertId, {
          role: 'assistant',
          content:
            r.reason === 'forward'
              ? `还没走到第 ${rewind.stepIndex + 1} 步，只能回到已经做过的步骤。`
              : '没法回到那一步，请点上方已完成的步骤。',
          meta: { backend: 'mock' },
        })
      }
      return
    }
    advanceStep(projectId, expertId)
  }

  const onKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault()
      sendUser()
    }
  }

  const onShortcut = (id: string) => {
    const sc = expert.shortcuts.find((s) => s.id === id)
    if (!sc) return
    if (sc.action === 'report' && !isOrchestratorExpert(expertId)) {
      reportToProject({
        projectId,
        fromExpertId: expertId as ProjectDispatchExpertId,
      })
      return
    }
    if (sc.action === 'dispatch_hint' && sc.hint && isOrchestratorExpert(expertId)) {
      const to = sc.hint as ProjectDispatchExpertId
      dispatchToExpert({
        projectId,
        toExpertId: to,
        summary: draft.trim() || `请推进「${getProjectExpert(to).specialty}」并回报`,
      })
      setDraft('')
      return
    }
    if ((sc.action === 'jump' || sc.action === 'advance') && sc.stepId) {
      jumpToStep(projectId, expertId, sc.stepId)
      return
    }
    if (sc.action === 'advance') {
      advanceStep(projectId, expertId)
    }
  }

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      <header
        className="project-chat-header shrink-0 border-b border-slate-200 bg-white px-4 py-1.5"
        data-testid={`project-chat-${expertId}`}
      >
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`rounded border px-2 py-0.5 text-xs font-semibold ${expertAccentClass(expert.accent)}`}
          >
            {expert.name}
          </span>
          <span className="text-xs text-slate-500">{expert.specialty}</span>
          {expert.ownerLabel ? (
            <span className="rounded border border-slate-200 bg-slate-50 px-1.5 py-px text-[10px] text-slate-500">
              Owner · {expert.ownerLabel}
            </span>
          ) : null}
          {isPatentL3 && isOrchestratorExpert(expertId) ? (
            <div className="ml-auto flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                data-testid="l3-demo-btn"
                className="btn-press focus-ring rounded-full border border-violet-300 bg-violet-50 px-2.5 py-0.5 text-[11px] font-semibold text-violet-800 hover:bg-violet-100"
                onClick={() => runL3Demo(projectId)}
              >
                演示 L3
              </button>
              <button
                type="button"
                data-testid="l3-fullchain-btn"
                disabled={fullChainBusy}
                className="btn-press focus-ring rounded-full border border-emerald-400 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-900 hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
                onClick={() => runL3FullChain(projectId)}
              >
                {fullChainBusy ? '全链路进行中…' : '演示全链路'}
              </button>
            </div>
          ) : null}
        </div>
        <p className="mt-1 text-[11px] text-slate-500">{expert.description}</p>

        {/* Domain step bar — patent/domain only; general has no patent steps */}
        {showDomainSteps ? (
          <ol
            className="mt-2 flex flex-wrap gap-1"
            aria-label="领域步骤条"
            data-testid="domain-step-bar"
          >
            {steps.map((s, i) => (
              <li key={s.id}>
                <button
                  type="button"
                  disabled={i > stepIndex}
                  onClick={() => {
                    if (i > stepIndex) return
                    rewindToStep(projectId, expertId, i)
                  }}
                  className={`btn-press focus-ring inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] ${
                    i === stepIndex
                      ? 'border-slate-900 bg-slate-900 text-white'
                      : i < stepIndex
                        ? 'border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                        : 'cursor-default border-slate-200 bg-white text-slate-400 opacity-70'
                  }`}
                  title={
                    i > stepIndex
                      ? '尚未到达'
                      : i === stepIndex
                        ? `重跑「${s.label}」`
                        : `回到「${s.label}」修改`
                  }
                >
                  {i < stepIndex ? '✓' : i + 1}
                  {s.label}
                  {s.triggersHitl ? ' · 待确认' : ''}
                </button>
                {i < steps.length - 1 && (
                  <ChevronRight
                    className="mx-0.5 inline h-3 w-3 text-slate-300"
                    aria-hidden
                  />
                )}
              </li>
            ))}
          </ol>
        ) : (
          <p
            className="mt-2 text-[11px] text-slate-400"
            data-testid="general-no-patent-steps"
          >
            通用项目 · 无专利步骤条（协作剧本仍可推进）
          </p>
        )}
      </header>

      {/* Tool cards · AFE-M-1 Chinese primary + button hit ≥40 */}
      <div className="project-tool-band shrink-0 border-b border-slate-100 bg-slate-50/80 px-3 py-1.5">
        <div className="mb-1 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
          <span>工具卡</span>
          <details className="font-normal normal-case tracking-normal">
            <summary className="btn-press focus-ring cursor-pointer rounded px-1 text-[10px] text-slate-400 hover:text-slate-600">
              高级说明
            </summary>
            <p className="mt-1 max-w-sm text-[11px] font-normal normal-case text-slate-500">
              本席能力以中文名称展示；内部标识仅供调试。
            </p>
          </details>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {toolCards.map((t) => (
            <button
              key={t.name}
              type="button"
              title={projectToolLabel(t.name)}
              aria-label={projectToolLabel(t.name)}
              aria-pressed={t.active}
              className={`btn-press focus-ring hit-40 inline-flex max-w-[16rem] flex-col items-start justify-center rounded-md border px-2.5 text-left text-xs ${
                t.active
                  ? 'border-sky-300 bg-sky-50 text-sky-900'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-white'
              }`}
            >
              <span className="font-medium leading-tight">{projectToolLabel(t.name)}</span>
              {t.preview && (
                <span className="mt-0.5 max-w-full truncate text-[10px] font-normal text-slate-500">
                  {t.preview}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className="project-chat-messages min-h-0 flex-1 space-y-2 overflow-y-auto px-4 py-2">
        {thread.messages.map((m) => {
          const toolUi =
            m.role === 'tool'
              ? humanizeToolBubble(m.content, m.meta?.toolName)
              : null
          return (
          <div
            key={m.id}
            className={`max-w-[90%] rounded-lg px-3 py-2 text-sm leading-relaxed ${
              m.role === 'user'
                ? 'ml-auto bg-slate-900 text-white'
                : m.role === 'tool'
                  ? 'border border-sky-200 bg-sky-50 text-sky-950'
                  : m.role === 'system'
                    ? 'border border-slate-200 bg-slate-50 text-xs text-slate-600'
                    : 'border border-slate-200 bg-white text-slate-800'
            }`}
          >
            {toolUi ? (
              <div className="mb-0.5 text-[10px] font-semibold text-sky-700">
                本步产出 · {toolUi.title}
              </div>
            ) : null}
            {m.role === 'assistant' ? (
              <SeatMarkdownBody className="max-h-72 p-0 text-[13px]">
                {m.content}
              </SeatMarkdownBody>
            ) : toolUi ? (
              <p className="text-[13px] leading-relaxed">{toolUi.body}</p>
            ) : (
              <div className="whitespace-pre-wrap">{m.content}</div>
            )}
            <div className="mt-1 text-[10px] opacity-60">{m.at}</div>
          </div>
          )
        })}
      </div>

      <ExpertHitlBridge
        projectId={projectId}
        expert={expert}
        thread={thread}
        caseId={caseId}
      />

      {/* Shortcuts + composer · AFE-M-2 sticky comfort */}
      <div className="project-chat-composer sticky bottom-0 z-10 shrink-0 border-t border-slate-200 bg-white px-3 py-2 shadow-[0_-6px_16px_rgba(15,23,42,0.04)]">
        <div className="mb-1.5 flex flex-wrap gap-1">
          {expert.shortcuts.map((sc) => (
            <button
              key={sc.id}
              type="button"
              onClick={() => onShortcut(sc.id)}
              className="project-dispatch-pill btn-press focus-ring rounded-full border border-slate-200 bg-slate-50 font-medium text-slate-700 hover:bg-white"
            >
              {sc.label}
            </button>
          ))}
          {!isOrchestratorExpert(expertId) && (
            <button
              type="button"
              onClick={() => advanceStep(projectId, expertId)}
              className="project-dispatch-pill btn-press focus-ring rounded-full border border-slate-900 bg-slate-900 font-medium text-white"
              data-testid="expert-advance-cta"
            >
              推进一步
            </button>
          )}
        </div>
        <div className="flex items-end gap-2">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={onKey}
            rows={2}
            placeholder={
              isOrchestratorExpert(expertId)
                ? '输入分派摘要，或点「分派给…」'
                : '输入消息，或点快捷动作推进本专家剧本'
            }
            className="focus-ring min-h-[2.5rem] flex-1 resize-none rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
            aria-label="消息"
          />
          <button
            type="button"
            onClick={sendUser}
            className={
              isOrchestratorExpert(expertId)
                ? 'btn-press focus-ring hit-40 inline-flex items-center gap-1 rounded-md bg-slate-900 px-3 py-2 text-xs font-medium text-white'
                : 'btn-press focus-ring hit-40 inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50'
            }
          >
            <Send className="h-3.5 w-3.5" aria-hidden />
            发送
          </button>
        </div>
        <p className="mt-1 text-[10px] text-slate-400">
          护栏：{expert.guardrails.join(' · ')}
        </p>
      </div>
    </div>
  )
}
