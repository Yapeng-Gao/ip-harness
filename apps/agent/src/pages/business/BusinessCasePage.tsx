import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  BUSINESS_DEFAULT_SEAT_IDS,
  BUSINESS_STAGES,
  CONFIRM_META,
  businessSeatLabel,
  type BusinessConfirmKind,
} from '../../business/businessSeats'
import { useBusinessCases } from '../../business/BusinessCaseContext'
import { CaseProcessPanel } from '../../components/business/CaseProcessPanel'
import { useEffect } from 'react'

const PREPARE_KINDS: Record<string, BusinessConfirmKind> = {
  intake: 'go_nogo',
  drafting: 'claims_ready',
  filing: 'file_authorize',
  oa: 'oa_strategy',
  prepare: 'research_ready',
}

/** 当前阶段可准备的确认序列（Knife1：交底/查新/权项） */
function nextKindForCase(
  stageId: string,
  doneSeatIds: string[],
): BusinessConfirmKind | null {
  if (stageId === 'prepare') return 'research_ready'
  if (stageId === 'intake') {
    if (!doneSeatIds.includes('expert-research')) return 'research_ready'
    return 'go_nogo'
  }
  if (stageId === 'drafting') {
    if (!doneSeatIds.includes('expert-disclosure')) return 'disclosure_ready'
    if (!doneSeatIds.includes('expert-draft')) return 'claims_ready'
    return 'claims_ready'
  }
  if (stageId === 'filing') return 'file_authorize'
  if (stageId === 'oa') return 'oa_strategy'
  return PREPARE_KINDS[stageId] ?? null
}

/**
 * 案子工作台 — 时间线 + 待确认 + 当前步骤；主 CTA 推进/去确认
 */
