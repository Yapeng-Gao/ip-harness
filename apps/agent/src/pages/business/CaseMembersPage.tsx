import { Link, useParams } from 'react-router-dom'
import { useBusinessCases } from '../../business/BusinessCaseContext'

/**
 * 成员与权限 · product-pages §4.13
 * 机制：后勤横切——谁能进公司、谁能确认交卷（白话角色 + 可确认闸）。
 * 禁：专家建议岗配成法定递交权；UI 英桩 decision-rights；抢公司→工作台主链；真 IAM。
 */
const DEMO_MEMBERS: Array<{
  name: string
  role: string
  gates: string
  tag: string
}> = [
  {
    name: '你（创建者）',
    role: '授权人 · 企业侧',
    gates: '可拍硬请示 · 可进全部部门',
    tag: '授权人',
  },
  {
    name: '代理协助（演示）',
    role: '代理人 · 陪同作业',
    gates: '可陪同进⑤壳 · 不可代企业终拍',
    tag: '代理人',
  },
  {
    name: '只读观察（演示）',
    role: '观察 · 无确认权',
    gates: '可看案卷 · 不可确认/驳回',
    tag: '观察',
  },
]

export function CaseMembersPage() {
  const { caseId = '' } = useParams()
  const { getCase } = useBusinessCases()
  const c = getCase(caseId)
  const home = `/agent/cases/${caseId}`

  if (!c) {
    return (
      <div
        className="flex flex-1 items-center justify-center p-8"
        data-testid="case-members-page"
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
      data-testid="case-members-page"
      data-members="roles-v1"
      data-case-id={caseId}
    >
      <div className="mx-auto max-w-2xl">
        <nav
          className="mb-3 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11px] text-slate-500"
          aria-label="成员次要入口"
          data-testid="case-members-secondary"
        >
          <Link
            to="/agent"
            className="focus-ring rounded-sm font-medium text-slate-600 underline-offset-2 hover:text-slate-900 hover:underline"
            data-testid="case-members-back-hall"
          >
            回大厅
          </Link>
          <span aria-hidden className="text-slate-300">
            ·
          </span>
          <Link
            to={home}
            className="focus-ring rounded-sm font-medium text-slate-600 underline-offset-2 hover:text-slate-900 hover:underline"
            data-testid="case-members-back-home"
          >
            公司案首页
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
            to={`${home}/billing`}
            className="focus-ring rounded-sm font-medium text-slate-600 underline-offset-2 hover:text-slate-900 hover:underline"
          >
            账单
          </Link>
        </nav>

        <p
          className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-3 py-2 text-[11px] text-slate-600"
          data-testid="logistics-members-thin"
          role="status"
        >
          后勤横切 · 不抢「公司 → 工作台」主链 · 人侧权限 ≠ 专家建议岗 · 无真 IAM
        </p>

        <h1
          className="mt-3 text-[20px] font-semibold text-slate-900"
          data-testid="case-members-heading"
        >
          成员与权限
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          谁能进公司、谁能确认交卷；角色白话，确认权跟人。
        </p>

        <ul
          className="mt-5 space-y-2"
          data-testid="case-members-demo-list"
          aria-label="成员列表"
        >
          {DEMO_MEMBERS.map((m) => (
            <li
              key={m.name}
              className="flex items-start justify-between gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2.5 shadow-sm"
              data-testid="case-member-row"
            >
              <div className="min-w-0">
                <p className="text-[13px] font-semibold text-slate-900">
                  {m.name}
                </p>
                <p className="mt-0.5 text-[11px] text-slate-600">{m.role}</p>
                <p
                  className="mt-1 text-[11px] text-slate-500"
                  data-testid="case-member-gates"
                >
                  {m.gates}
                </p>
              </div>
              <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                {m.tag}
              </span>
            </li>
          ))}
        </ul>

        <p
          className="mt-3 text-[11px] leading-relaxed text-slate-500"
          data-testid="case-members-rights-note"
        >
          决策权说明：专家建议稿 ≠ 确认；质检 ≠ 确认权；不可把专家建议岗配成法定递交权。
          角色变更正式接入后须留痕。
        </p>

        <div
          className="mt-5 flex flex-wrap items-center gap-2"
          data-testid="case-members-actions"
        >
          <button
            type="button"
            disabled
            title="后置 · 非真邀请"
            className="btn-press focus-ring rounded-md border border-slate-200 bg-white px-3 py-1.5 text-[12px] font-medium text-slate-400 disabled:cursor-not-allowed"
            data-testid="case-members-invite-disabled"
          >
            邀请成员（后置）
          </button>
          <button
            type="button"
            disabled
            title="后置 · 非真改权"
            className="btn-press focus-ring rounded-md border border-slate-200 bg-white px-3 py-1.5 text-[12px] font-medium text-slate-400 disabled:cursor-not-allowed"
            data-testid="case-members-save-disabled"
          >
            保存角色（后置）
          </button>
          <Link
            to={home}
            className="btn-press focus-ring inline-flex rounded-md bg-slate-900 px-3 py-1.5 text-[12px] font-semibold text-white"
            data-testid="case-members-to-company"
          >
            回公司办主链
          </Link>
        </div>

        <div
          className="mt-6 rounded-xl border border-dashed border-slate-200 bg-white px-4 py-5 text-center"
          data-testid="case-members-empty"
        >
          <p className="text-sm text-slate-500">邀请入口（结构壳）</p>
          <p className="mt-1 text-[11px] text-slate-400">
            正式邀请/权限树后置；此处不装已开通 IAM · 非专家花名册墙
          </p>
        </div>
      </div>
    </div>
  )
}
