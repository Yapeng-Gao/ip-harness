import {
  deptSlug,
  orgDeptByLeadSeat,
} from '../../departments/orgDepts'
import { Link, Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import { useBusinessCases } from '../../business/BusinessCaseContext'
import {
  CONFIRM_META,
  nextSeatAfterConfirm,
  normalizeResearchPass,
} from '../../business/businessSeats'
import {
  canRejectConfirm,
  confirmDecisionMeta,
  confirmStatusLabel,
  passConfirmEnabled,
  resolveConfirmActorKind,
  type ConfirmActorKind,
} from '../../business/confirmGate'
import {
  deptSlugForConfirmKind,
  normalizeDeptQuery,
  workbenchAskPath,
} from '../../business/pendingDeptQuery'
import { useEntryRole } from '../../business/useEntryRole'
import { buildHitlAssistReview } from '../../business/hitlAssist'
import { resolveConfirmResultMarkdown } from '../../business/confirmResultMarkdown'
import { HitlAssistCard } from '../../components/business/HitlAssistCard'
import { useProjectFolder } from '../../projects/ProjectFolderContext'

/** Inbox 主路径见 BossTodoInboxPage；此处仅详情/审计 */
export { BossTodoInboxPage as PendingConfirmInboxPage } from './BossTodoInboxPage'

export function PendingConfirmDetailPage() {
  const { confirmId = '' } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const {
    getConfirm,
    getCase,
    getProgress,
    confirmItem,
    returnItem,
  } = useBusinessCases()
  const { getThread } = useProjectFolder()
  const { entryRole } = useEntryRole()
  const deptFromQuery = normalizeDeptQuery(searchParams.get('dept'))
  const [processOpen, setProcessOpen] = useState(false)
  const [doneMsg, setDoneMsg] = useState<string | null>(null)
  const [returnNote, setReturnNote] = useState('')
  /** 演示：专家身份不可自批；默认按入口角色为人 */
  const [actorOverride, setActorOverride] = useState<ConfirmActorKind | null>(
    null,
  )

  const item = getConfirm(confirmId)
  const auditMode = searchParams.get('audit') === '1'
  const c = item ? getCase(item.caseId) : undefined
  const ownerSeat = item ? CONFIRM_META[item.kind].seatId : null
  const decision = item ? confirmDecisionMeta(item.kind) : null
  const actor = resolveConfirmActorKind(entryRole, actorOverride ?? undefined)
  const seatThread =
    item && ownerSeat ? getThread(item.caseId, ownerSeat) : undefined
  const resultMarkdown = useMemo(
    () =>
      item
        ? resolveConfirmResultMarkdown({
            resultPreview: item.resultPreview,
            artifactMarkdown: seatThread?.artifactMarkdown,
          })
        : '',
    [item, seatThread?.artifactMarkdown],
  )
  const usedSeatOverride = !!(
    item &&
    seatThread?.artifactMarkdown?.trim() &&
    resultMarkdown === seatThread.artifactMarkdown.trim()
  )
  const assist = item
    ? buildHitlAssistReview(item.kind, {
        pass: item.assistPass ?? 'first',
        priorReturnNote: item.priorReturnNote,
      })
    : null

  const passOk = item
    ? passConfirmEnabled({
        status: item.status,
        actor,
        resultPreview: item.resultPreview,
      })
    : false
  const rejectOk = canRejectConfirm(returnNote)

  useEffect(() => {
    if (!item || item.status !== 'pending') return
    setReturnNote(assist?.returnNote ?? '')
  }, [item?.id, item?.status, assist?.returnNote])

  if (!item || !decision) {
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <div className="text-center text-sm text-slate-600">
          找不到该确认项
          <div>
            <Link to="/agent/pending?audit=1" className="text-xs underline">
              返回审计列表
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // P0③：主路径废独立确认页 —— 软跳回部门工作台右栏；?audit=1 留薄审计
  if (item.status === 'pending' && !auditMode) {
    return (
      <Navigate
        to={workbenchAskPath(item.caseId, item.kind, { confirmId: item.id })}
        replace
      />
    )
  }

  const statusLabel = confirmStatusLabel(item.status)
  const statusTone =
    item.status === 'pending'
      ? 'border-amber-300 bg-amber-50 text-amber-950'
      : item.status === 'confirmed'
        ? 'border-emerald-300 bg-emerald-50 text-emerald-900'
        : 'border-rose-300 bg-rose-50 text-rose-900'

  const onConfirm = () => {
    if (!passOk) return
    const pass = normalizeResearchPass(getProgress(item.caseId).researchPass)
    void (async () => {
      const synced = await confirmItem(item.id)
      if (!synced.businessOk) return
      setDoneMsg(
        synced.midOk
          ? `已通过 · ${decision.decisionShort} · 可推进下一部门`
          : `已通过 · 案卷交接未写入（${synced.midMessage}）`,
      )
      const nextSeat = nextSeatAfterConfirm(item.kind, pass)
      const nextDept = orgDeptByLeadSeat(nextSeat)
      const nextPath = nextDept
        ? `/agent/cases/${item.caseId}/depts/${deptSlug(nextDept.id)}?seat=${nextSeat}`
        : `/agent/cases/${item.caseId}`
      window.setTimeout(() => {
        navigate(nextPath, {
          state: { confirmed: item.kind },
        })
      }, 400)
    })()
  }

  const onReturn = (noteOverride?: string) => {
    const note = (noteOverride ?? returnNote).trim()
    if (!canRejectConfirm(note)) {
      setDoneMsg('驳回须填写意见')
      return
    }
    const ownerSeatId = CONFIRM_META[item.kind].seatId
    const base = `已驳回 · ${note} · 已退回当前部门改稿（仍在本站）`
    void (async () => {
      const synced = await returnItem(item.id, note)
      setDoneMsg(
        synced.businessOk && !synced.midOk
          ? `${base} · 案卷交接未写入（${synced.midMessage}）`
          : base,
      )
      const ownerDept = orgDeptByLeadSeat(ownerSeatId)
      const backPath = ownerDept
        ? `/agent/cases/${item.caseId}/depts/${deptSlug(ownerDept.id)}?seat=${ownerSeatId}`
        : `/agent/cases/${item.caseId}`
      window.setTimeout(() => {
        navigate(backPath)
      }, 500)
    })()
  }

  return (
    <div
      className="flex-1 overflow-y-auto px-4 py-6 lg:px-8"
      data-testid="pending-confirm-detail"
      data-pending-audit={auditMode ? 'detail-v1' : undefined}
      data-confirm-id={confirmId}
      data-confirm-status={item.status}
      data-actor-kind={actor}
      data-dept={
        deptFromQuery ?? deptSlugForConfirmKind(item.kind) ?? ''
      }
    >
      <div className="mx-auto max-w-3xl">
        <nav
          className="mb-3 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11px] text-slate-500"
          aria-label="审计详情次要入口"
        >
          <Link
            to="/agent/pending?audit=1"
            className="focus-ring rounded-sm font-medium text-slate-600 underline-offset-2 hover:underline"
            data-testid="pending-detail-back-audit"
          >
            确认审计
          </Link>
          <span aria-hidden className="text-slate-300">
            ·
          </span>
          <span className="text-slate-400">{item.title}</span>
        </nav>

        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${statusTone}`}
            data-testid="pending-status-badge"
          >
            {statusLabel}
          </span>
          {(() => {
            const slug = deptFromQuery ?? deptSlugForConfirmKind(item.kind)
            if (!slug) return null
            const d = orgDeptByLeadSeat(CONFIRM_META[item.kind].seatId)
            return (
              <span
                className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-[11px] font-medium text-slate-700"
                data-testid="pending-dept-badge"
                data-dept={slug}
              >
                部身份 · {d?.label ?? slug}
              </span>
            )
          })()}
          <span
            className="text-[11px] text-slate-500"
            data-testid="pending-audit-framing"
          >
            {auditMode
              ? '审计只读 · 拍板在工作台右栏'
              : '这是拍板，不是「下一步」'}
          </span>
        </div>

        <h1 className="mt-2 text-[20px] font-semibold text-slate-900">
          {c?.title ?? '案子'} · {item.title}
        </h1>
        <p className="mt-1 text-sm text-slate-500">{item.summary}</p>

        <section
          className="mt-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
          data-testid="pending-decision-block"
        >
          <h2 className="text-xs font-semibold text-slate-700">决策含义</h2>
          <p className="mt-1 text-sm font-medium text-slate-900">
            {decision.decisionShort}
          </p>
          <p className="mt-1 text-[12px] leading-relaxed text-slate-600">
            {decision.decisionMeaning}
          </p>
          <div className="mt-3 grid gap-2 text-[11px] sm:grid-cols-2">
            <p className="rounded-md bg-amber-50 px-2.5 py-2 text-amber-950">
              <span className="font-semibold">确认人</span> ·{' '}
              {decision.confirmerLabel}
              <span className="mt-0.5 block text-[10px] text-amber-800/80">
                确认权跟人；过/驳回有决策含义
              </span>
            </p>
            <p className="rounded-md bg-slate-50 px-2.5 py-2 text-slate-600">
              <span className="font-semibold">建议者（无确认权）</span> ·{' '}
              {decision.suggesterLabel}
              <span className="mt-0.5 block text-[10px] text-slate-400">
                专家建议稿 ≠ 确认；不可自批
              </span>
            </p>
          </div>
        </section>

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="text-xs font-semibold text-slate-700">交卷摘要</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              {item.summary}
            </p>
            <p className="mt-3 text-[11px] text-slate-400">
              {item.preparedBy}准备好的 · {item.createdAt}
            </p>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="text-xs font-semibold text-slate-700">
              成果
              {usedSeatOverride ? (
                <span
                  className="ml-2 text-[10px] font-normal text-emerald-700"
                  data-testid="pending-result-from-seat"
                >
                  与席覆盖稿同源
                </span>
              ) : null}
            </h2>
            <pre
              className="mt-2 whitespace-pre-wrap text-xs leading-relaxed text-slate-800"
              data-testid="pending-result-body"
            >
              {resultMarkdown}
            </pre>
            <button
              type="button"
              onClick={() => setProcessOpen((v) => !v)}
              className="btn-press focus-ring mt-3 text-[11px] font-medium text-slate-500 underline-offset-2 hover:underline"
              data-testid="pending-process-toggle"
            >
              {processOpen ? '收起办理过程' : '展开办理过程'}
            </button>
            {processOpen && (
              <pre className="mt-2 whitespace-pre-wrap rounded-lg bg-slate-50 p-2 text-[11px] text-slate-600">
                {item.processPreview}
              </pre>
            )}
          </section>
        </div>

        {item.status === 'pending' && auditMode ? (
          <div
            className="mt-5 space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4"
            data-testid="pending-audit-actions"
          >
            <p className="text-[12px] font-medium text-slate-800">
              本页只读审计 · 不在此通过 / 驳回
            </p>
            <p className="text-[11px] leading-relaxed text-slate-600">
              拍板主路径在部门工作台右栏。点下面进本案该部，硬请示在对话里。
            </p>
            <Link
              to={workbenchAskPath(item.caseId, item.kind, {
                confirmId: item.id,
              })}
              className="btn-press focus-ring inline-flex items-center justify-center rounded-md bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
              data-testid="pending-goto-workbench"
            >
              去工作台拍板
            </Link>
          </div>
        ) : null}

        {item.status === 'pending' && !auditMode && (
          <div className="mt-4">
            <HitlAssistCard
              kind={item.kind}
              pass={item.assistPass ?? 'first'}
              priorReturnNote={item.priorReturnNote}
              onApplyReturn={(note) => {
                setReturnNote(note)
                onReturn(note)
              }}
            />
          </div>
        )}

        {item.status === 'pending' && !auditMode ? (
          <div className="mt-5 space-y-3" data-testid="pending-actions">
            <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-[11px] text-slate-600">
              <p className="font-medium text-slate-800">以谁的身份拍板（演示）</p>
              <div className="mt-1.5 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setActorOverride('human')}
                  className={`btn-press focus-ring rounded-md px-2.5 py-1 text-[11px] font-medium ${
                    actor === 'human'
                      ? 'bg-slate-900 text-white'
                      : 'border border-slate-200 bg-white text-slate-700'
                  }`}
                  data-testid="pending-actor-human"
                >
                  {decision.confirmerLabel}
                </button>
                <button
                  type="button"
                  onClick={() => setActorOverride('expert')}
                  className={`btn-press focus-ring rounded-md px-2.5 py-1 text-[11px] font-medium ${
                    actor === 'expert'
                      ? 'bg-rose-700 text-white'
                      : 'border border-slate-200 bg-white text-slate-700'
                  }`}
                  data-testid="pending-actor-expert"
                >
                  专家/起草人（无确认权）
                </button>
              </div>
              {actor === 'expert' ? (
                <p
                  className="mt-1.5 text-[10px] font-medium text-rose-700"
                  data-testid="pending-expert-blocked"
                >
                  专家建议稿 ≠ 确认；当前身份不能通过。
                </p>
              ) : null}
            </div>

            <label className="block text-[11px] text-slate-500">
              驳回意见（必填才可驳回）
              <input
                value={returnNote}
                onChange={(e) => setReturnNote(e.target.value)}
                className="focus-ring mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-xs text-slate-800"
                placeholder={assist?.returnNote ?? '请按意见修改'}
                data-testid="pending-return-note"
              />
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={onConfirm}
                disabled={!passOk}
                title={
                  !passOk
                    ? actor === 'expert'
                      ? '专家/起草人不能自批'
                      : '材料未齐或状态不可通过'
                    : `通过并推进：${decision.decisionShort}`
                }
                className="btn-press focus-ring rounded-md bg-amber-600 px-4 py-2 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
                data-testid="pending-confirm-submit"
                data-pass-ok={passOk ? '1' : '0'}
              >
                通过 · {decision.decisionShort}
              </button>
              <button
                type="button"
                onClick={() => onReturn()}
                disabled={!rejectOk}
                title={!rejectOk ? '驳回须填写意见' : '驳回并退回当前部门'}
                className="btn-press focus-ring rounded-md border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                data-testid="pending-confirm-return"
                data-reject-ok={rejectOk ? '1' : '0'}
              >
                驳回并退回当前部
              </button>
            </div>
            <p className="text-[10px] text-slate-400">
              通过 → 移交下一站；驳回 → 回流本台带意见。无人确认不能往下站推进。
            </p>
          </div>
        ) : item.status !== 'pending' ? (
          <p
            className={`mt-5 text-sm font-medium ${
              item.status === 'confirmed' ? 'text-emerald-700' : 'text-rose-700'
            }`}
            data-testid="pending-handled"
          >
            {statusLabel}
            {item.status === 'returned' && item.returnNote
              ? ` · ${item.returnNote}`
              : ''}
          </p>
        ) : null}

        {doneMsg && (
          <p className="mt-3 text-xs font-medium text-emerald-700" role="status">
            {doneMsg}
          </p>
        )}
      </div>
    </div>
  )
}
