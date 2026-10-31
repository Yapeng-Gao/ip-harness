import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import {
  ArrowUp,
  AtSign,
  Building2,
  Check,
  Paperclip,
  Send,
  Upload,
  X,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useBusinessCases } from '../../business/BusinessCaseContext'
import { useAssetLibrary } from '../../assets/AssetLibraryContext'
import type { BusinessHomeStartState } from '../../pages/business/BusinessCasesPage'
import { ORG_DEPTS, type OrgDept } from '../../departments/orgDepts'
import { getProjectExpert } from '../../projects/experts'
import type { ProjectExpertId } from '../../projects/types'
import {
  classifyGoal,
  formatCasePlanText,
  GOAL_KIND_LABEL,
  planStepsForGoal,
  resolveFirstStep,
  writeLastDispatch,
  type GoalKind,
  type PlanStep,
} from '../../business/delegateChain'

type MentionKind = 'dept' | 'expert'

type Mention = {
  kind: MentionKind
  id: string
  label: string
}

type Props = {
  initialAttachId?: string | null
  /** 有活跃/最近案时，分发直进该案部门；否则开新 */
  latestCaseId?: string
  onDispatched?: () => void
}

type Phase = 'compose' | 'plan'

/**
 * 助手档委托墙 · 提目标 → 计划可调 → 分发（vision §3.1c）
 * 样机示意；非真鉴权/真检索/官报。Enter 进计划，不再只 toast / 直跳开新。
 */
