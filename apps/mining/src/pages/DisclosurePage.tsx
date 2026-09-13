import { Link } from 'react-router-dom'
import { Eraser, Sprout } from 'lucide-react'
import { Button, Card, Chip, PageHeader } from '../components/ui'
import { miningActions, useMiningStore } from '../state/store'

export function DisclosurePage() {
  const { disclosure, hits } = useMiningStore()

  return (
    <div>
      <PageHeader
        eyebrow="① 交底 / 技术点"
        title="交底编辑"
        desc="分节填写背景、技术点、效果。可从种子加载或清空。可选关联 Search Hit（种子篮，非跨口 localStorage）。"
      />
      <div className="mb-4 flex flex-wrap items-center gap-2">
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
            种子 ≥3 条；与 fto 公开号有交集便于演示。勾选后挂到交底 relatedHitIds。
          </p>
          <ul className="mt-3 space-y-2">
            {hits.map((h) => {
              const checked = disclosure.relatedHitIds.includes(h.id)
              return (
                <li key={h.id}>
                  <label
                    className={`flex cursor-pointer gap-3 rounded-lg border px-3 py-2 text-sm ${
                      checked
                        ? 'border-violet-200 bg-violet-50'
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