export function BusinessCasePage() {
  const { caseId = '' } = useParams()
  const navigate = useNavigate()
  const {
    getCase,
    getProgress,
    getPendingConfirms,
    primaryCta,
    advanceStage,
    prepareConfirm,
    stageLabel,
    lastReturnHint,
    clearReturnHint,
  } = useBusinessCases()

  useEffect(() => {
    if (!lastReturnHint) return
    const t = window.setTimeout(() => clearReturnHint(), 6000)
    return () => window.clearTimeout(t)
  }, [lastReturnHint, clearReturnHint])

  const c = getCase(caseId)
  const prog = getProgress(caseId)
  const pending = getPendingConfirms(caseId)
  const cta = primaryCta(caseId)

  if (!c) {
    return (
      <div className="flex flex-1 items-center justify-center p-8" data-testid="business-case-missing">
        <div className="text-center">
          <p className="text-sm text-slate-600">找不到这个案子</p>
          <Link to="/agent" className="mt-2 inline-block text-xs text-slate-800 underline">
            返回我的案子
          </Link>
        </div>
      </div>
    )
  }

  const stageIdx = BUSINESS_STAGES.findIndex((s) => s.id === prog.stageId)
  const oaLocked = !prog.filed

  const onPrimary = () => {
    if (cta.action === 'confirm' && cta.confirmId) {
      navigate(`/agent/pending/${cta.confirmId}`)
      return
    }
    // If no pending, prepare next confirm for current stage (真闭环演示) or advance prepare
    if (prog.stageId === 'prepare') {
      advanceStage(caseId)
      return
    }
    const kind = nextKindForCase(prog.stageId, prog.doneSeatIds)
    if (kind) {
      // 禁专家截入：OA 未递交不可准备
      if (kind === 'oa_strategy' && !prog.filed) return
      // 禁：未立项完成不得进递交
      if (
        kind === 'file_authorize' &&
        !prog.completedStages.includes('drafting') &&
        !prog.doneSeatIds.includes('expert-draft')
      ) {
        // still allow prepare if user is on filing stage via prior confirm
      }
      const item = prepareConfirm(caseId, kind)
      navigate(`/agent/pending/${item.id}`)
      return
    }
    advanceStage(caseId)
  }

  return (
    <div
      className="flex-1 overflow-y-auto px-4 py-6 lg:px-8"
      data-testid="business-case-page"
      data-case-id={caseId}
    >
      <div className="mx-auto max-w-3xl">
        <div className="mb-3 text-[11px] text-slate-400">
          <Link to="/agent" className="hover:underline">
            我的案子
          </Link>
          <span className="mx-1">/</span>
          {c.title}
        </div>

        <header className="mb-5 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-[20px] font-semibold text-slate-900">{c.title}</h1>
            <p className="mt-1 text-sm text-slate-500">
              {c.summary || '当前：' + stageLabel(prog.stageId)}
            </p>
          </div>
          <button
            type="button"
            onClick={onPrimary}
            className={`btn-press focus-ring rounded-md px-4 py-2 text-xs font-semibold ${
              cta.action === 'confirm'
                ? 'bg-amber-600 text-white'
                : 'bg-slate-900 text-white'
            }`}
            data-testid="business-case-primary-cta"
          >
            {cta.action === 'confirm' ? `去确认 · ${cta.label}` : cta.label}
          </button>
        </header>

        {/* 时间线 */}
        <section className="mb-5 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
            办理进度
          </h2>
          <ol className="space-y-2" data-testid="business-timeline">
            {BUSINESS_STAGES.map((s, i) => {
              const done = prog.completedStages.includes(s.id)
              const current = prog.stageId === s.id
              const locked = s.requiresFiled && oaLocked && !done
              return (
                <li
                  key={s.id}
                  className={`flex gap-3 rounded-lg border px-3 py-2 ${
                    current
                      ? 'border-slate-800 bg-slate-50'
                      : done
                        ? 'border-emerald-100 bg-emerald-50/40'
                        : locked
                          ? 'border-slate-100 bg-slate-50/50 opacity-60'
                          : 'border-slate-100 bg-white'
                  }`}
                  data-testid={`business-stage-${s.id}`}
                  data-current={current ? '1' : '0'}
                >
                  <span
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold ${
                      done
                        ? 'bg-emerald-600 text-white'
                        : current
                          ? 'bg-slate-900 text-white'
                          : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {done ? '✓' : i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-semibold text-slate-800">
                        {s.title}
                      </span>
                      {locked && (
                        <span className="text-[10px] text-slate-400">
                          递交后解锁
                        </span>
                      )}
                      {current && (
                        <span className="rounded bg-slate-900 px-1.5 py-px text-[10px] text-white">
                          当前
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500">{s.blurb}</p>
                    {s.seatIds.length > 0 && (
                      <div className="mt-1 flex flex-wrap gap-1">
                        {s.seatIds.map((sid) => (
                          <span
                            key={sid}
                            className={`rounded-full border px-1.5 py-px text-[10px] ${
                              prog.doneSeatIds.includes(sid)
                                ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                                : 'border-slate-200 text-slate-500'
                            }`}
                          >
                            {businessSeatLabel(sid)}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </li>
              )
            })}
          </ol>
        </section>

        {/* 7 席轨道 */}
        <section className="mb-5 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
            业务专家席（7）
          </h2>
          <div className="flex flex-wrap gap-1.5" data-testid="business-seven-seats">
            {BUSINESS_DEFAULT_SEAT_IDS.map((sid) => (
              <span
                key={sid}
                className={`rounded-full border px-2.5 py-1 text-[11px] font-medium ${
                  prog.doneSeatIds.includes(sid)
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                    : 'border-slate-200 bg-slate-50 text-slate-700'
                }`}
              >
                {businessSeatLabel(sid)}
              </span>
            ))}
          </div>
        </section>

        {/* 待确认 */}
        <section className="mb-5 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              待我确认
            </h2>
            <Link
              to="/agent/pending"
              className="text-[11px] text-slate-500 hover:underline"
            >
              收件箱
            </Link>
          </div>
          {pending.length === 0 ? (
            <p className="text-xs text-slate-500" data-testid="business-case-pending-empty">
              暂无需要你确认的事项
            </p>
          ) : (
            <ul className="space-y-1.5">
              {pending.map((item) => (
                <li key={item.id}>
                  <Link
                    to={`/agent/pending/${item.id}`}
                    className="focus-ring flex items-center justify-between rounded-lg border border-amber-100 bg-amber-50/60 px-3 py-2 text-xs hover:border-amber-300"
                    data-testid={`business-case-pending-${item.id}`}
                  >
                    <span className="font-medium text-slate-800">{item.title}</span>
                    <span className="text-[11px] text-slate-500">
                      {item.preparedBy} · {item.createdAt}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        {lastReturnHint && (
          <div
            className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-950"
            role="status"
            data-testid="business-return-hint"
          >
            {lastReturnHint}
          </div>
        )}

        <div className="mb-5">
          <CaseProcessPanel caseId={caseId} showDemos />
        </div>

        <p className="text-center text-[11px] text-slate-400">
          演示环境：进度与确认为样机闭环，非真递交局端。
        </p>
        {stageIdx >= 0 && CONFIRM_META.go_nogo && (
          <p className="mt-1 text-center text-[10px] text-slate-300">
            当前步与待确认读同一进度源
          </p>
        )}
      </div>
    </div>
  )
}
