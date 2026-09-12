import { useMemo, useState } from 'react'
import { Button, Card, PageHeader, StatusPill } from '../components/ui'
import { saveRecipe, useAiDataStore } from '../state/store'
import type { Recipe } from '../state/types'

function RecipeEditor({ recipe }: { recipe: Recipe }) {
  const [ratios, setRatios] = useState(recipe.ratios)
  const [sampleTotal, setSampleTotal] = useState(recipe.sampleTotal)

  const preview = useMemo(() => {
    const sum = ratios.reduce((a, r) => a + r.pct, 0) || 1
    return ratios.map((r) => ({
      label: r.label,
      pct: r.pct,
      count: Math.round((sampleTotal * r.pct) / sum),
    }))
  }, [ratios, sampleTotal])

  return (
    <Card>
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-medium text-slate-900">{recipe.name}</p>
          <p className="mt-1 text-xs text-slate-500">{recipe.kind}</p>
        </div>
        <StatusPill tone="info">{recipe.kind}</StatusPill>
      </div>

      <div className="mt-3 space-y-2">
        {ratios.map((r, i) => (
          <label key={r.label} className="flex items-center justify-between gap-2 text-xs">
            <span className="w-24 shrink-0 text-slate-700">{r.label}</span>
            <input
              type="range"
              min={0}
              max={100}
              value={r.pct}
              className="flex-1"
              onChange={(e) => {
                const pct = Number(e.target.value)
                setRatios((prev) => prev.map((x, j) => (j === i ? { ...x, pct } : x)))
              }}
            />
            <span className="w-10 tabular-nums text-right text-slate-800">{r.pct}%</span>
          </label>
        ))}
      </div>

      <label className="mt-3 flex items-center gap-2 text-xs text-slate-700">
        采样总量
        <input
          type="number"
          min={100}
          step={100}
          value={sampleTotal}
          className="w-28 rounded-md border border-slate-200 px-2 py-1 tabular-nums"
          onChange={(e) => setSampleTotal(Math.max(0, Number(e.target.value) || 0))}
        />
      </label>

      <div className="mt-3 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
        <p className="text-xs font-medium text-slate-700">采样预览（条数拆分）</p>
        <ul className="mt-1 space-y-0.5 text-xs text-slate-600">
          {preview.map((p) => (
            <li key={p.label}>
              {p.label}：<span className="tabular-nums font-medium">{p.count}</span> 条（{p.pct}%）
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Button
          onClick={() => {
            saveRecipe(recipe.id, ratios, sampleTotal)
          }}
        >
          保存配比
        </Button>
        {recipe.savedAt ? (
          <span className="text-xs text-slate-500">已保存 {recipe.savedAt}</span>
        ) : (
          <span className="text-xs text-slate-500">{recipe.note}</span>
        )}
      </div>
    </Card>
  )
}

export function RecipesPage() {
  const { recipes } = useAiDataStore()

  return (
    <div>
      <PageHeader
        eyebrow="配比 / 采样"
        title="预训练 · SFT · 偏好 · 评测配方"
        desc="调整配比后点保存；采样预览给出条数拆分。内存生效，不改生产流量。"
      />

      <div className="grid gap-3 sm:grid-cols-2">
        {recipes.map((r) => (
          <RecipeEditor key={r.id} recipe={r} />
        ))}
      </div>
    </div>
  )
}
