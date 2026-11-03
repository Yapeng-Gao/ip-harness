import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ChevronDown, ChevronRight, FileUp, Paperclip } from 'lucide-react'
import { useAssetLibrary } from '../../assets/AssetLibraryContext'
import {
  type ReceptionSuggest,
} from '../../business/receptionSuggest'
import {
  buildReceptionHandoff,
  writeReceptionPending,
} from '../../business/receptionHandoff'
import {
  readPersonaSeed,
  receptionExamplesForPersona,
  weakUpdatePersonaFromDeptSlug,
} from '../../business/userPersona'
import { ExpertAvatar } from '../departments/ExpertAvatar'

import { assessReceptionIntake, RECEPTION_GOALS, type ReceptionGoal, type ReceptionIntake } from '../../business/receptionIntake'

type Phase = 'idle' | 'clarify' | 'suggest'

type Props = {
  onDispatched?: () => void
  initialAttachId?: string | null
}

/** 大厅前台人设 · 01 §9 接待专家（单一名片） */
export const RECEPTION_DESK = {
  name: '小林',
  title: '前台',
  seed: 'reception-desk-xiaolin',
  tagline: '帮你弄清先去哪',
} as const

/**
 * 大厅接待 · 领路卡（非聊天壳）
 * 主：登记行来意 → 去向确认（人话）→ 领进；示例默折；附件次。
 */
