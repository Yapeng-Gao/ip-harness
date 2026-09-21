import { Link, useNavigate, useParams } from 'react-router-dom'
import { useState } from 'react'
import { useBusinessCases } from '../../business/BusinessCaseContext'

/**
 * 「待我确认」收件箱 + 详情（成果优先 / 过程可折）
 */
export function PendingConfirmInboxPage() {
  const { getPendingConfirms, cases } = useBusinessCases()
  const inbox = getPendingConfirms()

  return (
    <div
      className="flex-1 overflow-y-auto px-4 py-6 lg:px-8"
      data-testid="pending-confirm-inbox"
    >
      <div className="mx-auto max-w-2xl">
        <div className="mb-3 text-[11px] text-slate-400">
          <Link to="/agent" className="hover:underline">
            我的案子
          </Link>
          <span className="mx-1">/</span>
          待我确认
        </div>
        <h1 className="text-[20px] font-semibold text-slate-900">待我确认</h1>
        <p className="mt-1 text-sm text-slate-500">
          与案子进度同源 · 确认后该项从收件箱消失
        </p>

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
    confirmItem,
    returnItem,
    getProgress,
  } = useBusinessCases()
  const [processOpen, setProcessOpen] = useState(false)
  const [doneMsg, setDoneMsg] = useState<string | null>(null)
  const [returnNote, setReturnNote] = useState('')

  const item = getConfirm(confirmId)
  const c = item ? getCase(item.caseId) : undefined

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
    confirmItem(item.id)
    const prog = getProgress(item.caseId)
    setDoneMsg('已确认 · 进度已更新')
    window.setTimeout(() => {
      navigate(`/agent/cases/${item.caseId}`, {
        state: { confirmed: item.kind, stage: prog.stageId },
      })
    }, 400)
  }

  const onReturn = () => {
    const note =
      returnNote.trim() ||
      (item.kind === 'oa_strategy' ? '策略方向不对 · 请重做' : '请按意见修改')
    returnItem(item.id, note)
    setDoneMsg(
      item.kind === 'research_ready'
        ? `已退回 · 请再查一轮（${note}）· 该项已回待确认`
        : item.kind === 'oa_strategy'
          ? `策略已驳回 · 请重做（${note}）· 该项已回待确认`
          : `已退回 · 请按意见修改（${note}）· 该项已回待确认`,
    )
    window.setTimeout(() => {
      navigate(`/agent/cases/${item.caseId}`)
    }, 500)
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
            <h2 className="text-xs font-semibold text-slate-700">成果</h2>
            <pre className="mt-2 whitespace-pre-wrap text-xs leading-relaxed text-slate-800">
              {item.resultPreview}
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

        {item.status === 'pending' ? (
          <div className="mt-5 space-y-2">
            <label className="block text-[11px] text-slate-500">
              退回意见（人话）
              <input
                value={
                  returnNote ||
                  (item.kind === 'oa_strategy'
                    ? '策略方向不对 · 请重做'
                    : '请按意见修改')
                }
                onChange={(e) => setReturnNote(e.target.value)}
                className="focus-ring mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-xs text-slate-800"
                placeholder={
                  item.kind === 'oa_strategy'
                    ? '策略方向不对 · 请重做'
                    : '请按意见修改'
                }
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
                {item.kind === 'oa_strategy' ? '确认答复策略' : '确认'}
              </button>
              <button
                type="button"
                onClick={onReturn}
                className="btn-press focus-ring rounded-md border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-700"
                data-testid="pending-confirm-return"
              >
                {item.kind === 'oa_strategy' ? '驳回策略' : '退回修改'}
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
