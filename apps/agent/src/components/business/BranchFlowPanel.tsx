import { Link } from 'react-router-dom'
import { buildBranchJudgment } from '../../business/judgmentArchive'

type Props = {
  branch: string | null
  caseId: string
  deptSlug: string
  onRecordJudgment?: (j: ReturnType<typeof buildBranchJudgment>) => void
}

/**
 * 支路 B1–B8 进部后的可用演示流 · 故事板「须看见 / 禁假装」
 */
export function BranchFlowPanel({
  branch,
  caseId,
  deptSlug,
  onRecordJudgment,
}: Props) {
  if (!branch) return null
  const b = branch.toLowerCase()

  if (b === 'b1') {
    return (
      <section
        className="rounded-xl border border-dashed border-indigo-300 bg-indigo-50/70 px-4 py-3"
        data-testid="branch-flow-b1"
        data-branch="b1"
      >
        <p className="text-[10px] font-semibold uppercase tracking-wide text-indigo-800/80">
          B1 · 直达④
        </p>
        <p className="mt-0.5 text-[12px] font-medium text-slate-900">
          跳过①②③ · 本页须见「短收件 + 进入检查表」；禁止假装已激发/已挖点。
        </p>
        <ul className="mt-2 space-y-1 text-[11px] text-slate-700" data-testid="branch-b1-checklist">
          <li>☐ 短收件：技术事实一页纸（演示）</li>
          <li>☐ 进入检查表：发明人/领域/密级非空</li>
          <li>☐ 未声称「已过②③」</li>
        </ul>
        <div className="mt-2 flex flex-wrap gap-2">
          <button
            type="button"
            className="btn-press focus-ring rounded-full bg-slate-900 px-3 py-1 text-[11px] font-semibold text-white"
            data-testid="branch-b1-ack"
            onClick={() =>
              onRecordJudgment?.(
                buildBranchJudgment({
                  caseId,
                  gate: 'B1直达④',
                  conclusion: '短收件+检查表已见，开干④',
                  option: '承认跳过①②③',
                  reason: 'B1 虚线入口 · 不装已激发',
                  compare: '假装已挖点 = 禁止',
                }),
              )
            }
          >
            确认短收件开干
          </button>
          <Link
            to={`/agent/cases/${caseId}`}
            className="btn-press focus-ring rounded-full border border-slate-300 bg-white px-3 py-1 text-[11px] font-medium text-slate-700"
          >
            回公司补①②③
          </Link>
        </div>
      </section>
    )
  }

  if (b === 'b2') {
    return (
      <section
        className="rounded-xl border border-dashed border-amber-300 bg-amber-50/80 px-4 py-3"
        data-testid="branch-flow-b2"
        data-branch="b2"
      >
        <p className="text-[10px] font-semibold uppercase tracking-wide text-amber-900/80">
          B2 · 自带交底→⑤
        </p>
        <p className="mt-0.5 text-[12px] text-slate-800">
          须跑⑤进入检查表；不过→退④补料。未全绿禁止硬写申请。代理陪同见顶栏门槛条。
        </p>
        <Link
          to={`/agent/cases/${caseId}/depts/disclosure`}
          className="btn-press focus-ring mt-2 inline-block rounded-full border border-amber-400 bg-white px-3 py-1 text-[11px] font-medium text-amber-950"
          data-testid="branch-b2-back-disclosure"
        >
          退④补料
        </Link>
      </section>
    )
  }

  if (b === 'b3') {
    return (
      <section
        className="rounded-xl border border-dashed border-violet-300 bg-violet-50/70 px-4 py-3"
        data-testid="branch-flow-b3"
        data-branch="b3"
      >
        <p className="text-[10px] font-semibold uppercase tracking-wide text-violet-800/80">
          B3 · 建议改④
        </p>
        <p className="mt-0.5 text-[12px] text-slate-800">
          仅有技术说明、缺交底要件时：建议回④，禁止用「先查新」绕过交底门槛。
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          <Link
            to={`/agent/cases/${caseId}/depts/disclosure?branch=b1`}
            className="btn-press focus-ring rounded-full bg-slate-900 px-3 py-1 text-[11px] font-semibold text-white"
            data-testid="branch-b3-to-disclosure"
          >
            接受建议 · 去④
          </Link>
          <button
            type="button"
            className="btn-press focus-ring rounded-full border border-slate-300 bg-white px-3 py-1 text-[11px] font-medium text-slate-700"
            data-testid="branch-b3-refuse-search"
            onClick={() =>
              onRecordJudgment?.(
                buildBranchJudgment({
                  caseId,
                  gate: 'B3建议改④',
                  conclusion: '拒绝「先查新」绕过',
                  option: '坚持补交底',
                  reason: '禁查新绕门槛',
                  compare: '先查新绕过 = 禁止',
                }),
              )
            }
          >
            拒绝查新绕过（留痕）
          </button>
        </div>
      </section>
    )
  }

  if (b === 'b4') {
    return (
      <section
        className="rounded-xl border border-dashed border-teal-300 bg-teal-50/70 px-4 py-3"
        data-testid="branch-flow-b4"
        data-branch="b4"
      >
        <p className="text-[10px] font-semibold uppercase tracking-wide text-teal-800/80">
          B4 · 通知书→⑥
        </p>
        <p className="mt-0.5 text-[12px] text-slate-800">
          ⑥短收件：须挂现行申请文件；禁止凭交底直接答 OA。
        </p>
        <ul className="mt-2 text-[11px] text-slate-700" data-testid="branch-b4-intake">
          <li>· 通知书类型：一通（演示）</li>
          <li>· 现行申请：CN2026XXXX（演示挂接）</li>
          <li>· 禁：仅交底无申请号开答</li>
        </ul>
        <button
          type="button"
          className="btn-press focus-ring mt-2 rounded-full bg-slate-900 px-3 py-1 text-[11px] font-semibold text-white"
          data-testid="branch-b4-ack"
          onClick={() =>
            onRecordJudgment?.(
              buildBranchJudgment({
                caseId,
                gate: 'B4通知书进⑥',
                conclusion: '短收件齐 · 有现行申请',
                option: '开干答复',
                reason: 'B4',
                compare: '凭交底答 OA = 禁止',
              }),
            )
          }
        >
          确认短收件开干
        </button>
      </section>
    )
  }

  if (b === 'b6') {
    return (
      <section
        className="rounded-xl border border-rose-300 bg-rose-50/80 px-4 py-3"
        data-testid="branch-flow-b6"
        data-branch="b6"
      >
        <p className="text-[10px] font-semibold uppercase tracking-wide text-rose-800/80">
          B6 · ⑥超期升级
        </p>
        <p className="mt-0.5 text-[12px] font-medium text-slate-900">
          期限升级可见 · 延期 / 放弃 / 抢答须拍 · <strong>禁静默逾期</strong>
        </p>
        <p className="mt-1 text-[11px] text-rose-900" data-testid="branch-b6-deadline">
          演示期限：剩余 −3 天（已升级催办）
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {['申请延期', '放弃本轮', '抢答递交'].map((opt) => (
            <button
              key={opt}
              type="button"
              className="btn-press focus-ring rounded-full border border-rose-300 bg-white px-3 py-1 text-[11px] font-medium text-rose-950"
              data-testid={`branch-b6-${opt}`}
              onClick={() =>
                onRecordJudgment?.(
                  buildBranchJudgment({
                    caseId,
                    gate: 'B6超期升级',
                    conclusion: opt,
                    option: opt,
                    reason: '期限升级可见 · 非静默',
                    compare: '静默逾期 = 禁止',
                  }),
                )
              }
            >
              {opt}
            </button>
          ))}
        </div>
      </section>
    )
  }

  if (b === 'b8') {
    return (
      <section
        className="rounded-xl border border-dashed border-slate-400 bg-slate-50 px-4 py-3"
        data-testid="branch-flow-b8"
        data-branch="b8"
      >
        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
          B8 · 情报官（非⑧）
        </p>
        <p className="mt-0.5 text-[12px] text-slate-800">
          竞对年报走情报官另链；禁止用⑧复盘/③挖掘糊弄专报。
        </p>
        <Link
          to="/agent/assets?branch=b8"
          className="btn-press focus-ring mt-2 inline-block rounded-full bg-slate-900 px-3 py-1 text-[11px] font-semibold text-white"
          data-testid="branch-b8-to-intel"
        >
          打开情报官入口（资产·演示）
        </Link>
      </section>
    )
  }

  // b5/b7 由部页专用面板承接；此处仅挂锚
  if (b === 'b5' || b === 'b7') {
    return (
      <div
        className="sr-only"
        data-testid={`branch-flow-${b}`}
        data-branch={b}
        data-dept={deptSlug}
      >
        {b} 见主栏专用面板
      </div>
    )
  }

  return (
    <section
      className="rounded-xl border border-dashed border-slate-300 bg-white px-4 py-3 text-[12px] text-slate-600"
      data-testid="branch-flow-unknown"
      data-branch={b}
    >
      支路 {b.toUpperCase()} · 入口已达；细流动作见本部门主栏。
    </section>
  )
}
