import { Link, useParams } from 'react-router-dom'
import { useMemo } from 'react'
import { useBusinessCases } from '../../business/BusinessCaseContext'
import { HALL_DEPT_DOORS } from '../../business/hallDepts'
import { businessSeatLabel } from '../../business/businessSeats'
import {
  MAIN_CHAIN_DEPTS,
  deptSlug,
  orgDeptById,
  type OrgDept,
} from '../../departments/orgDepts'
import {
  confirmKindOf,
  deptStatus,
  type DeptStatus,
} from '../../departments/deptProgress'
import { useOrgConfig } from '../../departments/OrgConfigContext'

/**
 * 专业/编制 · product-pages §4.3a
 * 机制：案级能力面——八部卡（职责+编制占位+在办/缺口）+「让该部开工」进工作台。
 * 禁：本页改交卷；第一屏技能墙；假编制无案；抢公司→工作台主叙事当默认着陆。
 */
function statusLine(s: DeptStatus): { kind: 'work' | 'gap' | 'idle'; text: string } {
  switch (s) {
    case '进行中':
      return { kind: 'work', text: '当前在办' }
    case '待确认':
      return { kind: 'gap', text: '缺口：待你拍板' }
    case '退回':
      return { kind: 'gap', text: '缺口：退回补齐' }
    case '已完成':
      return { kind: 'idle', text: '已交卷' }
    case '锁定':
      return { kind: 'idle', text: '锁定（未递交前）' }
    default:
      return { kind: 'idle', text: '未到站' }
  }
}

function seatNames(dept: OrgDept): string[] {
  const names = [businessSeatLabel(dept.leadSeatId)]
  for (const p of dept.peers.slice(0, 4)) {
    if (p.sessionSeatId) names.push(businessSeatLabel(p.sessionSeatId))
  }
  return names
}

export function CaseProfessionalPage() {
  const { caseId = '' } = useParams()
  const { getCase, getProgress, getPendingConfirms } = useBusinessCases()
  const { deptLabel } = useOrgConfig()
  const c = getCase(caseId)
  const home = `/agent/cases/${caseId}`
  const prog = getProgress(caseId)
  const pending = getPendingConfirms(caseId)

  const cards = useMemo(() => {
    return HALL_DEPT_DOORS.map((door) => {
      const dept =
        orgDeptById(door.deptId) ??
        MAIN_CHAIN_DEPTS.find((d) => d.id === door.deptId)
      if (!dept) return null
      const st = deptStatus({
        dept,
        progress: prog,
        pending,
        confirmKind: confirmKindOf(dept),
      })
      const line = statusLine(st)
      return {
        door,
        dept,
        st,
        line,
        seats: seatNames(dept),
        href: `${home}/depts/${deptSlug(dept.id)}`,
      }
    }).filter(Boolean) as Array<{
      door: (typeof HALL_DEPT_DOORS)[number]
      dept: OrgDept
      st: DeptStatus
      line: ReturnType<typeof statusLine>
      seats: string[]
      href: string
    }>
  }, [prog, pending, home])

  if (!c) {
    return (
      <div
        className="flex flex-1 items-center justify-center p-8"
        data-testid="case-professional-page"
      >
        <div className="text-center">
          <p className="text-sm text-slate-600">找不到这个案子</p>
          <p className="mt-1 text-[12px] text-slate-500">
            专业须带案 · 请先开案子或从案盘进入
          </p>
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
      data-testid="case-professional-page"
      data-professional="caps-v1"
      data-case-id={caseId}
    >
      <div className="mx-auto max-w-3xl">
        <nav
          className="mb-3 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11px] text-slate-500"
          aria-label="专业次要入口"
          data-testid="case-professional-secondary"
        >
          <Link
            to="/agent"
            className="focus-ring rounded-sm font-medium text-slate-600 underline-offset-2 hover:text-slate-900 hover:underline"
            data-testid="case-professional-back-hall"
          >
            回大厅
          </Link>
          <span aria-hidden className="text-slate-300">
            ·
          </span>
          <Link
            to={home}
            className="focus-ring rounded-sm font-medium text-slate-600 underline-offset-2 hover:text-slate-900 hover:underline"
            data-testid="case-professional-back-home"
          >
            公司案首页
          </Link>
          <span aria-hidden className="text-slate-300">
            ·
          </span>
          <Link
            to="/agent/departments"
            className="focus-ring rounded-sm font-medium text-slate-600 underline-offset-2 hover:text-slate-900 hover:underline"
            data-testid="case-professional-to-global"
          >
            全库编制旁路
          </Link>
        </nav>

        <p
          className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-3 py-2 text-[11px] text-slate-600"
          data-testid="case-professional-hint"
          role="status"
        >
          案级能力面 · 看编制与在办/缺口 · 点「让该部开工」进工作台 · 本页不改交卷 · 非第三套产品
        </p>

        <h1
          className="mt-3 text-[20px] font-semibold text-slate-900"
          data-testid="case-professional-heading"
        >
          专业能力 / 编制
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          {c.title} · 八部能干什么、谁在岗、当前在办或缺口
        </p>

        <ul
          className="mt-5 grid gap-3 sm:grid-cols-2"
          data-testid="case-professional-cards"
        >
          {cards.map(({ door, dept, line, seats, href }) => (
            <li
              key={dept.id}
              className="flex flex-col rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm"
              data-testid={`case-professional-card-${door.slug}`}
              data-dept-status={line.kind}
            >
              <div className="flex items-baseline gap-1.5">
                <span className="text-[11px] text-slate-400">{door.num}</span>
                <h2 className="text-[14px] font-semibold text-slate-900">
                  {deptLabel(dept)}
                </h2>
              </div>
              <p className="mt-1 text-[11px] leading-relaxed text-slate-600">
                {door.desc}
              </p>
              <p
                className="mt-2 text-[11px] text-slate-500"
                data-testid="case-professional-seats"
              >
                编制 · {seats.join(' · ')}
              </p>
              <p
                className={`mt-2 text-[12px] font-medium ${
                  line.kind === 'gap'
                    ? 'text-amber-800'
                    : line.kind === 'work'
                      ? 'text-sky-800'
                      : 'text-slate-500'
                }`}
                data-testid="case-professional-status"
              >
                {line.text}
              </p>
              <Link
                to={href}
                className="btn-press focus-ring mt-3 inline-flex w-fit rounded-md bg-slate-900 px-2.5 py-1.5 text-[11px] font-semibold text-white"
                data-testid={`case-professional-start-${door.slug}`}
              >
                让该部开工
              </Link>
            </li>
          ))}
        </ul>

        <details
          className="mt-5 rounded-xl border border-dashed border-slate-200 bg-white px-3 py-2"
          data-testid="case-professional-skills-fold"
        >
          <summary className="cursor-pointer text-[12px] font-medium text-slate-600">
            进阶 · 技能 / MCP（默认收折）
          </summary>
          <p className="mt-2 text-[11px] leading-relaxed text-slate-500">
            方法配置后置；主路径是岗名/职责/占位与「让该部开工」。本区不占第一屏墙。
          </p>
        </details>

        <div className="mt-5 flex flex-wrap gap-2">
          <Link
            to={home}
            className="btn-press focus-ring inline-flex rounded-md border border-slate-200 bg-white px-3 py-1.5 text-[12px] font-medium text-slate-700"
            data-testid="case-professional-to-company"
          >
            回公司案首页
          </Link>
        </div>
      </div>
    </div>
  )
}
