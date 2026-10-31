import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronDown, ChevronRight } from 'lucide-react'

type Props = {
  caseId?: string
  /** agency 可绕 B2 陪同进⑤ */
  isAgency?: boolean
}

const BRANCHES: {
  id: string
  title: string
  /** 卡片上一句（短） */
  blurb: string
  mustSee: string
  forbid: string
  href: (caseId: string | undefined, isAgency: boolean) => string
}[] = [
  {
    id: 'b1',
    title: 'B1 直达④',
    blurb: '跳过前站 · 进交底',
    mustSee: '跳过①②③ · ④短收件+进入检查表',
    forbid: '假装已激发/已挖点',
    href: (id) =>
      id ? `/agent/cases/${id}/depts/disclosure?branch=b1` : '/agent/cases/new',
  },
  {
    id: 'b2',
    title: '自带交底→申请部',
    blurb: '有交底 · 进申请',
    mustSee: '⑤进入检查表；不过→退④',
    forbid: '未全绿硬写申请',
    href: (id, agency) =>
      id
        ? agency
          ? `/agent/cases/${id}/depts/draft?escort=1&branch=b2`
          : `/agent/cases/${id}/depts/draft?branch=b2`
        : '/agent/cases/new',
  },
  {
    id: 'b3',
    title: 'B3 建议改④',
    blurb: '材料不足 · 回交底',
    mustSee: '只有技术说明时建议回④',
    forbid: '用「先查新」绕过交底门槛',
    href: (id) =>
      id ? `/agent/cases/${id}/depts/draft?branch=b3` : '/agent/cases/new',
  },
  {
    id: 'b4',
    title: 'B4 通知书→⑥',
    blurb: '有通知 · 进答复',
    mustSee: '⑥短收件；须现行申请文件',
    forbid: '凭交底直接答 OA',
    href: (id) => (id ? `/agent/cases/${id}/depts/oa?branch=b4` : '/agent/cases/new'),
  },
  {
    id: 'b5',
    title: 'B5 不申结案',
    blurb: '拍不申 · 无申请号',
    mustSee: '⑤B 拍不申 · 不出申请号',
    forbid: '不申却出申请号',
    href: (id) =>
      id ? `/agent/cases/${id}/depts/draft?step=b&branch=b5` : '/agent/cases/new',
  },
  {
    id: 'b6',
    title: 'B6 ⑥超期',
    blurb: '期限升级 · 须拍板',
    mustSee: '期限升级可见 · 延期/放弃/抢答须拍',
    forbid: '静默逾期',
    href: (id) => (id ? `/agent/cases/${id}/depts/oa?branch=b6` : '/agent/cases/new'),
  },
  {
    id: 'b7',
    title: 'B7 ⑧只读不拍',
    blurb: '复盘报告 · 不改台账',
    mustSee: '报告可交 · 不回写⑦',
    forbid: '未拍却改台账',
    href: (id) =>
      id ? `/agent/cases/${id}/depts/monetize?branch=b7` : '/agent/cases/new',
  },
  {
    id: 'b8',
    title: 'B8 情报官',
    blurb: '竞对年报 · 走资产',
    mustSee: '竞对年报走情报官（非⑧）',
    forbid: '⑧/③糊弄专报',
    href: () => '/agent/assets?branch=b8',
  },
]

/**
 * 支路 B1–B8 入口门 · 故事板验收「路上有没有这扇门」
 * 精致度：默认紧凑一句话；须看见/禁 收入展开，降使用成本。
 */
export function BranchDoors({ caseId, isAgency = false }: Props) {
  const [detailOpen, setDetailOpen] = useState(false)

  return (
    <section
      className="mb-3"
      aria-labelledby="home-branch-title"
      data-testid="home-branch-doors"
      data-branch-compact={detailOpen ? '0' : '1'}
      data-hall-dense="1"
    >
      <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
        <h2
          id="home-branch-title"
          className="text-[12px] font-semibold tracking-tight text-slate-900"
        >
          支路门
        </h2>
        <span className="text-[11px] text-slate-500">
          B1–B8 · 虚线入口
          {isAgency ? ' · 代理可陪同进申请部' : ''}
        </span>
        <button
          type="button"
          className="btn-press focus-ring ml-auto inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[10px] font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-800"
          data-testid="home-branch-detail-toggle"
          aria-expanded={detailOpen}
          onClick={() => setDetailOpen((v) => !v)}
        >
          {detailOpen ? (
            <ChevronDown className="h-3 w-3" aria-hidden />
          ) : (
            <ChevronRight className="h-3 w-3" aria-hidden />
          )}
          {detailOpen ? '收起验收句' : '展开须看见/禁'}
        </button>
      </div>
      <ul
        className={`grid gap-1 ${
          detailOpen
            ? 'grid-cols-1 sm:grid-cols-2'
            : 'grid-cols-2 sm:grid-cols-4'
        }`}
        data-hall-dense="1"
        data-testid="home-branch-list"
      >
        {BRANCHES.map((b) => (
          <li key={b.id}>
            <Link
              to={b.href(caseId, isAgency)}
              className="btn-press focus-ring flex h-full flex-col rounded-md border border-dashed border-slate-200/90 bg-white px-2 py-1.5 hover:border-slate-300 hover:bg-slate-50/80"
              data-testid={`home-branch-${b.id}`}
              data-branch={b.id}
              title={`须看见：${b.mustSee} · 禁：${b.forbid}`}
            >
              <span className="text-[11px] font-semibold text-slate-900">
                {b.title}
              </span>
              <span className="mt-0.5 text-[10px] leading-snug text-slate-500">
                {b.blurb}
              </span>
              {detailOpen ? (
                <span
                  className="mt-1.5 space-y-0.5 border-t border-slate-100 pt-1.5 text-[10px] leading-snug"
                  data-testid={`home-branch-detail-${b.id}`}
                >
                  <span className="block text-slate-600">须看见：{b.mustSee}</span>
                  <span className="block text-rose-700/75">禁：{b.forbid}</span>
                </span>
              ) : null}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
