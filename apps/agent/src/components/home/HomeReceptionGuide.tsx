import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Building2,
  ChevronDown,
  ChevronRight,
  FileUp,
  Loader2,
  Upload,
} from 'lucide-react'
import { useAssetLibrary } from '../../assets/AssetLibraryContext'
import { HALL_DEPT_DOORS, hallDeptHref } from '../../business/hallDepts'
import {
  suggestFromReceptionInput,
  type ReceptionSuggest,
} from '../../business/receptionSuggest'
import { ExpertAvatar } from '../departments/ExpertAvatar'
import { HomeComposer } from './HomeComposer'

type Phase = 'idle' | 'analyzing' | 'suggest'

type Props = {
  latestCaseId?: string
  onDispatched?: () => void
  initialAttachId?: string | null
}

const GOAL_CHIPS: Array<{ id: string; label: string; slug: string; hint: string }> = [
  { id: 'disclosure', label: '写交底', slug: 'disclosure', hint: '技术事实 → 交底书' },
  { id: 'draft', label: '递申请', slug: 'draft', hint: '合格交底 → 申请文件' },
  { id: 'oa', label: '答审查意见', slug: 'oa', hint: '通知书 → 答复' },
  { id: 'mining', label: '挖创新点', slug: 'mining', hint: '研发资料 → 拆案' },
  { id: 'intake', label: '先立项', slug: 'intake', hint: '要不要立这个方向' },
]

/** 大厅前台人设 · 01 §9 接待专家（单一名片） */
export const RECEPTION_DESK = {
  name: '小林',
  title: '前台',
  seed: 'reception-desk-xiaolin',
  tagline: '帮你弄清先去哪',
} as const

const IDLE_SPEECH =
  '你好，我是前台小林。不清楚去哪一部的话，丢材料给我看，我帮你建议去向；已经清楚就点目标，或直接点下方八部门牌。也可以一句话跟我说。'

/**
 * 大厅接待 · 前台形象主动引导（01-接待与引导）
 * 进门 idle 前台先开口；结构化动作（丢材料/点目标/确认去向）由话术领着走；
 * 一句话辅入口保留；八部直达在 HomePage。非闲聊墙、非唯一闸门、禁医院隐喻。
 */
