import { useState } from 'react'
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
 * §13：加深可勾检查 / 短收件 / 期限条，仍非完整状态机。
 */
export function BranchFlowPanel({
  branch,
  caseId,
  deptSlug,
  onRecordJudgment,
}: Props) {
  const [checks, setChecks] = useState<Record<string, boolean>>({})
  const [attached, setAttached] = useState(false)
  const [ack, setAck] = useState<string | null>(null)

  if (!branch) return null
  const b = branch.toLowerCase()

  const toggle = (id: string) => setChecks((p) => ({ ...p, [id]: !p[id] }))

  if (b === 'b1') {
    const items = [
      ['recv', '短收件：技术事实一页纸（演示）'],
      ['gate', '进入检查表：发明人/领域/密级非空'],
      ['honest', '未声称「已过②③」'],
    ] as const
    const ok = items.every(([id]) => checks[id])
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
          跳过①②③ · 须见短收件+进入检查；禁止假装已激发/已挖点。
        </p>
        <ul className="mt-2 space-y-1.5 text-[11px] text-slate-700" data-testid="branch-b1-checklist">
          {items.map(([id, label]) => (
            <li key={id}>
              <label className="flex cursor-pointer items-start gap-2">
                <input
                  type="checkbox"
                  checked={Boolean(checks[id])}
                  onChange={() => toggle(id)}
                  data-testid={`branch-b1-check-${id}`}
                />
                <span>{label}</span>
              </label>
            </li>
          ))}
        </ul>
        <div className="mt-2 flex flex-wrap gap-2">
          <button
            type="button"
            disabled={!ok}
            className="btn-press focus-ring rounded-full bg-slate-900 px-3 py-1 text-[11px] font-semibold text-white disabled:opacity-40"
            data-testid="branch-b1-ack"
            onClick={() => {
              setAck('b1')
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
            }}
          >
            {ok ? '确认短收件开干' : '勾齐后再开干'}
          </button>
          <Link
            to={`/agent/cases/${caseId}`}
            className="btn-press focus-ring rounded-full border border-slate-300 bg-white px-3 py-1 text-[11px] font-medium text-slate-700"
          >
            回公司补①②③
          </Link>
        </div>
        {ack === 'b1' ? (
          <p className="mt-2 text-[10px] text-emerald-800" data-testid="branch-b1-acked">
            已留痕 · 可开干④主栏；不装已过②③。
          </p>
        ) : null}
      </section>
    )
  }

  if (b === 'b2') {
    const items = [
      ['disc', '交底材料可挂（或代理陪同旁路）'],
      ['gate', '⑤进入检查表：发明人/领域/密级'],
      ['green', '未全绿不硬写申请'],
    ] as const
    const ok = items.every(([id]) => checks[id])
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
          须跑⑤进入检查；不过→退④补料。代理陪同见顶栏门槛条（不装交底过线）。
        </p>
        <ul className="mt-2 space-y-1.5 text-[11px]" data-testid="branch-b2-checklist">
          {items.map(([id, label]) => (
            <li key={id}>
              <label className="flex cursor-pointer items-start gap-2 text-slate-800">
                <input
                  type="checkbox"
                  checked={Boolean(checks[id])}
                  onChange={() => toggle(id)}
                  data-testid={`branch-b2-check-${id}`}
                />
                <span>{label}</span>
              </label>
            </li>
          ))}
        </ul>
        <div className="mt-2 flex flex-wrap gap-2">
          <button
            type="button"
            disabled={!ok}
            className="btn-press focus-ring rounded-full bg-slate-900 px-3 py-1 text-[11px] font-semibold text-white disabled:opacity-40"
            data-testid="branch-b2-pass"
            onClick={() =>
              onRecordJudgment?.(
                buildBranchJudgment({
                  caseId,
                  gate: 'B2自带交底',
                  conclusion: '进入检查示意通过',
                  option: '开干⑤',
                  reason: 'B2 · 检查表勾齐',
                  compare: '未全绿硬写申请 = 禁止',
                }),
              )
            }
          >
            {ok ? '检查通过 · 开干⑤' : '勾齐进入检查'}
          </button>
          <Link
            to={`/agent/cases/${caseId}/depts/disclosure`}
            className="btn-press focus-ring rounded-full border border-amber-400 bg-white px-3 py-1 text-[11px] font-medium text-amber-950"
            data-testid="branch-b2-back-disclosure"
          >
            退④补料
          </Link>
        </div>
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
          <li>· 现行申请：CN2026XXXX（演示）</li>
          <li>· 禁：仅交底无申请号开答</li>
        </ul>
        <label className="mt-2 flex cursor-pointer items-center gap-2 text-[11px] text-slate-800">
          <input
            type="checkbox"
            checked={attached}
            onChange={(e) => setAttached(e.target.checked)}
            data-testid="branch-b4-attach"
          />
          已挂接现行申请文件（演示）
        </label>
        <button
          type="button"
          disabled={!attached}
          className="btn-press focus-ring mt-2 rounded-full bg-slate-900 px-3 py-1 text-[11px] font-semibold text-white disabled:opacity-40"
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
          {attached ? '确认短收件开干' : '先挂接申请文件'}
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
        <div className="mt-2" data-testid="branch-b6-deadline">
          <div className="flex items-center justify-between text-[11px] text-rose-900">
            <span>演示期限</span>
            <span className="font-bold tabular-nums">剩余 −3 天</span>
          </div>
          <div className="mt-1 h-2 overflow-hidden rounded-full bg-rose-100">
            <div className="h-full w-full bg-rose-500" style={{ width: '100%' }} />
          </div>
          <p className="mt-1 text-[10px] text-rose-800/80">已升级催办 · 非静默</p>
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          {['申请延期', '放弃本轮', '抢答递交'].map((opt) => (
            <button
              key={opt}
              type="button"
              className="btn-press focus-ring rounded-full border border-rose-300 bg-white px-3 py-1 text-[11px] font-medium text-rose-950"
              data-testid={`branch-b6-${opt}`}
              onClick={() => {
                setAck(opt)
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
              }}
            >
              {opt}
            </button>
          ))}
        </div>
        {ack ? (
          <p className="mt-2 text-[10px] text-emerald-800" data-testid="branch-b6-acked">
            已拍「{ack}」· 写入判断档案（演示）。
          </p>
        ) : null}
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
        <ul className="mt-2 space-y-1 text-[11px] text-slate-600" data-testid="branch-b8-must-see">
          <li>· 须看见：情报官入口（资产页）</li>
          <li>· 禁：⑧五块报告假装专报</li>
          <li>· 禁：③点包代替年报分析</li>
        </ul>
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
