import { useStageSku } from '../context/StageSkuContext'
import {
  DEFAULT_STAGE_SKUS,
  SELLABLE_MODULE_IDS,
  STAGE_ID_TO_SKU,
  STAGE_SKU_LABELS,
  type StageSkuId,
} from '../lib/stageSku'

/** Home-only demo toggles — 样机 mock · 非真 license. */
export function StageSkuDemoPanel() {
  const { entitlements, toggleSku, setStageSkus, hasSku } = useStageSku()

  return (
    <section
      className="mb-6 rounded-[var(--radius-lg)] border border-dashed border-slate-300 bg-slate-50/80 px-4 py-3"
      aria-label="样机 Stage SKU"
    >
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-medium text-slate-800">样机 · Stage SKU</h2>
          <p className="text-xs text-slate-500">
            样机 mock · 非真 license · 租户{' '}
            <span className="font-mono text-slate-700">{entitlements.tenantId}</span>
            。取消勾选后深链该节点 → 诚实空态，不写 handoff。
          </p>
        </div>
        <button
          type="button"
          className="rounded border border-slate-200 bg-white px-2 py-1 text-xs text-slate-600 hover:bg-slate-100"
          onClick={() => setStageSkus([...DEFAULT_STAGE_SKUS])}
        >
          恢复默认
        </button>
      </div>
      <ul className="flex flex-wrap gap-x-4 gap-y-2">
        {SELLABLE_MODULE_IDS.map((id) => {
          const sku = STAGE_ID_TO_SKU[id] as StageSkuId
          const checked = hasSku(sku)
          const isDefaultOff = id === 'layout'
          return (
            <li key={id}>
              <label className="inline-flex cursor-pointer items-center gap-1.5 text-xs text-slate-700">
                <input
                  type="checkbox"
                  className="rounded border-slate-300"
                  checked={checked}
                  onChange={(e) => toggleSku(sku, e.target.checked)}
                />
                <span>
                  {STAGE_SKU_LABELS[sku]}
                  <span className="ml-1 font-mono text-[10px] text-slate-400">{sku}</span>
                  {isDefaultOff && !checked && (
                    <span className="ml-1 text-amber-700">（默认未购）</span>
                  )}
                </span>
              </label>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
