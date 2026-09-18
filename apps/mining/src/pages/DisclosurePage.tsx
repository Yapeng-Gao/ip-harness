import { Link } from 'react-router-dom'
import { Download, Eraser, RotateCcw, Sprout } from 'lucide-react'
import { Button, Card, Chip, PageHeader } from '../components/ui'
import { miningActions, useMiningStore } from '../state/store'

export function DisclosurePage() {
  const { disclosure, hits } = useMiningStore()

  return (
    <div>
      <PageHeader
        eyebrow="① 交底 / 技术点"
        title="交底编辑"
        desc="策略 A：本壳种子与 search 共享公开号。「从 Search 工作篮导入」= 加载共享种子 + 诚实 toast（不跨口 LS）。可编辑交底并关联 Hit。"
      />
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Button
          variant="secondary"
          className="inline-flex items-center gap-1"
          onClick={() => miningActions.importFromSearchBasket()}
        >
          <Download className="h-3.5 w-3.5" aria-hidden />
          从 Search 工作篮导入
        </Button>
        <Button
          variant="secondary"
          className="inline-flex items-center gap-1"
          onClick={() => miningActions.resetSeedHits()}
        >
          <RotateCcw className="h-3.5 w-3.5" aria-hidden />
          恢复种子篮
        </Button>
        <Button
          variant="secondary"
          className="inline-flex items-center gap-1"
          onClick={() => miningActions.loadSeedDisclosure()}
        >
          <Sprout className="h-3.5 w-3.5" aria-hidden />
          从种子加载
        </Button>
        <Button
          variant="secondary"
          className="inline-flex items-center gap-1"
          onClick={() => miningActions.clearDisclosure()}
        >
          <Eraser className="h-3.5 w-3.5" aria-hidden />
          清空
        </Button>
        {disclosure.relatedHitIds.length > 0 ? (
          <Chip tone="accent">已关联 Hit {disclosure.relatedHitIds.length}</Chip>
        ) : (
          <Chip tone="warn">未关联 Hit</Chip>
        )}
        <Link to="/candidates" className="ml-auto">
          <Button variant="secondary">下一步：候选 →</Button>
        </Link>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="space-y-4 p-4">
          <label className="block">
            <span className="text-xs font-medium text-slate-500">背景</span>
            <textarea
              className="mt-1 w-full rounded border border-slate-200 px-3 py-2 text-sm focus-ring"
              rows={4}
              value={disclosure.background}
              onChange={(e) =>
                miningActions.updateDisclosure({ background: e.target.value })
              }
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-slate-500">技术点</span>
            <textarea
              className="mt-1 w-full rounded border border-slate-200 px-3 py-2 text-sm focus-ring"
              rows={6}
              value={disclosure.techPoints}
              onChange={(e) =>
                miningActions.updateDisclosure({ techPoints: e.target.value })
              }
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-slate-500">效果</span>
            <textarea
              className="mt-1 w-full rounded border border-slate-200 px-3 py-2 text-sm focus-ring"
              rows={3}
              value={disclosure.effects}
              onChange={(e) =>
                miningActions.updateDisclosure({ effects: e.target.value })
              }
            />
          </label>
        </Card>

        <Card className="p-4">
          <h2 className="text-sm font-semibold text-slate-900">关联 Search Hit（多选）</h2>
          <p className="mt-1 text-xs text-slate-500">
            策略 A 共享种子公开号；与 fto / search 对齐便于演示。勾选后挂到交底 relatedHitIds（不跨口 localStorage）。
          </p>
          <ul className="mt-3 space-y-2">
            {hits.map((h) => {
              const checked = disclosure.relatedHitIds.includes(h.id)
              return (
                <li key={h.id}>
                  <label
                    className={`flex cursor-pointer gap-3 rounded-lg border px-3 py-2 text-sm ${
                      checked
                        ? 'border-[var(--color-accent)]/30 bg-[var(--color-accent-soft)]'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="mt-1"
                      checked={checked}
                      onChange={() => miningActions.toggleRelatedHit(h.id)}
                    />
                    <span className="min-w-0">
                      <span className="font-mono text-xs text-slate-500">
                        {h.publicationNumber}
                      </span>
                      <span className="mt-0.5 block font-medium text-slate-800">{h.title}</span>
                      {h.snippet ? (
                        <span className="mt-0.5 block text-xs text-slate-500">{h.snippet}</span>
                      ) : null}
                      {h.applicant ? (
                        <span className="mt-0.5 block text-xs text-slate-400">{h.applicant}</span>
                      ) : null}
                    </span>
                  </label>
                </li>
              )
            })}
          </ul>
        </Card>
      </div>
    </div>
  )
}
