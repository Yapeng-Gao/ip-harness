import { Card, PageHeader, StatusPill } from '../components/ui'
import { RECIPES } from '../data/mockRecipes'

export function RecipesPage() {
  return (
    <div>
      <PageHeader
        eyebrow="配比 / 采样"
        title="预训练 · SFT · 偏好 · 评测配方"
        desc="MixRatio / SamplePlan 卡片示意。不随机静默改生产流量，无真难例挖掘。"
      />

      <div className="grid gap-3 sm:grid-cols-2">
        {RECIPES.map((r) => (
          <Card key={r.id}>
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-sm font-medium text-slate-900">{r.name}</p>
                <p className="mt-1 text-xs text-slate-500">{r.kind}</p>
              </div>
              <StatusPill tone={r.tone}>{r.kind}</StatusPill>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-slate-700">{r.mix}</p>
            <p className="mt-2 text-xs text-slate-500">{r.note}</p>
          </Card>
        ))}
      </div>
    </div>
  )
}
