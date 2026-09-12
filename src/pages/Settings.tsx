import { Link } from 'react-router-dom'
import { PageHeader } from '../components/PageHeader'
import {
  Users,
  CreditCard,
  Bell,
  ShieldCheck,
  ArrowRight,
  Database,
} from 'lucide-react'

type HubItem = {
  to: string
  title: string
  desc: string
  icon: typeof Users
  unimplemented?: boolean
}

const HUB: HubItem[] = [
  {
    to: '/settings/org',
    title: '组织与权限',
    desc: '租户、部门、角色矩阵、代理可见阶段',
    icon: Users,
  },
  {
    to: '/billing/cases',
    title: '费用中心',
    desc: '案件费用台账 · 开票付款 · 逾期停权',
    icon: CreditCard,
  },
  {
    to: '/settings/billing?tab=model',
    title: '商业模式说明',
    desc: '企业付费套餐 / 代理抽佣与入驻年费（说明页）',
    icon: CreditCard,
  },
  {
    to: '/settings/data',
    title: '数据策略',
    desc: '商业 API 对接示意 / 自建数据湖路线图',
    icon: Database,
  },
  {
    to: '/settings#notify',
    title: '通知渠道',
    desc: '未实现 · 不接真推送；Docket「记录提醒」仅写本地演示日志',
    icon: Bell,
    unimplemented: true,
  },
  {
    to: '/settings#gates',
    title: '闸门规则',
    desc: '阶段过闸清单与强制项',
    icon: ShieldCheck,
    unimplemented: true,
  },
]

export function Settings() {
  return (
    <div className="p-6 lg:p-8">
      <PageHeader
        title="设置"
        context="组织 · 费用 · 数据；通知与闸门标记为未实现"
        primary={{
          label: '打开组织与权限',
          to: '/settings/org',
          icon: <Users className="h-4 w-4" aria-hidden />,
        }}
        secondary={{ label: '费用中心', to: '/billing/cases' }}
      />

      <ul className="flat-card divide-y divide-slate-100">
        {HUB.map((item) => {
          const row = (
            <>
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-700">
                <item.icon className="h-4 w-4" aria-hidden />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-medium text-slate-900">{item.title}</span>
                  {item.unimplemented && (
                    <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-500">
                      未实现
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-xs text-slate-500">{item.desc}</p>
              </div>
              {!item.unimplemented && (
                <ArrowRight className="h-4 w-4 shrink-0 text-slate-300" aria-hidden />
              )}
            </>
          )

          if (item.unimplemented) {
            return (
              <li
                key={item.to}
                id={item.to.includes('#notify') ? 'notify' : item.to.includes('#gates') ? 'gates' : undefined}
                className="flex items-start gap-3 px-4 py-3 opacity-70"
              >
                {row}
              </li>
            )
          }

          return (
            <li key={item.to}>
              <Link
                to={item.to}
                className="list-row flex items-start gap-3 px-4 py-3 focus-ring"
                aria-label={item.title}
              >
                {row}
              </Link>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