export function HomeComposer({
  initialAttachId,
  latestCaseId,
  onDispatched,
}: Props) {
  const navigate = useNavigate()
  const { recordDelegateDispatch } = useBusinessCases()
  const { docs, upload } = useAssetLibrary()
  const [draft, setDraft] = useState('')
  const [attached, setAttached] = useState<string[]>(() =>
    initialAttachId ? [initialAttachId] : [],
  )
  const [mentions, setMentions] = useState<Mention[]>([])
  const [picker, setPicker] = useState<null | 'assets' | 'dept' | 'expert'>(null)
  const [phase, setPhase] = useState<Phase>('compose')
  const [goalText, setGoalText] = useState('')
  const [goalKind, setGoalKind] = useState<GoalKind>('generic')
  const [steps, setSteps] = useState<PlanStep[]>([])
  const [firstStepId, setFirstStepId] = useState<string | null>(null)
  const taRef = useRef<HTMLTextAreaElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!initialAttachId) return
    setAttached((prev) =>
      prev.includes(initialAttachId) ? prev : [...prev, initialAttachId],
    )
  }, [initialAttachId])

  const recentDocs = useMemo(
    () =>
      docs
        .slice()
        .sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt))
        .slice(0, 8),
    [docs],
  )

  const experts = useMemo(() => {
    const ids: ProjectExpertId[] = ORG_DEPTS.map((d) => d.leadSeatId)
    return ids
      .map((id) => ({ id, def: getProjectExpert(id) }))
      .filter((x) => !!x.def)
      .slice(0, 14)
  }, [])

  const autoGrow = () => {
    const el = taRef.current
    if (!el) return
    el.style.height = 'auto'
    const max = 8 * 22
    el.style.height = `${Math.min(el.scrollHeight, max)}px`
  }

  const enterPlan = () => {
    const text = draft.trim()
    if (!text && attached.length === 0) return
    const goal = text || '（附资料委托）'
    const kind = classifyGoal(goal)
    const nextSteps = planStepsForGoal(kind)
    setGoalText(goal)
    setGoalKind(kind)
    setSteps(nextSteps)
    setFirstStepId(resolveFirstStep(nextSteps)?.id ?? null)
    setPhase('plan')
    setPicker(null)
  }

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault()
      enterPlan()
    }
    if (e.key === 'Escape') setPicker(null)
  }

  const pickAsset = (id: string) => {
    setAttached((prev) => (prev.includes(id) ? prev : [...prev, id]))
    setPicker(null)
  }

  const pickMention = (m: Mention) => {
    setMentions((prev) =>
      prev.some((x) => x.kind === m.kind && x.id === m.id) ? prev : [...prev, m],
    )
    setPicker(null)
  }

  const onFiles = (files: FileList | null) => {
    if (!files) return
    for (const f of Array.from(files)) {
      const doc = upload({ name: f.name, size: f.size })
      setAttached((prev) => [...prev, doc.id])
    }
    if (fileRef.current) fileRef.current.value = ''
  }

  const toggleStep = (id: string) => {
    setSteps((prev) =>
      prev.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s)),
    )
  }

  const dispatch = () => {
    const first = resolveFirstStep(steps, firstStepId)
    if (!first) return
    const casePlan = formatCasePlanText({
      goalKind,
      goalText,
      steps,
      firstStepId,
    })
    writeLastDispatch({
      at: new Date().toISOString(),
      goalText,
      goalKind,
      caseId: latestCaseId,
      deptSlug: first.slug,
      stepLabel: first.label,
    })
    if (latestCaseId) {
      recordDelegateDispatch(latestCaseId, {
        casePlan,
        goalKind,
        goalText,
        deptSlug: first.slug,
        stepLabel: first.label,
      })
    }
    onDispatched?.()
    if (latestCaseId) {
      navigate(
        `/agent/cases/${latestCaseId}/depts/${first.slug}?delegate=1&goal=${encodeURIComponent(goalKind)}`,
      )
      return
    }
    const state: BusinessHomeStartState & { casePlan?: string } = {
      summary: goalText,
      title: goalText.slice(0, 40) || undefined,
      attachments: attached,
      mentions: mentions.map(
        (m) => `${m.kind === 'dept' ? '@部门' : '@专家'} ${m.label}`,
      ),
      casePlan,
    }
    navigate('/agent/cases/new', { state })
  }

  const canSend = draft.trim().length > 0 || attached.length > 0
  const attachedDocs = attached
    .map((id) => docs.find((d) => d.id === id))
    .filter((d): d is NonNullable<typeof d> => !!d)
  const first = resolveFirstStep(steps, firstStepId)

  return (
    <div
      className="w-full"
      data-testid="home-composer"
      data-delegate-phase={phase}
    >
      <div className="rounded-[var(--radius-xl)] border border-slate-200 bg-white p-2.5 shadow-[var(--shadow-rest)] focus-within:border-slate-300 focus-within:shadow-[var(--shadow-elevated)]">
        {(attachedDocs.length > 0 || mentions.length > 0) && (
          <div className="mb-2 flex flex-wrap gap-1.5">
            {attachedDocs.map((d) => (
              <span
                key={d.id}
                className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] text-slate-700"
              >
                <Paperclip
                  className="h-3 w-3 text-slate-500"
                  strokeWidth={1.75}
                  aria-hidden
                />
                <span className="max-w-[12rem] truncate">{d.name}</span>
                <button
                  type="button"
                  onClick={() => setAttached((p) => p.filter((x) => x !== d.id))}
                  className="focus-ring rounded-full p-0.5 text-slate-500 hover:text-slate-800"
                  aria-label={`移除 ${d.name}`}
                >
                  <X className="h-3 w-3" aria-hidden />
                </button>
              </span>
            ))}
            {mentions.map((m) => (
              <span
                key={`${m.kind}-${m.id}`}
                className="inline-flex items-center gap-1 rounded-full border border-sky-200 bg-sky-50 px-2 py-0.5 text-[11px] text-sky-800"
              >
                {m.kind === 'dept' ? (
                  <Building2 className="h-3 w-3" strokeWidth={1.75} aria-hidden />
                ) : (
                  <AtSign className="h-3 w-3" strokeWidth={1.75} aria-hidden />
                )}
                <span className="max-w-[10rem] truncate">{m.label}</span>
                <button
                  type="button"
                  onClick={() =>
                    setMentions((p) =>
                      p.filter((x) => !(x.kind === m.kind && x.id === m.id)),
                    )
                  }
                  className="focus-ring rounded-full p-0.5 text-sky-700 hover:text-sky-900"
                  aria-label={`移除 ${m.label}`}
                >
                  <X className="h-3 w-3" aria-hidden />
                </button>
              </span>
            ))}
          </div>
        )}

        <label htmlFor="home-composer-input" className="sr-only">
          描述要办的事
        </label>
        <textarea
          id="home-composer-input"
          ref={taRef}
          value={draft}
          onChange={(e) => {
            setDraft(e.target.value)
            autoGrow()
          }}
          onKeyDown={onKeyDown}
          rows={1}
          placeholder="描述要办的事，或 @ 一个部门 / 专家…"
          className="focus-ring block max-h-[11rem] min-h-[2.75rem] w-full resize-none rounded-[var(--radius-md)] border-0 bg-transparent px-2 py-2 text-[15px] leading-[1.45] text-slate-900 placeholder:text-slate-500"
          data-testid="home-composer-input"
          disabled={phase === 'plan'}
        />

        {phase === 'compose' ? (
          <div className="mt-1.5 flex flex-wrap items-center gap-1">
            <ToolButton
              icon={Paperclip}
              label="资料"
              onClick={() => setPicker(picker === 'assets' ? null : 'assets')}
              expanded={picker === 'assets'}
            />
            <ToolButton
              icon={AtSign}
              label="专家"
              onClick={() => setPicker(picker === 'expert' ? null : 'expert')}
              expanded={picker === 'expert'}
            />
            <ToolButton
              icon={Building2}
              label="部门"
              onClick={() => setPicker(picker === 'dept' ? null : 'dept')}
              expanded={picker === 'dept'}
            />
            <ToolButton
              icon={Upload}
              label="上传"
              onClick={() => fileRef.current?.click()}
            />
            <input
              ref={fileRef}
              type="file"
              multiple
              className="sr-only"
              onChange={(e) => onFiles(e.target.files)}
              aria-label="上传资料"
              data-testid="home-composer-file"
            />

            <button
              type="button"
              onClick={enterPlan}
              disabled={!canSend}
              className="btn-press focus-ring ml-auto inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-35"
              aria-label="生成计划"
              data-testid="home-composer-send"
            >
              <ArrowUp className="h-4 w-4" strokeWidth={2.25} aria-hidden />
            </button>
          </div>
        ) : null}

        {picker === 'assets' && phase === 'compose' && (
          <PickerPanel title="选已有资料" onClose={() => setPicker(null)}>
            {recentDocs.length === 0 ? (
              <p className="px-2 py-2 text-[12px] text-slate-500">
                资产库还是空的
              </p>
            ) : (
              recentDocs.map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => pickAsset(d.id)}
                  className="focus-ring flex min-h-9 w-full items-center gap-2 rounded-[var(--radius-sm)] px-2 text-left text-[12px] text-slate-700 hover:bg-slate-50"
                >
                  <Paperclip
                    className="h-3.5 w-3.5 shrink-0 text-slate-500"
                    strokeWidth={1.75}
                    aria-hidden
                  />
                  <span className="min-w-0 flex-1 truncate">{d.name}</span>
                </button>
              ))
            )}
          </PickerPanel>
        )}

        {picker === 'dept' && phase === 'compose' && (
          <PickerPanel title="点名部门" onClose={() => setPicker(null)}>
            {ORG_DEPTS.map((d: OrgDept) => (
              <button
                key={d.id}
                type="button"
                onClick={() =>
                  pickMention({ kind: 'dept', id: d.id, label: d.label })
                }
                className="focus-ring flex min-h-9 w-full items-center gap-2 rounded-[var(--radius-sm)] px-2 text-left text-[12px] text-slate-700 hover:bg-slate-50"
              >
                <Building2
                  className="h-3.5 w-3.5 shrink-0 text-slate-500"
                  strokeWidth={1.75}
                  aria-hidden
                />
                <span className="min-w-0 flex-1 truncate">{d.label}</span>
                <span className="shrink-0 text-[11px] text-slate-500">
                  {d.blurb.slice(0, 12)}
                </span>
              </button>
            ))}
          </PickerPanel>
        )}

        {picker === 'expert' && phase === 'compose' && (
          <PickerPanel title="点名专家" onClose={() => setPicker(null)}>
            {experts.map(({ id, def }) => (
              <button
                key={id}
                type="button"
                onClick={() =>
                  pickMention({ kind: 'expert', id, label: def!.name })
                }
                className="focus-ring flex min-h-9 w-full items-center gap-2 rounded-[var(--radius-sm)] px-2 text-left text-[12px] text-slate-700 hover:bg-slate-50"
              >
                <AtSign
                  className="h-3.5 w-3.5 shrink-0 text-slate-500"
                  strokeWidth={1.75}
                  aria-hidden
                />
                <span className="min-w-0 flex-1 truncate">{def!.name}</span>
                <span className="shrink-0 text-[11px] text-slate-500">
                  {def!.specialty?.slice(0, 10)}
                </span>
              </button>
            ))}
          </PickerPanel>
        )}

        {phase === 'plan' ? (
          <div
            className="mt-3 rounded-lg border border-slate-200 bg-slate-50/80 p-2.5"
            data-testid="home-delegate-plan"
            data-goal-kind={goalKind}
          >
            <div className="mb-2 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
              <p className="text-[12px] font-semibold text-slate-900">
                计划可调
              </p>
              <span
                className="rounded-full bg-white px-2 py-0.5 text-[10px] font-medium text-slate-600 ring-1 ring-slate-200"
                data-testid="home-delegate-goal-kind"
              >
                {GOAL_KIND_LABEL[goalKind]}
              </span>
              <span className="text-[10px] text-slate-400">
                样机示意 · 点芯片改首站/开关步骤
              </span>
            </div>
            <p
              className="mb-2 truncate text-[12px] text-slate-600"
              data-testid="home-delegate-goal-text"
              title={goalText}
            >
              目标：{goalText}
            </p>
            <ul
              className="flex flex-wrap gap-1.5"
              data-testid="home-delegate-plan-chips"
            >
              {steps.map((s) => {
                const isFirst = first?.id === s.id
                return (
                  <li key={s.id}>
                    <button
                      type="button"
                      data-testid={`home-plan-chip-${s.id}`}
                      data-enabled={s.enabled ? '1' : '0'}
                      data-first={isFirst ? '1' : '0'}
                      onClick={() => {
                        if (!s.enabled) {
                          toggleStep(s.id)
                          if (s.canBeFirst) setFirstStepId(s.id)
                          return
                        }
                        if (s.canBeFirst) setFirstStepId(s.id)
                        else toggleStep(s.id)
                      }}
                      onContextMenu={(e) => {
                        e.preventDefault()
                        toggleStep(s.id)
                      }}
                      className={`btn-press focus-ring inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium ${
                        !s.enabled
                          ? 'border border-dashed border-slate-300 bg-transparent text-slate-400 line-through'
                          : isFirst
                            ? 'border border-slate-900 bg-slate-900 text-white'
                            : 'border border-slate-200 bg-white text-slate-800'
                      }`}
                      title={
                        s.enabled
                          ? s.canBeFirst
                            ? '点击设为首站；右键开关'
                            : '右键开关步骤'
                          : '点击重新启用'
                      }
                    >
                      {isFirst && s.enabled ? (
                        <Check className="h-3 w-3" aria-hidden />
                      ) : null}
                      {s.label}
                    </button>
                  </li>
                )
              })}
            </ul>
            {goalKind === 'generic' ? (
              <p
                className="mt-2 text-[11px] text-amber-800"
                data-testid="home-delegate-narrow-hint"
              >
                目标偏宽 · 示意先立项收窄（禁直接万能聊天顶替）
              </p>
            ) : null}
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setPhase('compose')}
                className="btn-press focus-ring rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-medium text-slate-700"
                data-testid="home-delegate-back"
              >
                改目标
              </button>
              <button
                type="button"
                onClick={dispatch}
                disabled={!first}
                className="btn-press focus-ring ml-auto inline-flex items-center gap-1.5 rounded-md bg-slate-900 px-3 py-1.5 text-[12px] font-semibold text-white hover:bg-slate-800 disabled:opacity-35"
                data-testid="home-delegate-dispatch"
              >
                <Send className="h-3.5 w-3.5" aria-hidden />
                分发到{first ? first.label.split('·')[0]!.trim() : '…'}
              </button>
            </div>
          </div>
        ) : null}
      </div>

      <p className="mt-1.5 px-1 text-[11px] text-slate-500">
        样机 · 提目标→计划可调→分发→待接力 · Enter 出计划，Shift+Enter 换行
      </p>
    </div>
  )
}

