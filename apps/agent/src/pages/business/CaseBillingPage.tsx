import { Link, useParams } from 'react-router-dom'
import { useBusinessCases } from '../../business/BusinessCaseContext'

/**
 * 账单/委托壳 · product-pages §4.13
 * 结构占位：无报价/付款逻辑；不编造金额
 */
export function CaseBillingPage() {
  const { caseId = '' } = useParams()
  const { getCase } = useBusinessCases()
  const c = getCase(caseId)
  const home = `/agent/cases/${caseId}`

  if (!c) {
    return (
      <div
        className="flex flex-1 items-center justify-center p-8"
        data-testid="case-billing-page"
      >
      <div
        className="mx-auto mb-3 max-w-3xl rounded-lg border border-dashed border-slate-300 bg-slate-50 px-3 py-2 text-[11px] text-slate-600"
        data-testid="logistics-billing-thin"
      >
        账单/费用（后勤薄） · 一期后勤可薄；主路径仍是八部工作台与硬请示，勿当主交付。
      </div>
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
      data-testid="case-billing-page"
      data-case-id={caseId}
    >
      <div className="mx-auto max-w-2xl">
        <div className="mb-3 text-[11px] text-slate-400">
          <Link to={home} className="hover:underline">
            {c.title}
          </Link>
          <span className="mx-1">/</span>
          账单/委托
        </div>
        <h1 className="text-[20px] font-semibold text-slate-900">账单/委托</h1>
        <p className="mt-1 text-sm text-slate-500">
          委托范围与钱清楚；官费与服务费分口袋（结构壳 · 商务后续接入）
        </p>
        <p className="mt-2 text-[12px]">
          <Link
            to={home}
            className="font-medium text-slate-600 underline-offset-2 hover:underline"
            data-testid="case-billing-back-home"
          >
            ← 回公司首页
          </Link>
        </p>

        <div
          className="mt-8 rounded-xl border border-dashed border-slate-200 bg-white px-4 py-10 text-center"
          data-testid="case-billing-empty"
        >
          <p className="text-sm text-slate-500">尚未报价</p>
          <p className="mt-1 text-[11px] text-slate-400">
            首屏将分列委托摘要、应收/已付，以及官费口袋与服务费口袋。
          </p>
        </div>
      </div>
    </div>
  )
}
