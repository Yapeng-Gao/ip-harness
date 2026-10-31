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
  confirmKindFromDeptQuery,
  deptSlugForConfirmKind,
  normalizeDeptQuery,
  pendingAuditPath,
  workbenchAskPath,
} from '../../business/pendingDeptQuery'
import { useEntryRole } from '../../business/useEntryRole'
import { buildHitlAssistReview } from '../../business/hitlAssist'
import { resolveConfirmResultMarkdown } from '../../business/confirmResultMarkdown'
import { HitlAssistCard } from '../../components/business/HitlAssistCard'
import { useProjectFolder } from '../../projects/ProjectFolderContext'
import { useOrgConfig } from '../../departments/OrgConfigContext'

/**
 * 「待我确认」收件箱 + 详情（成果优先 / 过程可折 / 助手审校必挂）
 * 支持 ?caseId= 按案过滤；?dept= 按部身份（对齐原型 pending-confirm?dept=）
 */
export function PendingConfirmInboxPage() {
  const { getPendingConfirms, cases, getCase } = useBusinessCases()
  const { deptLabel } = useOrgConfig()
  const [params] = useSearchParams()
  const filterCaseId = params.get('caseId')?.trim() || undefined
  const deptQuery = normalizeDeptQuery(params.get('dept'))
  const kindFilter = confirmKindFromDeptQuery(deptQuery)
  const rawInbox = getPendingConfirms(filterCaseId)
  const inbox = useMemo(
    () => (kindFilter ? rawInbox.filter((i) => i.kind === kindFilter) : rawInbox),
    [rawInbox, kindFilter],
  )
  const filterCase = filterCaseId ? getCase(filterCaseId) : undefined
  const deptFilterLabel = (() => {
    if (!kindFilter) return deptQuery
    const d = orgDeptByLeadSeat(CONFIRM_META[kindFilter].seatId)
    return d ? deptLabel(d) : deptQuery
  })()

  const auditMode = params.get('audit') === '1'
  // 独立收件箱降权：无 audit → 回大厅铃铛主路径（右栏拍板）
  if (!auditMode && !deptQuery && !filterCaseId) {
    return <Navigate to="/agent?pending=1" replace />
  }
  // 有 ?dept= 且恰一条 → 软跳工作台（审计模式才进详情）
  if (deptQuery && kindFilter && inbox.length === 1) {
    const only = inbox[0]!
    return (
      <Navigate
        to={
          auditMode
            ? pendingAuditPath(only.id, deptQuery)
            : workbenchAskPath(only.caseId, only.kind, { confirmId: only.id })
        }
        replace
      />
    )
  }

  return (
    <div
      className="flex-1 overflow-y-auto px-4 py-6 lg:px-8"
      data-testid="pending-confirm-inbox"
      data-case-filter={filterCaseId ?? ''}
      data-dept-filter={deptQuery ?? ''}
    >
      <div className="mx-auto max-w-2xl">
        <p className="mb-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-[11px] text-slate-600" data-testid="pending-soft-hint">
          拍板主路径在部门工作台右栏（大厅铃铛进）。本页仅审计列表
          {auditMode ? '（audit）' : '——点条目会软跳回工作台'}。
        </p>
        <div className="mb-3 text-[11px] text-slate-400">
          <Link to="/agent/cases" className="focus-ring rounded-sm hover:underline">
            多案流水
          </Link>
          <span className="mx-1">/</span>
          {filterCaseId ? (
            <>
              <Link
                to={`/agent/cases/${filterCaseId}`}
                className="focus-ring rounded-sm hover:underline"
              >
                {filterCase?.title ?? '本案'}
              </Link>
              <span className="mx-1">/</span>
              待确认
            </>
          ) : (
            '待我确认'
          )}
        </div>
        <h1 className="text-[20px] font-semibold text-slate-900">
          {filterCaseId
            ? '本案待确认'
            : deptFilterLabel
              ? `${deptFilterLabel} · 待你确认`
              : '待我确认'}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          {deptFilterLabel
            ? `按部身份筛选 · ${deptFilterLabel}（?dept=${deptQuery}）`
            : filterCaseId
              ? '仅显示本案 pending · 与进度同源'
              : '与案子进度同源 · 确认后该项从收件箱消失 · 详情内有助手审校'}
        </p>
        {filterCaseId || deptQuery ? (
          <p className="mt-1 text-[11px] text-slate-400">
            <Link
              to="/agent/pending"
              className="font-medium text-slate-600 underline-offset-2 hover:underline"
              data-testid="pending-show-all"
            >
              查看全部待确认
            </Link>
          </p>
        ) : null}

        {inbox.length === 0 ? (
          <p
            className="mt-8 rounded-xl border border-dashed border-slate-200 bg-white px-4 py-10 text-center text-sm text-slate-500"
            data-testid="pending-empty"
          >
            暂无需要你确认的事项
          </p>
        ) : (
          <ul className="mt-5 space-y-2">
            {inbox.map((item) => {
              const c = cases.find((x) => x.id === item.caseId)
              return (
                <li key={item.id}>
                  <Link
                    to={
                      auditMode
                        ? pendingAuditPath(
                            item.id,
                            deptSlugForConfirmKind(item.kind) ?? deptQuery,
                          )
                        : workbenchAskPath(item.caseId, item.kind, {
                            confirmId: item.id,
                          })
                    }
                    className="focus-ring block rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm hover:border-amber-300"
                    data-testid={`pending-row-${item.id}`}
                    data-dept={deptSlugForConfirmKind(item.kind) ?? ''}
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-950"
                        data-testid={`pending-status-${item.id}`}
                      >
                        待你确认
                      </span>
                      <div className="text-sm font-semibold text-slate-900">
                        {c?.title ?? '案子'} · {item.title}
                      </div>
                    </div>
                    <div className="mt-0.5 text-[11px] text-slate-500">
                      {item.summary}
                    </div>
                    <div className="mt-1 text-[11px] text-slate-400">
                      {item.preparedBy}准备好的 · {item.createdAt} · 非已办完
                    </div>
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}

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
          : `已通过 · 中台交接未写入（${synced.midMessage}）`,
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
    const base = `已驳回 · ${note} · 已退回当前部门改稿（不换部）`
    void (async () => {
      const synced = await returnItem(item.id, note)
      setDoneMsg(
        synced.businessOk && !synced.midOk
          ? `${base} · 中台交接未写入（${synced.midMessage}）`
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
      data-confirm-id={confirmId}
      data-confirm-status={item.status}
      data-actor-kind={actor}
      data-dept={
        deptFromQuery ?? deptSlugForConfirmKind(item.kind) ?? ''
      }
    >
      <div className="mx-auto max-w-3xl">
        <div className="mb-3 text-[11px] text-slate-400">
          <Link to="/agent/pending" className="focus-ring rounded-sm hover:underline">
            待我确认
          </Link>
          <span className="mx-1">/</span>
          {item.title}
        </div>

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
          <span className="text-[11px] text-slate-500">
            这是拍板，不是「下一步」
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

        {item.status === 'pending' && (
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

        {item.status === 'pending' ? (
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
              通过 → 移交下一部门；驳回 → 回流本台带意见。无人确认不能换部推进。
            </p>
          </div>
        ) : (
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
        )}

        {doneMsg && (
          <p className="mt-3 text-xs font-medium text-emerald-700" role="status">
            {doneMsg}
          </p>
        )}
      </div>
    </div>
  )
}
