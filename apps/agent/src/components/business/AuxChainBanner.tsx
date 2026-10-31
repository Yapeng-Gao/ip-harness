/**
 * 辅链降权条 · 查新/附图/递交等 ≠ 一期八部大门
 * 机制：进辅链必须看见「非主八部」；禁止假装成①～⑧。
 */
export function AuxChainBanner({ deptLabel }: { deptLabel: string }) {
  return (
    <aside
      className="rounded-xl border border-dashed border-violet-300 bg-violet-50/80 px-3 py-2"
      data-testid="aux-chain-banner"
      role="note"
    >
      <p className="text-[12px] font-semibold text-violet-950">
        辅链 · {deptLabel} · 非主八部大门
      </p>
      <p className="mt-0.5 text-[11px] leading-snug text-violet-900/90">
        查新 / 附图 / 递交与程序等是主链零件或后勤，不占①～⑧对外序号。合格线与硬请示仍在右栏；勿把辅链当成第九部门叙事。
      </p>
      <p className="mt-1 text-[10px] text-violet-800/70">
        诚实：辅链示意 · 非真检索/递交通道
      </p>
    </aside>
  )
}
