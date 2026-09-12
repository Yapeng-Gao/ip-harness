import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { PageHeader } from '../components/PageHeader'
import {
  Building2,
  Plus,
  Trash2,
  ArrowLeft,
  Shield,
  Scale,
} from 'lucide-react'

type RoleId = 'ip_admin' | 'dept_liaison' | 'inventor' | 'readonly'

const ROLES: { id: RoleId; label: string }[] = [
  { id: 'ip_admin', label: '企业IP管理员' },
  { id: 'dept_liaison', label: '部门对接人' },
  { id: 'inventor', label: '发明人' },
  { id: 'readonly', label: '只读' },
]

const PERMS = [
  { id: 'mid', label: '查看中台' },
  { id: 'node', label: '办理节点' },
  { id: 'dispatch', label: '派单' },
  { id: 'insight', label: '洞察' },
  { id: 'billing', label: '计费' },
] as const

const MATRIX: Record<RoleId, Record<(typeof PERMS)[number]['id'], boolean>> = {
  ip_admin: { mid: true, node: true, dispatch: true, insight: true, billing: true },
  dept_liaison: { mid: true, node: true, dispatch: false, insight: true, billing: false },
  inventor: { mid: false, node: false, dispatch: false, insight: false, billing: false },
  readonly: { mid: true, node: false, dispatch: false, insight: true, billing: false },
}

const AGENCY_STAGE_VIS = [
  { stage: '立项前调研', visible: true },
  { stage: '立项决策', visible: true },
  { stage: '撰写申请', visible: true },
  { stage: '审查答复', visible: true },
  { stage: '授权维持', visible: true },
  { stage: '运用转化', visible: false },
  { stage: '监控预警', visible: true },
]