function ToolButton({
  icon: Icon,
  label,
  onClick,
  expanded,
}: {
  icon: typeof Paperclip
  label: string
  onClick: () => void
  expanded?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-expanded={expanded}
      className={`focus-ring inline-flex min-h-9 items-center gap-1 rounded-full px-2.5 text-[12px] font-medium transition-colors duration-150 ${
        expanded
          ? 'bg-slate-100 text-slate-900'
          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
      }`}
    >
      <Icon className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden />
      {label}
    </button>
  )
}

function PickerPanel({
  title,
  onClose,
  children,
}: {
  title: string
  onClose: () => void
  children: React.ReactNode
}) {
  return (
    <div
      className="mt-2 rounded-[var(--radius-md)] border border-slate-200 bg-white p-1.5 shadow-[var(--shadow-elevated)]"
      role="group"
      aria-label={title}
    >
      <div className="flex items-center px-2 pb-1">
        <span className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
          {title}
        </span>
        <button
          type="button"
          onClick={onClose}
          className="focus-ring ml-auto rounded p-1 text-slate-500 hover:text-slate-800"
          aria-label="关闭"
        >
          <X className="h-3.5 w-3.5" aria-hidden />
        </button>
      </div>
      <div className="max-h-56 overflow-y-auto">{children}</div>
    </div>
  )
}
