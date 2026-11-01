import { Link, useParams } from 'react-router-dom'
import { SoftEmpty } from '../../components/soft/SoftEmpty'
import { BillingDemoHonestBanner } from '../../components/business/BillingDemoHonestBanner'
import { useBusinessCases } from '../../business/BusinessCaseContext'

/**
 * 账单/委托 · product-pages §4.12
 * 机制：后勤横切——委托摘要 + 官费/服务费分口袋可见。
 * 禁：官费与服务费混账；编造应付金额；抢公司→工作台主链；假「当前项目」。
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
        <div className="text-center">
          <p className="text-sm text-slate-600">找不到这个案子</p>
          <Link
            to="/agent/cases"
            className="mt-3 inline-block text-sm font-medium text-slate-900 underline"
          >
            返回案盘
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div
      className="flex-1 overflow-y-auto px-4 py-6 lg:px-8"
      data-testid="case-billing-page"
      data-billing="pockets-v1"
      data-billing-demo="1"
      data-case-id={caseId}
    >
      <div className="mx-auto max-w-2xl">
        <nav
          className="mb-3 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11px] text-slate-500"
          aria-label="账单次要入口"
          data-testid="case-billing-secondary"
        >
          {/* §107 G06：回大厅靠左栏 */}
          <Link
            to={home}
            className="focus-ring rounded-sm font-medium text-slate-600 underline-offset-2 hover:text-slate-900 hover:underline"
            data-testid="case-billing-back-home"
          >
            本案
          </Link>
          <span aria-hidden className="text-slate-300">
            ·
          </span>
          <Link
            to={`${home}/docket`}
            className="focus-ring rounded-sm font-medium text-slate-600 underline-offset-2 hover:text-slate-900 hover:underline"
          >
            期限台
          </Link>
          <span aria-hidden className="text-slate-300">
            ·
          </span>
          <Link
            to={`${home}/members`}
            className="focus-ring rounded-sm font-medium text-slate-600 underline-offset-2 hover:text-slate-900 hover:underline"
          >
            成员
          </Link>
        </nav>

        <BillingDemoHonestBanner className="mb-1" />
        <p
          className="mt-2 text-[11px] text-slate-500"
          data-testid="case-billing-thin-hint"
          role="status"
        >
          费用后置示意 · 官费与服务费分列 · 先回本案八部办事
        </p>

        <h1
          className="mt-3 text-[20px] font-semibold text-slate-900"
          data-testid="case-billing-heading"
        >
          账单/委托
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          委托范围与钱清楚；金额以当期约定为准，本页不编造应付数。
        </p>

        <section
          className="mt-5 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
          data-testid="case-billing-engagement"
          aria-labelledby="billing-engagement-title"
        >
          <h2
            id="billing-engagement-title"
            className="text-xs font-semibold text-slate-700"
          >
            委托摘要
          </h2>
          <p className="mt-1.5 text-sm font-medium text-slate-900">{c.title}</p>
          <p className="mt-1 text-[12px] leading-relaxed text-slate-600">
            {c.summary?.trim() || '范围待商务补齐 · 主路径仍在八部作业与硬请示'}
          </p>
          <dl className="mt-3 grid grid-cols-2 gap-2 text-[11px] text-slate-500">
            <div>
              <dt className="font-medium text-slate-600">应收</dt>
              <dd data-testid="case-billing-receivable" data-amount-demo="1">尚未报价 · 示意</dd>
            </div>
            <div>
              <dt className="font-medium text-slate-600">已付</dt>
              <dd data-testid="case-billing-paid" data-amount-demo="1" data-paid-demo="0">未付款（示意 · 非已付）</dd>
            </div>
          </dl>
        </section>

        <div
          className="mt-4 grid gap-3 sm:grid-cols-2"
          data-testid="case-billing-pockets"
        >
          <section
            className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
            data-testid="case-billing-pocket-official"
            aria-labelledby="pocket-official-title"
          >
            <h2
              id="pocket-official-title"
              className="text-xs font-semibold text-slate-700"
            >
              官费口袋
            </h2>
            <p
              className="mt-2 text-[22px] font-semibold tabular-nums text-slate-400"
              data-testid="case-billing-official-amount"
              data-amount-demo="1"
            >
              <span className="mr-1 rounded bg-amber-100 px-1 text-[10px] font-semibold text-amber-900">
                DEMO
              </span>
              —
            </p>
            <p className="mt-1 text-[11px] text-slate-500">
              官费单独列 · 不与服务费混账 · 无真缴费通道 · 非应付数
            </p>
          </section>
          <section
            className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
            data-testid="case-billing-pocket-service"
            aria-labelledby="pocket-service-title"
          >
            <h2
              id="pocket-service-title"
              className="text-xs font-semibold text-slate-700"
            >
              服务费口袋
            </h2>
            <p
              className="mt-2 text-[22px] font-semibold tabular-nums text-slate-400"
              data-testid="case-billing-service-amount"
              data-amount-demo="1"
            >
              <span className="mr-1 rounded bg-amber-100 px-1 text-[10px] font-semibold text-amber-900">
                DEMO
              </span>
              —
            </p>
            <p className="mt-1 text-[11px] text-slate-500">
              代理/服务费单独列 · 商务后置接入 · 非应付数
            </p>
          </section>
        </div>

        <div
          className="mt-5 flex flex-wrap items-center gap-2"
          data-testid="case-billing-actions"
        >
          <button
            type="button"
            disabled
            title="后置 · 无真报价通道"
            className="btn-press focus-ring rounded-md border border-slate-200 bg-white px-3 py-1.5 text-[12px] font-medium text-slate-400 disabled:cursor-not-allowed"
            data-testid="case-billing-quote-disabled"
            data-cta-guard="1"
            aria-disabled="true"
          >
            确认报价（后置）
          </button>
          <button
            type="button"
            disabled
            title="后置 · 无真付款通道"
            className="btn-press focus-ring rounded-md border border-slate-200 bg-white px-3 py-1.5 text-[12px] font-medium text-slate-400 disabled:cursor-not-allowed"
            data-testid="case-billing-pay-disabled"
            data-cta-guard="1"
            aria-disabled="true"
          >
            登记付款（后置）
          </button>
          <Link
            to={home}
            className="btn-press focus-ring inline-flex rounded-md bg-slate-900 px-3 py-1.5 text-[12px] font-semibold text-white"
            data-testid="case-billing-to-company"
          >
            回本案八部
          </Link>
        </div>

        <SoftEmpty
          kind="billing-empty"
          density="compact"
          testId="case-billing-empty-note"
          className="mt-4 border-0 bg-transparent px-0 py-1 text-center"
        />
      </div>
    </div>
  )
}
