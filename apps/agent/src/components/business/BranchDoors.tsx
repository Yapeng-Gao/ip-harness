import { Link } from 'react-router-dom'

type Props = {
  caseId?: string
  /** agency 可绕 B2 陪同进⑤ */
  isAgency?: boolean
}

const BRANCHES: {
  id: string
  title: string
  mustSee: string
  forbid: string
  href: (caseId: string | undefined, isAgency: boolean) => string
}[] = [
  {
    id: 'b1',
    title: 'B1 直达④',
    mustSee: '跳过①②③ · ④短收件+进入检查表',
    forbid: '假装已激发/已挖点',
    href: (id) =>
      id ? `/agent/cases/${id}/depts/disclosure?branch=b1` : '/agent/cases/new',
  },
  {
    id: 'b2',
    title: 'B2 自带交底→⑤',
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
    mustSee: '只有技术说明时建议回④',
    forbid: '用「先查新」绕过交底门槛',
    href: (id) =>
      id ? `/agent/cases/${id}/depts/draft?branch=b3` : '/agent/cases/new',
  },
  {
    id: 'b4',
    title: 'B4 通知书→⑥',
    mustSee: '⑥短收件；须现行申请文件',
    forbid: '凭交底直接答 OA',
    href: (id) => (id ? `/agent/cases/${id}/depts/oa?branch=b4` : '/agent/cases/new'),
  },
  {
    id: 'b5',
    title: 'B5 不申结案',
    mustSee: '⑤B 拍不申 · 不出申请号',
    forbid: '不申却出申请号',
    href: (id) =>
      id ? `/agent/cases/${id}/depts/draft?step=b&branch=b5` : '/agent/cases/new',
  },
  {
    id: 'b6',
    title: 'B6 ⑥超期',
    mustSee: '期限升级可见 · 延期/放弃/抢答须拍',
    forbid: '静默逾期',
    href: (id) => (id ? `/agent/cases/${id}/depts/oa?branch=b6` : '/agent/cases/new'),
  },
  {
    id: 'b7',
    title: 'B7 ⑧只读不拍',
    mustSee: '报告可交 · 不回写⑦',
    forbid: '未拍却改台账',
    href: (id) =>
      id ? `/agent/cases/${id}/depts/monetize?branch=b7` : '/agent/cases/new',
  },
  {
    id: 'b8',
    title: 'B8 情报官',
    mustSee: '竞对年报走情报官（非⑧）',
    forbid: '⑧/③糊弄专报',
    href: () => '/agent/assets?branch=b8',
  },
]

/**
 * 支路 B1–B8 入口门 · 故事板验收「路上有没有这扇门」
 * 演示级；门槛/结案语义由目标部页兑现。
 */
export function BranchDoors({ caseId, isAgency = false }: Props) {
  return (
    <section
      className="mb-5"
      aria-labelledby="home-branch-title"
      data-testid="home-branch-doors"
    >
      <div className="mb-2 flex flex-wrap items-baseline gap-2">
        <h2
          id="home-branch-title"
          className="text-[13px] font-semibold text-slate-900"
        >
          支路门（B1–B8）
        </h2>
        <span className="text-[11px] text-slate-500">
          虚线/跳部须看得见 · 禁止假装
          {isAgency ? ' · 代理可陪同绕 B2' : ''}
        </span>
      </div>
      <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {BRANCHES.map((b) => (
          <li key={b.id}>
            <Link
              to={b.href(caseId, isAgency)}
              className="btn-press focus-ring flex h-full flex-col rounded-xl border border-dashed border-slate-300 bg-white p-3 hover:border-slate-400 hover:bg-slate-50"
              data-testid={`home-branch-${b.id}`}
              data-branch={b.id}
            >
              <span className="text-[12px] font-semibold text-slate-900">
                {b.title}
              </span>
              <span className="mt-1 text-[11px] leading-snug text-slate-600">
                须看见：{b.mustSee}
              </span>
              <span className="mt-0.5 text-[10px] text-rose-700/80">
                禁：{b.forbid}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