export function HomeReceptionGuide({
  onDispatched,
  initialAttachId,
}: Props) {
  const navigate = useNavigate()
  const { upload, getDoc } = useAssetLibrary()
  const fileRef = useRef<HTMLInputElement>(null)
  const [phase, setPhase] = useState<Phase>('idle')
  const [suggest, setSuggest] = useState<ReceptionSuggest | null>(null)
  const [fileNames, setFileNames] = useState<string[]>([])
  const [draft, setDraft] = useState('')
  const [pickedSlug, setPickedSlug] = useState<string | null>(null)
  const [examplesOpen, setExamplesOpen] = useState(false)
  const [clarification, setClarification] = useState<Extract<ReceptionIntake, { kind: 'clarify' }> | null>(null)
  const [chosenGoal, setChosenGoal] = useState<ReceptionGoal | undefined>()
  const [goalSummary, setGoalSummary] = useState('')
  const [materialState, setMaterialState] = useState<'have' | 'missing' | 'unsure' | undefined>()

  const examples = useMemo(
    () => receptionExamplesForPersona(readPersonaSeed()),
    [],
  )

  const persona = readPersonaSeed()
  const firstTime =
    !persona || persona.skipped || persona.familiarity === 'first'

  const idleHint = firstTime
    ? '今天想先办成什么事？说个大概就行。不知道怎么说，也可以让我帮你理一理。'
    : '说一句来意，我会建议先去哪个部门；也可直接选择部门。'

  const runAnalyze = (names: string[], goalText = draft, goal?: ReceptionGoal, disclosureState?: 'have' | 'missing' | 'unsure') => {
    const next = assessReceptionIntake({ fileNames: names, goalText, chosenGoal: goal, disclosureState: disclosureState ?? (goal ? materialState : undefined) })
    if (disclosureState) setMaterialState(disclosureState)
    setFileNames(names)
    if (next.kind === 'clarify') {
      setClarification(next)
      setSuggest(null)
      setPhase('clarify')
      return
    }
    setChosenGoal(next.goal)
    setGoalSummary(next.goalSummary)
    setSuggest(next.suggest)
    setPickedSlug(next.suggest.primary.slug)
    setClarification(null)
    setPhase('suggest')
  }

  const attachedFromUrl = useRef<string | null>(null)
  useEffect(() => {
    if (!initialAttachId || attachedFromUrl.current === initialAttachId) return
    const doc = getDoc(initialAttachId)
    if (!doc) return
    attachedFromUrl.current = initialAttachId
    runAnalyze([doc.name], '')
  }, [initialAttachId, getDoc])

  const onFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return
    const names = [...fileNames]
    for (const f of Array.from(files)) {
      if (!names.includes(f.name)) {
        upload({ name: f.name, size: f.size })
        names.push(f.name)
      }
    }
    if (fileRef.current) fileRef.current.value = ''
    runAnalyze(names, draft.trim(), chosenGoal)
  }

  const submitLine = () => {
    const text = draft.trim()
    setChosenGoal(undefined)
    setMaterialState(undefined)
    runAnalyze(fileNames, text)
  }

  const confirmGo = () => {
    if (!suggest) return
    const slug = pickedSlug ?? suggest.primary.slug
    const door =
      slug === suggest.primary.slug
        ? suggest.primary
        : suggest.alts.find((a) => a.slug === slug) ?? suggest.primary
    const handoff = buildReceptionHandoff({
      goalText: goalSummary || draft,
      selectedSlug: door.slug,
      primarySlug: suggest.primary.slug,
      altSlugs: suggest.alts.map((a) => a.slug),
      fileNames,
      roughGaps: suggest.roughGaps,
      intents: suggest.intents,
      reason: suggest.reason,
    })
    weakUpdatePersonaFromDeptSlug(door.slug)
    onDispatched?.()
    writeReceptionPending(handoff)
    navigate('/agent/cases/new?after=reception')
  }

  const reset = () => {
    setPhase('idle')
    setSuggest(null)
    setChosenGoal(undefined)
    setClarification(null)
    setMaterialState(undefined)
    setPickedSlug(null)
  }

  const pickedDoor =
    suggest == null
      ? null
      : ([suggest.primary, ...suggest.alts].find(
          (d) => d.slug === (pickedSlug ?? suggest.primary.slug),
        ) ?? suggest.primary)

  const intentLine =
    suggest?.intents?.[0] ??
    (draft.trim() ? draft.trim() : '还不太清楚具体要办哪一件')

  return (
    <section
      className="mb-2.5"
      aria-labelledby="home-reception-title"
      data-testid="home-reception-guide"
      data-reception-phase={phase}
      data-reception-mode="desk-line-v2"
    >
      <div className="mb-1 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
        <h2
          id="home-reception-title"
          className="text-[12px] font-semibold text-slate-900"
        >
          前台
        </h2>
        <span className="text-[10px] text-slate-500">弄清去向</span>
        {(
          <Link
            to="/agent/cases/new"
            className="btn-press focus-ring ml-auto inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-medium text-slate-700"
            data-testid="home-reception-start"
          >
            先开案子
          </Link>
        )}
      </div>

      <div
        className="rounded-[var(--radius-xl)] border border-slate-200 bg-white p-2 shadow-[var(--shadow-rest)]"
        data-testid="home-reception-card"
      >
        <div
          className="mb-2 flex items-center gap-2.5"
          data-testid="home-reception-persona"
        >
          <div
            className="relative flex shrink-0 items-end justify-center overflow-visible rounded-xl bg-[#EEF1F5] px-1.5 pb-0.5 pt-1 ring-1 ring-slate-200/70"
            data-testid="home-reception-stage"
          >
            <ExpertAvatar
              name={RECEPTION_DESK.name}
              seed={RECEPTION_DESK.seed}
            size="md"
              kind="reception"
              deptId="reception"
              appearance="stylized"
              presence={
                phase === 'clarify'
                  ? 'waiting'
                  : phase === 'suggest'
                    ? 'waiting'
                    : 'idle'
              }
            />
          </div>
          <div className="flex min-w-0 flex-1 flex-col justify-center py-0.5">
            <p className="text-[13px] leading-snug text-slate-700">
              <span
                className="font-semibold text-slate-900"
                data-testid="home-reception-persona-name"
              >
                {RECEPTION_DESK.name}
              </span>
              <span className="text-slate-400"> · </span>
              <span>{RECEPTION_DESK.title}</span>
            </p>
            <p
              className="mt-1 text-[11px] leading-snug text-slate-500"
              data-testid="home-reception-persona-tagline"
            >
              {RECEPTION_DESK.tagline}
            </p>
          </div>
        </div>

        {phase === 'idle' || phase === 'clarify' ? (
          <div
            data-testid="home-reception-idle"
            data-action-hierarchy="line-primary"
          >
            <p
              className="mb-2 text-[12px] leading-snug text-slate-600"
              data-testid="home-reception-prompt"
              data-speech-phase="idle"
            >
              {phase === 'clarify' ? clarification?.question : idleHint}
            </p>
            {phase === 'clarify' && clarification ? (
              <div className="mb-3" aria-live="polite" data-testid="home-reception-clarify">
                <p className="mb-2 text-xs text-slate-500">{clarification.explanation}</p>
                {draft.trim() ? <p className="mb-2 text-xs text-slate-600">你的原话：{draft}</p> : null}
                <div className="grid gap-2 sm:grid-cols-2">
                  {clarification.choices.map((choice) => (
                    <button type="button" key={choice.slug} className="focus-ring rounded-lg border border-slate-200 bg-white px-3 py-2 text-left text-xs text-slate-800 hover:border-slate-500" data-testid={`reception-choice-${choice.slug}`}
                      onClick={() => {
                        if (clarification.topic === 'disclosure') runAnalyze(fileNames, draft, RECEPTION_GOALS.find((g) => g.slug === 'draft'), choice.slug as 'have' | 'missing' | 'unsure')
                        else { setChosenGoal(choice); runAnalyze(fileNames, draft, choice) }
                      }}>{choice.label}</button>
                  ))}
                </div>
              </div>
            ) : null}
            <div className="rounded-md border border-slate-200 bg-slate-50/40 p-2">
              <label
                htmlFor="home-reception-line"
                className="mb-1 block text-[10px] font-semibold tracking-wide text-slate-500"
              >
                今天想办的事
              </label>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
                <input
                  id="home-reception-line"
                  type="text"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      submitLine()
                    }
                  }}
                  placeholder="例如：研发卡住了，想找改进方案"
                  className="focus-ring min-h-10 w-full flex-1 rounded-md border border-slate-200 bg-white px-3 py-2 text-[13px] text-slate-800 placeholder:text-slate-400"
                  data-testid="home-reception-line-input"
                />
                <button
                  type="button"
                  className="btn-press focus-ring shrink-0 rounded-md bg-slate-900 px-3 py-2 text-[12px] font-semibold text-white hover:bg-slate-800 disabled:opacity-40 sm:min-h-10 sm:px-4"
                  data-testid="home-reception-submit-line"
                  disabled={!draft.trim() && !fileNames.length}
                  onClick={submitLine}
                >
                  帮我理清去向
                </button>
              </div>
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
              <button type="button" className="focus-ring min-h-8 rounded text-[11px] font-medium text-slate-700 underline underline-offset-2" data-testid="reception-help" onClick={() => { setChosenGoal(undefined); runAnalyze(fileNames, '') }}>还没想清楚，帮我理一理</button>
              <button
                type="button"
                className="btn-press focus-ring inline-flex min-h-8 items-center gap-0.5 text-[11px] font-medium text-slate-500 hover:text-slate-700"
                data-testid="home-reception-examples-toggle"
                aria-expanded={examplesOpen}
                onClick={() => setExamplesOpen((o) => !o)}
              >
                {examplesOpen ? (
                  <ChevronDown className="h-3 w-3" aria-hidden />
                ) : (
                  <ChevronRight className="h-3 w-3" aria-hidden />
                )}
                看例子
              </button>
              <button
                type="button"
                className="btn-press focus-ring inline-flex min-h-8 items-center gap-1 text-[11px] font-medium text-slate-500 hover:text-slate-700"
                data-testid="home-reception-upload"
                data-action-rank="secondary"
                onClick={() => fileRef.current?.click()}
              >
                <Paperclip className="h-3.5 w-3.5" aria-hidden />
                有材料可附上
              </button>
            </div>

            {examplesOpen ? (
              <ul
                className="mt-1.5 flex flex-wrap gap-1.5"
                data-testid="home-reception-examples"
              >
                {examples.map((ex) => (
                  <li key={ex.id}>
                    <button
                      type="button"
                      title="点入可再改"
                      className="btn-press focus-ring inline-flex max-w-full rounded-md border border-slate-100 bg-white px-2 py-1 text-left text-[11px] text-slate-600 hover:border-slate-200 hover:text-slate-800"
                      data-testid={`home-reception-example-${ex.id}`}
                      onClick={() => {
                        setDraft(ex.text)
                        setExamplesOpen(false)
                      }}
                    >
                      <span className="truncate">{ex.text}</span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}

          </div>
        ) : null}

        <input ref={fileRef} type="file" multiple className="sr-only" onChange={(e) => onFiles(e.target.files)} aria-label="选择资料给前台" data-testid="home-reception-file" />
        {fileNames.length ? (
          <div className="my-3 rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs" data-testid="reception-receipt" aria-live="polite">
            <p className="font-medium text-slate-800">已登记 {fileNames.length} 份文件名称</p>
            <p className="mt-1 text-slate-500">文件正文尚未上传或读取；类型仅按名称推测。请保留原文件，部门后续会说明如何补充。</p>
            <ul className="mt-2 space-y-1">{fileNames.map((name) => <li key={name} className="flex items-center justify-between gap-3"><span className="break-all">{name}</span><button type="button" className="focus-ring shrink-0 rounded px-2 py-1 underline" aria-label={`移除 ${name}`} onClick={() => runAnalyze(fileNames.filter((n) => n !== name), draft, chosenGoal)}>移除</button></li>)}</ul>
            <button type="button" className="focus-ring mt-2 rounded underline" onClick={() => fileRef.current?.click()}>继续附材料</button>
          </div>
        ) : null}

        {phase === 'suggest' && suggest ? (
          <div data-testid="home-reception-suggest" data-demo="1">
            <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
              <p
                className="text-[13px] font-semibold leading-snug text-slate-900"
                data-testid="home-reception-prompt"
                data-speech-phase="suggest"
              >
                这次先去{pickedDoor?.label ?? suggest.primary.label}
                ，对吗？
              </p>
              <span className="shrink-0 rounded-full bg-amber-50 px-1.5 py-0.5 text-[10px] font-medium text-amber-900 ring-1 ring-amber-200">
                样机去向建议 · 由你确认
              </span>
            </div>

            <p
              className="mb-2 text-[12px] leading-snug text-slate-600"
              data-testid="home-reception-intents"
            >
              听下来：{intentLine}
              {draft.trim() ? <span className="mt-1 block text-[11px] text-slate-500">原始来意：{draft}</span> : null}
              {suggest.reason ? (
                <span
                  className="mt-0.5 block text-[11px] text-slate-500"
                  data-testid="home-reception-reason"
                >
                  {suggest.reason}
                </span>
              ) : null}
            </p>

            {fileNames.length ? (
              <ul
                className="mb-2 space-y-0.5 text-[11px] text-slate-600"
                data-testid="home-reception-materials"
              >
                {suggest.materials.map((m, i) => (
                  <li key={`${m.name}-${i}`} className="flex flex-wrap gap-x-1.5">
                    <FileUp
                      className="mt-0.5 h-3 w-3 shrink-0 text-slate-400"
                      aria-hidden
                    />
                    <span className="font-medium text-slate-800">{m.name}</span>
                    <span className="text-slate-400">·</span>
                    <span>{m.tag} · 按文件名推测</span>
                  </li>
                ))}
              </ul>
            ) : null}

            <p className="mb-1 text-[10px] font-semibold text-slate-500">
              不对可以改
            </p>
            <div
              className="flex flex-wrap gap-1.5"
              data-testid="home-reception-dept-picks"
              role="radiogroup"
              aria-label="建议部门"
            >
              <DeptPick
                door={suggest.primary}
                selected={
                  (pickedSlug ?? suggest.primary.slug) === suggest.primary.slug
                }
                badge="建议"
                onSelect={() => setPickedSlug(suggest.primary.slug)}
              />
              {suggest.alts.map((a) => (
                <DeptPick
                  key={a.slug}
                  door={a}
                  selected={pickedSlug === a.slug}
                  badge="也可"
                  onSelect={() => setPickedSlug(a.slug)}
                />
              ))}
            </div>

            {suggest.roughGaps.length ? (
              <p
                className="mt-2 text-[11px] text-slate-500"
                data-testid="home-reception-gaps"
              >
                材料准备建议（可稍后补）：{suggest.roughGaps.join('；')}
              </p>
            ) : null}

            <button type="button" className="focus-ring mt-2 inline-flex items-center gap-1 rounded text-xs text-slate-600 underline" onClick={() => fileRef.current?.click()}><Paperclip className="h-3.5 w-3.5" />附上手头材料，也可稍后补</button>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <button
                type="button"
                className="btn-press focus-ring rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-medium text-slate-700"
                data-testid="home-reception-reset"
                onClick={reset}
              >
                修改来意（保留材料）
              </button>
              <button
                type="button"
                className="btn-press focus-ring ml-auto inline-flex items-center gap-1.5 rounded-md bg-slate-900 px-3 py-1.5 text-[12px] font-semibold text-white hover:bg-slate-800"
                data-testid="home-reception-confirm"
                onClick={confirmGo}
              >
                对，领进{pickedDoor?.label}
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  )
}

function DeptPick({
  door,
  selected,
  badge,
  onSelect,
}: {
  door: { num: string; label: string; slug: string }
  selected: boolean
  badge: string
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      data-testid={`home-reception-pick-${door.slug}`}
      data-selected={selected ? '1' : '0'}
      className={`btn-press focus-ring inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-left text-[12px] ${
        selected
          ? 'border-slate-900 bg-slate-900 text-white'
          : 'border-slate-200 bg-white text-slate-800 hover:border-slate-300'
      }`}
    >
      <span className={selected ? 'text-slate-300' : 'text-slate-400'}>
        {door.num}
      </span>
      <span className="font-semibold">{door.label}</span>
      <span
        className={`rounded-full px-1.5 py-0.5 text-[9px] font-medium ${
          selected ? 'bg-white/15 text-slate-200' : 'bg-slate-100 text-slate-500'
        }`}
      >
        {badge}
      </span>
    </button>
  )
}
