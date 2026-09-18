import { ShieldOff } from 'lucide-react'
import { AppLink } from '@shared/components/AppLink'
import {
  STAGE_SKU_LABELS,
  skuForModuleId,
  type StageSkuId,
} from '../lib/stageSku'

export function StageSkuEmpty({ moduleId }: { moduleId: string }) {
  const sku = skuForModuleId(moduleId)
  const skuName =
    sku != null ? `${STAGE_SKU_LABELS[sku as StageSkuId]}（${sku}）` : moduleId

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center p-8">
      <div
        className="ui-empty max-w-md border border-dashed border-slate-200 bg-white px-8 py-10 text-center shadow-[var(--shadow-rest)]"
        role="status"
      >
        <ShieldOff
          className="mx-auto mb-3 h-10 w-10 text-slate-300"
          aria-hidden
        />
        <p className="ui-empty-title text-base text-slate-800">未授权该办理节点</p>
        <p className="ui-empty-desc mt-2 text-sm leading-relaxed text-slate-600">
          当前租户未购买 Stage SKU：
          <span className="mx-1 font-medium text-slate-800">{skuName}</span>
          。本页为样机 mock 授权闸，非真 license。
        </p>
        <p className="mt-3 text-xs text-slate-500">
          未授权状态下不挂载办理 Flow，不写入 handoff。
        </p>
        <AppLink
          to="/workbench"
          className="btn-press focus-ring mt-5 inline-flex items-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-800 shadow-sm hover:bg-slate-50"
        >
          返回工作台首页
        </AppLink>
      </div>
    </div>
  )
}
