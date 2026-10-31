/**
 * 定健康薄条 · 产品设计五步「定健康」演示壳
 * 机制：成本/成长账单可见；不装真计费或边际成本引擎。
 */
export function HealthBillStrip({ caseTitle }: { caseTitle?: string }) {
  return (
    <section
      className="rounded-lg border border-slate-200 bg-white px-3 py-2"
      data-testid="health-bill-strip"
      aria-label="健康账单演示"
    >
      <div className="flex flex-wrap items-baseline gap-2">
        <h3 className="text-[11px] font-semibold text-slate-800">健康账单（演示）</h3>
        <span className="text-[10px] text-slate-500">
          定健康 · 成本可见 · 成长外显 · 非真计费
        </span>
      </div>
      <ul className="mt-1.5 grid gap-1 sm:grid-cols-3" data-testid="health-bill-rows">
        <li className="rounded-md bg-slate-50 px-2 py-1.5 text-[11px] text-slate-700">
          <span className="font-medium text-slate-900">本案注意力</span>
          <span className="mt-0.5 block text-[10px] text-slate-500">
            {caseTitle ? `「${caseTitle}」` : '本案'}硬请示 3～5 次/主链（示意）
          </span>
        </li>
        <li className="rounded-md bg-slate-50 px-2 py-1.5 text-[11px] text-slate-700">
          <span className="font-medium text-slate-900">判断沉淀</span>
          <span className="mt-0.5 block text-[10px] text-slate-500">
            案卷判断档案可回看 · 偏好仓可读写（演示 KB）
          </span>
        </li>
        <li className="rounded-md bg-slate-50 px-2 py-1.5 text-[11px] text-slate-700">
          <span className="font-medium text-slate-900">不可装的账</span>
          <span className="mt-0.5 block text-[10px] text-slate-500">
            无真 token 账单 / 无假「已省人力」KPI
          </span>
        </li>
      </ul>
    </section>
  )
}