export function OrgSettings() {
  const {
    overdueStopEnabled,
    setOverdueStopEnabled,
    persona,
    committeeVoteHardBlockGo,
    setCommitteeVoteHardBlockGo,
  } = useApp()
  const [depts, setDepts] = useState([
    '动力电池事业部',
    '智能驾驶中心',
    '材料研究院',
    '法务 / IP 部',
  ])
  const [newDept, setNewDept] = useState('')
  const [matrix, setMatrix] = useState(MATRIX)
  const [agencyCombo, setAgencyCombo] = useState(false)
  const [stageVis, setStageVis] = useState(AGENCY_STAGE_VIS)

  const addDept = () => {
    const name = newDept.trim()
    if (!name || depts.includes(name)) return
    setDepts((d) => [...d, name])
    setNewDept('')
  }

  const togglePerm = (role: RoleId, perm: (typeof PERMS)[number]['id']) => {
    setMatrix((m) => ({
      ...m,
      [role]: { ...m[role], [perm]: !m[role][perm] },
    }))
  }

  return (
    <div className="p-6 lg:p-8">
      <PageHeader
        title="组织与权限"
        context="示意 · 矩阵非真 IAM；执法以顶栏/侧栏 Persona 为准"
        primary={{ label: '打开费用中心', to: '/billing/cases' }}
        secondary={{ label: '返回设置中心', to: '/settings', icon: <ArrowLeft className="h-4 w-4" aria-hidden /> }}
      />

      <div className="mb-6 rounded-xl border border-slate-200 bg-white p-5">
        <div className="mb-4 flex items-center gap-2">
          <Building2 className="h-4 w-4 text-slate-700" />
          <h2 className="text-sm font-medium text-slate-800">企业租户（示意）</h2>
        </div>
        <div className="mb-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg bg-slate-50 px-3 py-2">
            <div className="text-[11px] text-slate-500">公司名</div>
            <div className="text-sm font-medium text-slate-900">星河智造股份有限公司</div>
          </div>
          <div className="rounded-lg bg-slate-50 px-3 py-2">
            <div className="text-[11px] text-slate-500">租户 ID</div>
            <div className="text-sm font-medium text-slate-900">tenant-xh-2024</div>
          </div>
          <div className="rounded-lg bg-slate-50 px-3 py-2">
            <div className="text-[11px] text-slate-500">套餐</div>
            <div className="text-sm font-medium text-slate-900">年费 · 专业版（示意）</div>
          </div>
        </div>

        <div className="mb-2 text-xs font-medium text-slate-700">部门列表</div>
        <ul className="mb-3 space-y-1.5">
          {depts.map((d) => (
            <li
              key={d}
              className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-sm text-slate-800"
            >
              {d}
              <button
                type="button"
                onClick={() => setDepts((list) => list.filter((x) => x !== d))}
                className="rounded p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                title="删除（示意）"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
        <div className="flex gap-2">
          <input
            value={newDept}
            onChange={(e) => setNewDept(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addDept()}
            placeholder="新增部门名称（示意）"
            className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
          />
          <button
            type="button"
            onClick={addDept}
            className="btn-press focus-ring inline-flex items-center gap-1 cta-work rounded-lg px-3 py-2 text-sm font-medium"
          >
            <Plus className="h-4 w-4" /> 添加
          </button>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {ROLES.map((r) => (
            <span
              key={r.id}
              className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-800 ring-1 ring-slate-200"
            >
              <Shield className="h-3 w-3" />
              {r.label}
            </span>
          ))}
        </div>
      </div>

      <div className="mb-6 overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-100 px-4 py-3">
          <div className="text-sm font-medium text-slate-800">
            角色 × 权限矩阵（示意·执法以 Persona 为准）
          </div>
          <p className="mt-1 text-[11px] text-amber-800">
            非真 SSO/IAM。当前演示 Persona=
            <span className="font-semibold">{persona}</span>
            ；点阵仅示意，实际闸门由 Persona 执法（canPerformHandoff / Agent ConfirmBar / Inbox）。
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="bg-slate-50 text-[11px] text-slate-500">
              <tr>
                <th className="px-4 py-2.5 font-medium">角色</th>
                {PERMS.map((p) => (
                  <th key={p.id} className="px-3 py-2.5 text-center font-medium">
                    {p.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {ROLES.map((r) => (
                <tr key={r.id}>
                  <td className="px-4 py-3 text-xs font-medium text-slate-800">{r.label}</td>
                  {PERMS.map((p) => (
                    <td key={p.id} className="px-3 py-3 text-center">
                      <button
                        type="button"
                        onClick={() => togglePerm(r.id, p.id)}
                        className={`inline-flex h-7 w-7 items-center justify-center rounded-md text-xs font-medium transition-colors ${
                          matrix[r.id][p.id]
                            ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
                            : 'bg-slate-50 text-slate-400 ring-1 ring-slate-100'
                        }`}
                        title="点击切换（示意）"
                      >
                        {matrix[r.id][p.id] ? '✓' : '—'}
                      </button>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="border-t border-slate-100 px-4 py-2 text-[11px] text-slate-500">
          发明人 Persona → 交底门户为主；委员 Persona → 仅 Intake 投票；企业 IP / 代理 ≈ 现网。矩阵开关不替代 Persona 执法。
        </p>
      </div>

      <div className="mb-6 rounded-xl border border-slate-200 bg-white p-5">
        <div className="mb-2 flex items-center gap-2">
          <Shield className="h-4 w-4 text-rose-600" />
          <h2 className="text-sm font-medium text-slate-800">逾期停权（演示）</h2>
        </div>
        <label className="flex cursor-pointer items-center gap-3 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={overdueStopEnabled}
            onChange={(e) => setOverdueStopEnabled(e.target.checked)}
            className="rounded border-slate-300 text-rose-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400"
            aria-label="逾期停权"
          />
          开启后，代理所对存在逾期发票的案件无法提交/递交（默认开启）
        </label>
        <Link to="/billing/cases?tab=ledger" className="mt-2 inline-block text-xs text-slate-700 hover:underline">
          前往费用中心 →
        </Link>
      </div>

      <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50/40 p-5">
        <div className="mb-2 flex items-center gap-2">
          <Shield className="h-4 w-4 text-amber-700" />
          <h2 className="text-sm font-medium text-slate-800">立项投票硬挡 Go（租户 local flag）</h2>
        </div>
        <label className="flex cursor-pointer items-center gap-3 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={committeeVoteHardBlockGo}
            onChange={(e) => setCommitteeVoteHardBlockGo(e.target.checked)}
            className="rounded border-slate-300 text-amber-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400"
            aria-label="投票硬挡 Go"
          />
          开启后立项 Go 前必须有效投票（薄演示，非真委员会系统）
        </label>
        <p className="mt-2 text-[11px] text-slate-500">
          读路径：OrgSettings 开关 → AppContext <code className="rounded bg-slate-100 px-1">committeeVoteHardBlockGo</code>
          （localStorage <code className="rounded bg-slate-100 px-1">ip-harness-committee-vote-hard-block-go</code>）
          → IntakeFlow Go / advanceFromWorkbench / confirmQuote·canPerform 硬闸。
          仅 Persona=委员写入可审计票；企业 IP 可代看 UI。委员本身不可点 Go。
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="mb-4 flex items-center gap-2">
          <Scale className="h-4 w-4 text-accent-muted" />
          <h2 className="text-sm font-medium text-slate-800">入驻代理所权限（示意）</h2>
        </div>
        <div className="mb-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {stageVis.map((s, i) => (
            <label
              key={s.stage}
              className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-xs text-slate-700"
            >
              <input
                type="checkbox"
                checked={s.visible}
                onChange={() =>
                  setStageVis((list) =>
                    list.map((x, j) => (j === i ? { ...x, visible: !x.visible } : x)),
                  )
                }
                className="rounded border-slate-300 text-slate-700"
              />
              {s.stage}可见
            </label>
          ))}
        </div>
        <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
          <input
            type="checkbox"
            checked={agencyCombo}
            onChange={(e) => setAgencyCombo(e.target.checked)}
            className="mt-0.5 rounded border-slate-300 text-slate-700"
          />
          <div>
            <div className="text-sm font-medium text-slate-800">允许接触组合洞察数据</div>
            <p className="mt-0.5 text-[11px] text-slate-500">
              关闭时代理仅见被派单案件；开启后可读脱敏赛道/布局示意（优质所加持场景）
            </p>
          </div>
        </label>
      </div>
    </div>
  )
}
