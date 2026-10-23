import { Link, useParams } from 'react-router-dom'
import { useBusinessCases } from '../../business/BusinessCaseContext'

/**
 * 期限台壳 · product-pages §4.12
 * 结构占位：无真实期限引擎 / 不法条金额
 */
export function CaseDocketPage() {
  const { caseId = '' } = useParams()
  const { getCase } = useBusinessCases()
  const c = getCase(caseId)
  const home = `/agent/cases/${caseId}`

  if (!c) {
    return (
      <div
        className="flex flex-1 items-center justify-center p-8"
        data-testid="case-docket-page"
      >
        <div className="text-center">
          <p className="text-sm text-slate-600">找不到这个案子</p>
          <Link
            to="/agent/cases"
            className="mt-3 inline-block text-sm font-medium text-slate-900 underline"
          >
            返回案子列表
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div
      className="flex-1 overflow-y-auto px-4 py-6 lg:px-8"
      data-testid="case-docket-page"
      data-case-id={caseId}
    >
      <div className="mx-auto max-w-2xl">
        <div className="mb-3 text-[11px] text-slate-400">
          <Link to={home} className="hover:underline">
            {c.title}
          </Link>
          <span className="mx-1">/</span>
          期限台
        </div>
        <h1 className="text-[20px] font-semibold text-slate-900">期限台</h1>
        <p className="mt-1 text-sm text-slate-500">
          看见本案法定/程序期限与绝限（结构壳 · 引擎后续接入）
        </p>
        <p className="mt-2 text-[12px]">
          <Link
            to={home}
            className="font-medium text-slate-600 underline-offset-2 hover:underline"
            data-testid="case-docket-back-home"
          >
            ← 回公司首页
          </Link>
        </p>

        <div
          className="mt-8 rounded-xl border border-dashed border-slate-200 bg-white px-4 py-10 text-center"
          data-testid="case-docket-empty"
        >
          <p className="text-sm text-slate-500">本案暂无期限事件</p>
          <p className="mt-1 text-[11px] text-slate-400">
            列表将展示名称、到期日、状态与关联部门；逾期须可见，不可静默。
          </p>
        </div>
      </div>
    </div>
  )
}