export function HomeReceptionGuide({
  latestCaseId,
  onDispatched,
  initialAttachId,
}: Props) {
  const navigate = useNavigate()
  const { upload } = useAssetLibrary()
  const fileRef = useRef<HTMLInputElement>(null)
  const [phase, setPhase] = useState<Phase>('idle')
  const [suggest, setSuggest] = useState<ReceptionSuggest | null>(null)
  const [fileNames, setFileNames] = useState<string[]>([])
  const [lineOpen, setLineOpen] = useState(false)
  const [pickedSlug, setPickedSlug] = useState<string | null>(null)

  useEffect(() => {
    if (initialAttachId) setLineOpen(true)
  }, [initialAttachId])

  const runAnalyze = (names: string[], goalText?: string) => {
    setPhase('analyzing')
    setFileNames(names)
    window.setTimeout(() => {
      const next = suggestFromReceptionInput({ fileNames: names, goalText })
      setSuggest(next)
      setPickedSlug(next.primary.slug)
      setPhase('suggest')
    }, 700)
  }

  const onFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return
    const names: string[] = []
    for (const f of Array.from(files)) {
      upload({ name: f.name, size: f.size })
      names.push(f.name)
    }
    if (fileRef.current) fileRef.current.value = ''
    runAnalyze(names)
  }

  const onGoalChip = (slug: string) => {
    const door = HALL_DEPT_DOORS.find((d) => d.slug === slug)
    if (!door) return
    navigate(hallDeptHref(latestCaseId, door) + '?reception=goal')
  }

  const confirmGo = () => {
    if (!suggest) return
    const slug = pickedSlug ?? suggest.primary.slug
    const door =
      slug === suggest.primary.slug
        ? suggest.primary
        : suggest.alts.find((a) => a.slug === slug) ?? suggest.primary
    navigate(hallDeptHref(latestCaseId, door) + '?reception=1')
  }

  const reset = () => {
    setPhase('idle')
    setSuggest(null)
    setFileNames([])
    setPickedSlug(null)
  }

  const pickedDoor =
    suggest == null
      ? null
      : ([suggest.primary, ...suggest.alts].find(
          (d) => d.slug === (pickedSlug ?? suggest.primary.slug),
        ) ?? suggest.primary)

  const speech =
    phase === 'idle'
      ? IDLE_SPEECH
      : phase === 'analyzing'
        ? `材料我先过一眼${fileNames.length ? `（${fileNames.slice(0, 2).join('、')}）` : ''}……样机示意，只识物与去向建议，不做部内专业结论。`
        : suggest
          ? `材料里我看到${suggest.materials
              .slice(0, 2)
              .map((m) => m.tag)
              .join('、')}；${suggest.intents[0] ?? '还不清楚这次要办成哪一件'}。建议先去${suggest.primary.label}${
              suggest.alts.length
                ? `（备选 ${suggest.alts.map((a) => a.label).join('、')}）`
                : ''
            }。请你确认去向——定案在你。`
          : IDLE_SPEECH

  return (
    <section
      className="mb-2.5"
      aria-labelledby="home-reception-title"
      data-testid="home-reception-guide"
      data-reception-phase={phase}
      data-reception-mode="persona-speak-v92"
    >
      <div className="mb-1 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
        <h2
          id="home-reception-title"
          className="text-[12px] font-semibold text-slate-900"
        >
          前台 · 弄清去向
        </h2>
        <span className="text-[10px] text-slate-500">
          导引岗 · 非唯一闸门 · 八部可直达
        </span>
        {latestCaseId ? (
          <Link
            to={`/agent/cases/${latestCaseId}`}
            className="btn-press focus-ring ml-auto inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-medium text-slate-700"
            data-testid="home-go-company"
          >
            <Building2 className="h-3 w-3" aria-hidden />
            公司案盯盘
          </Link>
        ) : (
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
        className="rounded-[var(--radius-xl)] border border-slate-200 bg-white p-3 shadow-[var(--shadow-rest)]"
        data-testid="home-reception-card"
      >
        {/* 前台名片 · 始终在 */}
        <div
          className="mb-2 flex items-center gap-2.5"
          data-testid="home-reception-persona"
        >
          <ExpertAvatar
            name={RECEPTION_DESK.name}
            seed={RECEPTION_DESK.seed}
            size="lg"
          />
          <div className="min-w-0">
            <p className="flex flex-wrap items-center gap-1.5 text-[13px] font-semibold text-slate-900">
              <span data-testid="home-reception-persona-name">
                {RECEPTION_DESK.name}
              </span>
              <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600">
                {RECEPTION_DESK.title}
              </span>
            </p>
            <p
              className="text-[11px] text-slate-500"
              data-testid="home-reception-persona-tagline"
            >
              {RECEPTION_DESK.tagline}
            </p>
          </div>
        </div>

        {/* 主动话术气泡 */}
        <div
          className="relative mb-2.5 rounded-lg rounded-tl-sm border border-slate-100 bg-slate-50/90 px-3 py-2.5"
          data-testid="home-reception-speech"
          data-speech-phase={phase}
          role="status"
        >
          <p
            className="text-[13px] leading-snug text-slate-800"
            data-testid="home-reception-prompt"
          >
            {speech}
          </p>
          {phase === 'analyzing' ? (
            <p className="mt-1.5 flex items-center gap-1.5 text-[11px] text-slate-500">
              <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
              前台在看材料…
            </p>
          ) : null}
        </div>

        {phase === 'idle' ? (
          <div data-testid="home-reception-idle">
            <div
              className="grid grid-cols-1 gap-2 sm:grid-cols-2"
              data-testid="home-reception-actions"
            >
              <button
                type="button"
                className="btn-press focus-ring flex items-start gap-2 rounded-lg border border-slate-900 bg-slate-900 px-3 py-2.5 text-left text-white hover:bg-slate-800"
                data-testid="home-reception-upload"
                onClick={() => fileRef.current?.click()}
              >
                <Upload className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                <span>
                  <span className="block text-[13px] font-semibold">丢材料进来</span>
                  <span className="mt-0.5 block text-[11px] font-normal text-slate-300">
                    我帮你看 → 建议部门
                  </span>
                </span>
              </button>
              <div
                className="rounded-lg border border-slate-200 bg-slate-50/80 px-3 py-2"
                data-testid="home-reception-goals"
              >
                <p className="text-[11px] font-semibold text-slate-700">今天想办</p>
                <ul className="mt-1.5 flex flex-wrap gap-1.5">
                  {GOAL_CHIPS.map((g) => (
                    <li key={g.id}>
                      <button
                        type="button"
                        title={g.hint}
                        className="btn-press focus-ring inline-flex rounded-full border border-slate-200 bg-white px-2.5 py-0.5 text-[11px] font-medium text-slate-800 hover:border-slate-300"
                        data-testid={`home-goal-${g.id}`}
                        onClick={() => onGoalChip(g.slug)}
                      >
                        {g.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <input
              ref={fileRef}
              type="file"
              multiple
              className="sr-only"
              onChange={(e) => onFiles(e.target.files)}
              aria-label="上传资料给前台"
              data-testid="home-reception-file"
            />

            <div
              className="mt-2.5 border-t border-slate-100 pt-2"
              data-testid="home-reception-line-fold"
            >
              <button
                type="button"
                className="focus-ring flex w-full items-center gap-1.5 rounded-md px-0.5 py-1 text-left"
                onClick={() => setLineOpen((o) => !o)}
                aria-expanded={lineOpen}
                data-testid="home-reception-line-toggle"
              >
                {lineOpen ? (
                  <ChevronDown className="h-3.5 w-3.5 text-slate-500" aria-hidden />
                ) : (
                  <ChevronRight className="h-3.5 w-3.5 text-slate-500" aria-hidden />
                )}
                <span className="text-[11px] font-medium text-slate-600">
                  或一句话交代
                </span>
                <span className="text-[10px] text-slate-400">辅入口 · 必要保留</span>
              </button>
              {lineOpen ? (
                <div className="mt-1" data-testid="home-reception-composer-wrap">
                  <HomeComposer
                    initialAttachId={initialAttachId}
                    latestCaseId={latestCaseId}
                    onDispatched={onDispatched}
                  />
                </div>
              ) : (
                <p className="pl-5 text-[10px] text-slate-400">
                  不必先打字；也可点开跟前台说一句。
                </p>
              )}
            </div>
          </div>
        ) : null}

        {phase === 'analyzing' ? (
          <div
            className="sr-only"
            data-testid="home-reception-analyzing"
            aria-live="polite"
          >
            前台在看材料
          </div>
        ) : null}

        {phase === 'suggest' && suggest ? (
          <div data-testid="home-reception-suggest" data-demo="1">
            <div className="mb-2 flex flex-wrap items-center gap-1.5">
              <span className="rounded-full bg-amber-50 px-1.5 py-0.5 text-[10px] font-medium text-amber-900 ring-1 ring-amber-200">
                样机示意 · 非真鉴权
              </span>
            </div>

            <ul
              className="mb-2 space-y-0.5 text-[11px] text-slate-600"
              data-testid="home-reception-materials"
            >
              {suggest.materials.map((m, i) => (
                <li key={`${m.name}-${i}`} className="flex flex-wrap gap-x-1.5">
                  <FileUp className="mt-0.5 h-3 w-3 shrink-0 text-slate-400" aria-hidden />
                  <span className="font-medium text-slate-800">{m.name}</span>
                  <span className="text-slate-400">·</span>
                  <span>{m.tag}</span>
                  <span className="text-slate-400">· 置信{m.confidence}</span>
                </li>
              ))}
            </ul>

            <div className="mb-2 rounded-md border border-slate-100 bg-white px-2.5 py-2">
              <p className="text-[11px] font-semibold text-slate-700">意图假设</p>
              <ul
                className="mt-1 list-inside list-disc text-[12px] text-slate-800"
                data-testid="home-reception-intents"
              >
                {suggest.intents.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
              <p
                className="mt-1.5 text-[11px] leading-snug text-slate-600"
                data-testid="home-reception-reason"
              >
                {suggest.reason}
              </p>
            </div>

            <p className="mb-1 text-[11px] font-semibold text-slate-700">
              建议先去（可改）
            </p>
            <div
              className="flex flex-wrap gap-1.5"
              data-testid="home-reception-dept-picks"
              role="radiogroup"
              aria-label="建议部门"
            >
              <DeptPick
                door={suggest.primary}
                selected={(pickedSlug ?? suggest.primary.slug) === suggest.primary.slug}
                badge="主推"
                onSelect={() => setPickedSlug(suggest.primary.slug)}
              />
              {suggest.alts.map((a) => (
                <DeptPick
                  key={a.slug}
                  door={a}
                  selected={pickedSlug === a.slug}
                  badge="备选"
                  onSelect={() => setPickedSlug(a.slug)}
                />
              ))}
            </div>

            {suggest.roughGaps.length ? (
              <p
                className="mt-2 text-[11px] text-slate-500"
                data-testid="home-reception-gaps"
              >
                粗缺口：{suggest.roughGaps.join('；')}
              </p>
            ) : null}

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <button
                type="button"
                className="btn-press focus-ring rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-medium text-slate-700"
                data-testid="home-reception-reset"
                onClick={reset}
              >
                重来
              </button>
              <button
                type="button"
                className="btn-press focus-ring ml-auto inline-flex items-center gap-1.5 rounded-md bg-slate-900 px-3 py-1.5 text-[12px] font-semibold text-white hover:bg-slate-800"
                data-testid="home-reception-confirm"
                onClick={confirmGo}
              >
                确认去向 · 领进
                {pickedDoor?.label}
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
      <span className={selected ? 'text-slate-300' : 'text-slate-400'}>{door.num}</span>
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
