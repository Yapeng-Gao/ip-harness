import {
  deptSlug,
  orgDeptByLeadSeat,
} from '../../departments/orgDepts'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import { useBusinessCases } from '../../business/BusinessCaseContext'
import {
  CONFIRM_META,
  nextSeatAfterConfirm,
  normalizeResearchPass,
} from '../../business/businessSeats'
import { buildHitlAssistReview } from '../../business/hitlAssist'
import { resolveConfirmResultMarkdown } from '../../business/confirmResultMarkdown'
import { HitlAssistCard } from '../../components/business/HitlAssistCard'
import { useProjectFolder } from '../../projects/ProjectFolderContext'

/**
 * 「待我确认」收件箱 + 详情（成果优先 / 过程可折 / 助手审校必挂）
 * 支持 ?caseId= 按案过滤（案页铃铛带入，消种子污染感）
 */
export function PendingConfirmInboxPage() {
  const { getPendingConfirms, cases, getCase } = useBusinessCases()
  const [params] = useSearchParams()
  const filterCaseId = params.get('caseId')?.trim() || undefined
  const inbox = getPendingConfirms(filterCaseId)
  const filterCase = filterCaseId ? getCase(filterCaseId) : undefined

  return (
    <div
      className="flex-1 overflow-y-auto px-4 py-6 lg:px-8"
      data-testid="pending-confirm-inbox"
      data-case-filter={filterCaseId ?? ''}
    >
      <div className="mx-auto max-w-2xl">
        <div className="mb-3 text-[11px] text-slate-400">
          <Link to="/agent" className="hover:underline">
            我的案子
          </Link>
          <span className="mx-1">/</span>
          {filterCaseId ? (
            <>
              <Link
                to={`/agent/cases/${filterCaseId}`}
                className="hover:underline"
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
          {filterCaseId ? '本案待确认' : '待我确认'}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          {filterCaseId
            ? '仅显示本案 pending · 与进度同源'
            : '与案子进度同源 · 确认后该项从收件箱消失 · 详情内有助手审校'}
        </p>
        {filterCaseId ? (
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
                    to={`/agent/pending/${item.id}`}
                    className="focus-ring block rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm hover:border-amber-300"
                    data-testid={`pending-row-${item.id}`}
                  >
                    <div className="text-sm font-semibold text-slate-900">
                      {c?.title ?? '案子'} · {item.title}
                    </div>
                    <div className="mt-0.5 text-[11px] text-slate-500">
                      {item.summary}
                    </div>
                    <div className="mt-1 text-[11px] text-slate-400">
                      {item.preparedBy}准备好的 · {item.createdAt}
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
  const navigate = useNavigate()
  const {
    getConfirm,
    getCase,
    getProgress,
    confirmItem,
    returnItem,
  } = useBusinessCases()
  const { getThread } = useProjectFolder()
  const [processOpen, setProcessOpen] = useState(false)
  const [doneMsg, setDoneMsg] = useState<string | null>(null)
  const [returnNote, setReturnNote] = useState('')

  const item = getConfirm(confirmId)
  const c = item ? getCase(item.caseId) : undefined
  const ownerSeat = item ? CONFIRM_META[item.kind].seatId : null
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

  useEffect(() => {
    if (!item || item.status !== 'pending') return
    setReturnNote(assist?.returnNote ?? '')
  }, [item?.id, item?.status, assist?.returnNote])

  if (!item) {
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <div className="text-center text-sm text-slate-600">
          找不到该确认项
          <div>
            <Link to="/agent/pending" className="text-xs underline">
              返回收件箱
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const onConfirm = () => {
    // nextSeat 用确认前的查新轮次（确认后 researchPass 会加一）
    const pass = normalizeResearchPass(getProgress(item.caseId).researchPass)
    void (async () => {
      const synced = await confirmItem(item.id)
      if (!synced.businessOk) return
      setDoneMsg(
        synced.midOk
          ? '已确认 · 进度已写入中台'
          : `业务进度已更新 · 中台交接未写入（${synced.midMessage}）`,
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
    const note =
      (noteOverride ?? returnNote).trim() ||
      assist?.returnNote ||
      (item.kind === 'oa_strategy'
        ? '策略方向不对 · 请重做'
        : item.kind === 'layout_adjust'
          ? '布局方向需再调'
          : '请按意见修改')
    const ownerSeat = CONFIRM_META[item.kind].seatId
    const base =
      item.kind === 'research_ready'
        ? `已退回 · ${note} · 交卷席将按意见改一版`
        : item.kind === 'oa_strategy'
          ? `策略已驳回 · ${note} · 审查答复席将按意见重做`
          : item.kind === 'layout_adjust'
            ? `已退回 · ${note} · 布局席将按意见调整`
            : `已退回 · ${note} · 交卷席将按意见改一版`
    void (async () => {
      const synced = await returnItem(item.id, note)
      setDoneMsg(
        synced.businessOk && !synced.midOk
          ? `${base} · 中台交接未写入（${synced.midMessage}）`
          : base,
      )
      const ownerDept = orgDeptByLeadSeat(ownerSeat)
      const backPath = ownerDept
        ? `/agent/cases/${item.caseId}/depts/${deptSlug(ownerDept.id)}?seat=${ownerSeat}`
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
    >
      <div className="mx-auto max-w-3xl">
        <div className="mb-3 text-[11px] text-slate-400">
          <Link to="/agent/pending" className="hover:underline">
            待我确认
          </Link>
          <span className="mx-1">/</span>
          {item.title}
        </div>
        <h1 className="text-[20px] font-semibold text-slate-900">
          {c?.title ?? '案子'} · {item.title}
        </h1>
        <p className="mt-1 text-sm text-slate-500">{item.summary}</p>

        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="text-xs font-semibold text-slate-700">摘要</h2>
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
          <div className="mt-5 space-y-2">
            <label className="block text-[11px] text-slate-500">
              退回意见（人话 · 默认已按助手审校预填，可改）
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
                className="btn-press focus-ring rounded-md bg-amber-600 px-4 py-2 text-xs font-semibold text-white"
                data-testid="pending-confirm-submit"
              >
                {item.title}
              </button>
              <button
                type="button"
                onClick={() => onReturn()}
                className="btn-press focus-ring rounded-md border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-700"
                data-testid="pending-confirm-return"
              >
                {item.kind === 'oa_strategy'
                  ? '驳回策略'
                  : item.kind === 'layout_adjust'
                    ? '退回调整布局'
                    : '退回修改'}
              </button>
            </div>
          </div>
        ) : (
          <p className="mt-5 text-sm text-emerald-700">已处理（{item.status}）</p>
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
