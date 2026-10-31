import { Link, useParams } from 'react-router-dom'
import { useBusinessCases } from '../../business/BusinessCaseContext'

/**
 * 成员与权限壳 · product-pages §4.14
 * 结构占位：无 IAM / 邀请逻辑
 */
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
      <div
        className="mx-auto mb-3 max-w-3xl rounded-lg border border-dashed border-slate-300 bg-slate-50 px-3 py-2 text-[11px] text-slate-600"
        data-testid="logistics-members-thin"
      >
        成员（后勤薄） · 一期后勤可薄；主路径仍是八部工作台与硬请示，勿当主交付。
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
      data-testid="case-members-page"
      data-case-id={caseId}
    >
      <div className="mx-auto max-w-2xl">
        <div className="mb-3 text-[11px] text-slate-400">
          <Link to={home} className="hover:underline">
            {c.title}
          </Link>
          <span className="mx-1">/</span>
          成员与权限
        </div>
        <h1 className="text-[20px] font-semibold text-slate-900">成员与权限</h1>
        <p className="mt-1 text-sm text-slate-500">
          谁能进公司、谁能确认交卷（结构壳 · 权限后续接入）
        </p>
        <p className="mt-2 text-[12px]">
          <Link
            to={home}
            className="font-medium text-slate-600 underline-offset-2 hover:underline"
            data-testid="case-members-back-home"
          >
            ← 回公司首页
          </Link>
        </p>

        <div
          className="mt-4 rounded-lg border border-dashed border-amber-200 bg-amber-50/60 px-3 py-2 text-[11px] text-amber-950"
          data-testid="logistics-members-thin"
          role="status"
        >
          <strong>后勤薄页</strong>
          ：成员/权限一期可薄 · 主路径仍是八部工作台与硬请示；无真 IAM / 邀请通道。
          <Link to={home} className="ml-2 font-semibold underline-offset-2 hover:underline">
            回公司办主链
          </Link>
        </div>

        <ul
          className="mt-6 space-y-2"
          data-testid="case-members-demo-list"
        >
          {[
            ['创建者 · 你', '可拍硬请示 · 可进全部部门', '领导'],
            ['代理协助（演示）', '可陪同进⑤壳 · 不可代企业终拍', '代理'],
            ['只读观察（演示）', '可看案卷 · 不可确认/驳回', '观察'],
          ].map(([name, role, tag]) => (
            <li
              key={name}
              className="flex items-start justify-between gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2.5"
              data-testid="case-member-row"
            >
              <div>
                <p className="text-[13px] font-semibold text-slate-900">{name}</p>
                <p className="text-[11px] text-slate-600">{role}</p>
              </div>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                {tag}
              </span>
            </li>
          ))}
        </ul>

        <div
          className="mt-6 rounded-xl border border-dashed border-slate-200 bg-white px-4 py-6 text-center"
          data-testid="case-members-empty"
        >
          <p className="text-sm text-slate-500">邀请入口（结构壳）</p>
          <p className="mt-1 text-[11px] text-slate-400">
            正式邀请/权限树后置；此处不装已开通 IAM。
          </p>
          <button
            type="button"
            className="btn-press focus-ring mt-3 rounded-full border border-slate-300 bg-white px-3 py-1 text-[11px] font-medium text-slate-500"
            data-testid="case-members-invite-disabled"
            disabled
            title="后置 · 非真邀请"
          >
            邀请成员（后置）
          </button>
        </div>
      </div>
    </div>
  )
}
