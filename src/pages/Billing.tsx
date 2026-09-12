import { useEffect, useMemo } from 'react'
import { Link, useLocation, useSearchParams } from 'react-router-dom'
import {
  CreditCard,
  Building2,
  Scale,
  Check,
  Receipt,
  Filter,
  ShieldAlert,
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import {
  evaluatePayUnlock,
  firstGuardrailMessage,
} from '../domain/guardrails'
import type { InvoiceStatus } from '../types'
import { PageHeader } from '../components/PageHeader'

const ENTERPRISE_PLANS = [
  {
    id: 'case',
    name: '按案件计费',
    price: '¥2,800',
    unit: '/ 件起',
    desc: '适合偶发申请；含中台闸门 + 基础洞察额度',
    features: ['单案全生命周期', '自助 / 委托切换', '基础赛道洞察 20 次/月'],
    badge: '灵活',
  },
  {
    id: 'annual',
    name: '年费套餐 · 专业版',
    price: '¥98,000',
    unit: '/ 年',
    desc: '中大型企业 IP 中台；含组织权限与洞察全模块',
    features: ['不限案件数（示意）', '组织与权限', '洞察四页全开', '专属客户成功'],
    badge: '推荐',
    highlight: true,
  },
  {
    id: 'nodes',
    name: '节点加购',
    price: '¥12,000',
    unit: '/ 节点 · 年',
    desc: '在年费基础上加购业务办理节点席位',
    features: ['撰写 / 答复节点', '代理协同席位', '履约评分看板'],
    badge: '加购',
  },
]

const AGENCY_TERMS = [
  { label: '平台抽佣比例', value: '8%–15%', note: '按委托成交额；优质所可下调至 8%（示意）' },
  { label: '入驻年费', value: '¥6,800 / 年', note: '含市场曝光、派单资格与基础协作工具' },
  { label: '优质所加持', value: '评级 ≥ 4.5', note: '优先派单、抽佣折扣、洞察组合数据只读（示意）' },
]

const STATUS_STYLE: Record<InvoiceStatus, string> = {
  待开票: 'bg-slate-100 text-slate-700 ring-1 ring-slate-200',
  已开票: 'bg-sky-50 text-sky-800 ring-1 ring-sky-200',
  已付款: 'bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200',
  逾期: 'bg-rose-50 text-rose-800 ring-1 ring-rose-200',
}

export function Billing() {
  const {
    visibleCases,
    workspace,
    dispatchCommand,
    role,
    persona,
    overdueStopEnabled,
    setOverdueStopEnabled,
    addInvoice,
    getCase,
  } = useApp()
  const loc = useLocation()
  const [params, setParams] = useSearchParams()
  const isSettingsBilling = loc.pathname.startsWith('/settings/billing')
  const tabParam = params.get('tab')
  const statusParam = params.get('status') as InvoiceStatus | 'all' | null

  const tab: 'ledger' | 'model' =
    tabParam === 'model' || (isSettingsBilling && tabParam !== 'ledger')
      ? 'model'
      : 'ledger'

  const statusFilter: InvoiceStatus | 'all' =
    statusParam && ['待开票', '已开票', '已付款', '逾期', 'all'].includes(statusParam)
      ? statusParam
      : 'all'

  useEffect(() => {
    if (isSettingsBilling && !tabParam) {
      const next = new URLSearchParams(params)
      next.set('tab', 'model')
      setParams(next, { replace: true })
    }
  }, [isSettingsBilling, tabParam, params, setParams])

  const setTab = (t: 'ledger' | 'model') => {
    const next = new URLSearchParams(params)
    next.set('tab', t)
    if (t === 'model') next.delete('status')
    setParams(next, { replace: true })
  }

  const setStatusFilter = (s: InvoiceStatus | 'all') => {
    const next = new URLSearchParams(params)
    next.set('tab', 'ledger')
    if (s === 'all') next.delete('status')
    else next.set('status', s)
    setParams(next, { replace: true })
  }

  const rows = useMemo(() => {
    const list: {
      caseId: string
      caseTitle: string
      caseNo: string
      agencyName: string
      invId: string
      title: string
      amount: string
      status: InvoiceStatus
      due: string
      relatedStage: string
    }[] = []
    for (const c of visibleCases) {
      for (const inv of c.engagement.invoices ?? []) {
        if (statusFilter !== 'all' && inv.status !== statusFilter) continue
        list.push({
          caseId: c.id,
          caseTitle: c.title,
          caseNo: c.caseNo,
          agencyName: c.agencyName,
          invId: inv.id,
          title: inv.title,
          amount: inv.amount,
          status: inv.status,
          due: inv.due,
          relatedStage: inv.relatedStage,
        })
      }
    }
    return list.sort((a, b) => a.due.localeCompare(b.due))
  }, [visibleCases, statusFilter])

  const pendingPay = rows.filter((r) => r.status === '已开票' || r.status === '逾期').length

  const demoCreateOverdue = () => {
    const c = visibleCases[0]
    if (!c) return
    const due = new Date(Date.now() - 5 * 86400000).toISOString().slice(0, 10)
    addInvoice(c.id, {
      title: `演示逾期发票 · ${new Date().toISOString().slice(11, 19)}`,
      amount: '¥9,900',
      status: '逾期',
      due,
      relatedStage: '演示',
    })
  }

  return (
    <div className="p-6 lg:p-8">
      <PageHeader
        title="费用中心"
        context={`${workspace.chipLabel} · 示意 · 待付款发票 ${pendingPay} 张（本租户可见）`}
        primary={{
          label: '查看逾期台账',
          to: '/billing/cases?tab=ledger&status=逾期',
          icon: <ShieldAlert className="h-4 w-4" aria-hidden />,
        }}
        secondary={{ label: '返回设置页', to: '/settings' }}
      />

      <div className="mb-6 inline-flex flex-wrap rounded-lg bg-slate-100 p-1" role="tablist" aria-label="费用中心页签">
        {(
          [
            ['ledger', '台账', Receipt],
            ['model', '商业模式说明', CreditCard],
          ] as const
        ).map(([id, label, Icon]) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={tab === id}
            onClick={() => setTab(id)}
            className={`btn-press inline-flex items-center gap-1.5 rounded-md px-4 py-2 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400 ${
              tab === id
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
            aria-label={label}
          >
            <Icon className="h-4 w-4" aria-hidden />
            {label}
          </button>
        ))}
      </div>

      {tab === 'ledger' && (
        <>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3">
            <label className="inline-flex items-center gap-2 text-sm text-slate-700">
              <ShieldAlert className="h-4 w-4 text-rose-600" aria-hidden />
              <span>逾期停权</span>
              <button
                type="button"
                role="switch"
                aria-checked={overdueStopEnabled}
                aria-label="逾期停权开关"
                onClick={() => setOverdueStopEnabled(!overdueStopEnabled)}
                className={`btn-press relative h-6 w-11 rounded-full transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400 ${
                  overdueStopEnabled ? 'bg-rose-600' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`toggle-thumb absolute top-0.5 h-5 w-5 rounded-full bg-white shadow ${
                    overdueStopEnabled ? 'left-5' : 'left-0.5'
                  }`}
                />
              </button>
              <span className="text-xs text-slate-500">
                {overdueStopEnabled
                  ? '开启：代理所提交/递交将被逾期发票拦截'
                  : '关闭：不拦截办理（演示）'}
              </span>
            </label>
            <button
              type="button"
              onClick={demoCreateOverdue}
              className="btn-press rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-medium text-rose-800 hover:bg-rose-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400"
              aria-label="创建演示逾期发票"
              disabled={visibleCases.length === 0}
            >
              创建演示逾期发票
            </button>
          </div>

          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-800">
                <Receipt className="h-4 w-4 text-slate-700" aria-hidden />
                案件费用台账
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-normal text-slate-600">
                  {rows.length} 条
                </span>
              </div>
              <label className="inline-flex items-center gap-1.5 text-xs text-slate-600">
                <Filter className="h-3.5 w-3.5" aria-hidden />
                <span className="sr-only">按状态筛选</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as InvoiceStatus | 'all')}
                  className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                  aria-label="发票状态筛选"
                >
                  <option value="all">全部状态</option>
                  <option value="待开票">待开票</option>
                  <option value="已开票">已开票</option>
                  <option value="已付款">已付款</option>
                  <option value="逾期">逾期</option>
                </select>
              </label>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead className="bg-slate-50 text-xs text-slate-500">
                  <tr>
                    <th className="px-4 py-2.5 font-medium">案件</th>
                    <th className="px-4 py-2.5 font-medium">发票标题</th>
                    <th className="px-4 py-2.5 font-medium">金额</th>
                    <th className="px-4 py-2.5 font-medium">状态</th>
                    <th className="px-4 py-2.5 font-medium">到期</th>
                    <th className="px-4 py-2.5 font-medium">关联阶段</th>
                    <th className="px-4 py-2.5 font-medium">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                  {rows.map((r) => (
                    <tr key={`${r.caseId}-${r.invId}`} className="hover:bg-slate-50/80">
                      <td className="px-4 py-3">
                        <Link
                          to={`/cases/${r.caseId}`}
                          className="font-medium text-slate-800 hover:underline"
                        >
                          {r.caseTitle}
                        </Link>
                        <div className="text-xs text-slate-400">{r.caseNo}</div>
                      </td>
                      <td className="px-4 py-3">{r.title}</td>
                      <td className="px-4 py-3 tabular-nums font-medium">{r.amount}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLE[r.status]}`}
                        >
                          {r.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 tabular-nums">{r.due}</td>
                      <td className="px-4 py-3">{r.relatedStage}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {role === 'agency' && r.status === '待开票' && (
                            <button
                              type="button"
                              onClick={() => void dispatchCommand({ type: 'issueInvoice', caseId: r.caseId, invoiceId: r.invId }, { actor: 'user' })}
                              className="btn-press rounded-md bg-sky-50 px-2 py-1 text-xs font-medium text-sky-800 ring-1 ring-sky-200 hover:bg-sky-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400"
                              aria-label={`开具发票 ${r.title}`}
                            >
                              开具发票
                            </button>
                          )}
                          {(r.status === '已开票' || r.status === '逾期') && (() => {
                            const payCase = getCase(r.caseId)
                            const payGr = evaluatePayUnlock({
                              case: payCase ?? null,
                              persona,
                              role,
                              isEnterprise: role === 'enterprise',
                            })
                            const payBlocked = !payGr.ok
                            const payReason = firstGuardrailMessage(payGr)
                            return (
                              <span className="inline-flex flex-col items-start gap-0.5">
                                <button
                                  type="button"
                                  disabled={payBlocked}
                                  title={payBlocked ? (payReason ?? '不可付款解锁') : undefined}
                                  onClick={() =>
                                    void dispatchCommand(
                                      { type: 'payInvoice', caseId: r.caseId, invoiceId: r.invId },
                                      { actor: 'user' },
                                    )
                                  }
                                  className="btn-press rounded-md bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-800 ring-1 ring-emerald-200 hover:bg-emerald-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-emerald-50"
                                  aria-label={
                                    payBlocked
                                      ? `不可付款：${payReason ?? ''}`
                                      : `标记已付款 ${r.title}`
                                  }
                                >
                                  标记已付款
                                </button>
                                {payBlocked && payReason ? (
                                  <span className="max-w-[10rem] text-[10px] leading-snug text-slate-500">
                                    {payReason}
                                  </span>
                                ) : null}
                              </span>
                            )
                          })()}
                          {r.status === '已付款' && (
                            <span className="text-xs text-slate-400">已结清</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {rows.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-4 py-10 text-center text-slate-400">
                        本租户暂无发票记录
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <p className="border-t border-slate-100 px-4 py-2 text-xs text-slate-400">
              企业租户仅见自有案件；代理所仅见已派单案件。付款后逾期停权立即解除。
            </p>
          </div>
        </>
      )}

      {tab === 'model' && (
        <>
          <div className="mb-4 flex items-center gap-2 text-sm text-slate-700">
            <CreditCard className="h-4 w-4 text-slate-700" />
            企业侧套餐（示意）
          </div>
          <div className="mb-8 grid gap-4 lg:grid-cols-3">
            {ENTERPRISE_PLANS.map((p) => (
              <div
                key={p.id}
                className={`rounded-xl border bg-white p-5 ${
                  p.highlight
                    ? 'border-slate-300 ring-2 ring-slate-200'
                    : 'border-slate-200'
                }`}
              >
                <div className="mb-3 flex items-center justify-between">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      p.highlight
                        ? 'bg-slate-100 text-slate-800 ring-1 ring-slate-200'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {p.badge}
                  </span>
                </div>
                <h3 className="text-base font-semibold text-slate-900">{p.name}</h3>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-2xl font-semibold text-slate-900">{p.price}</span>
                  <span className="text-xs text-slate-500">{p.unit}</span>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-slate-500">{p.desc}</p>
                <ul className="mt-4 space-y-2">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-xs text-slate-700">
                      <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mb-4 flex items-center gap-2 text-sm text-slate-700">
            <Scale className="h-4 w-4 text-violet-600" />
            代理侧结算（示意）
          </div>
          <div className="mb-6 grid gap-4 md:grid-cols-3">
            {AGENCY_TERMS.map((t) => (
              <div
                key={t.label}
                className="rounded-xl border border-slate-200 bg-white p-5"
              >
                <div className="text-xs text-slate-500">{t.label}</div>
                <div className="mt-2 text-xl font-semibold text-slate-900">{t.value}</div>
                <p className="mt-2 text-xs leading-relaxed text-slate-500">{t.note}</p>
              </div>
            ))}
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="mb-3 flex items-center gap-2 text-sm font-medium text-slate-800">
              <Building2 className="h-4 w-4 text-slate-700" />
              结算流程示意
            </div>
            <ol className="space-y-3 text-xs text-slate-600">
              <li>1. 企业确认委托报价 → 平台生成订单 / 待开票行</li>
              <li>2. 代理开具发票 → 企业标记付款</li>
              <li>3. 逾期停权开启时，未结清将拦截代理提交/递交</li>
            </ol>
            <Link
              to="/billing/cases?tab=ledger"
              className="btn-press mt-4 inline-flex text-xs font-medium text-slate-700 hover:text-slate-900"
            >
              返回费用台账 →
            </Link>
          </div>
        </>
      )}
    </div>
  )
}
