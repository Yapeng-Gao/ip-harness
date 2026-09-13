import { Link } from 'react-router-dom'
import { Button, Card, Chip, PageHeader, RiskDot } from '../components/ui'
import { ftoActions, useFtoStore } from '../state/store'
import type { RiskLevel } from '../state/types'
import { RISK_ORDER } from '../state/types'

export function RiskPage() {
  const { features, hits, risk, matrix, report } = useFtoStore()
  const locked = report.status === 'confirmed'

  function featureRisk(id: string) {
    return risk.byFeature.find((r) => r.featureId === id)
  }
  function hitRisk(id: string) {
    return risk.byHit.find((r) => r.hitId === id)
  }

  return (
    <div>
      <PageHeader
        eyebrow="④ 风险等级"
        title="风险汇总与覆盖"
        desc="按特征 / 文献汇总 low|medium|high|unclear；可人工覆盖（overridden:true）。全局风险可显式选择。"
      />
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {matrix.cells.length === 0 ? (
          <Chip tone="warn">矩阵为空 · 建议先自动比对</Chip>
        ) : null}
        <div className="ml-auto flex flex-wrap gap-2">
          <Link to="/matrix">
            <Button variant="secondary">← 矩阵</Button>
          </Link>
          <Link to="/report">
            <Button>下一步：报告 →</Button>
          </Link>
        </div>
      </div>

      <Card className="mb-4 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              全局风险
            </p>
            <div className="mt-2">
              <RiskDot level={risk.overall} />
              {risk.overallOverridden ? (
                <span className="ml-2">
                  <Chip tone="accent">overridden</Chip>
                </span>
              ) : null}
            </div>
          </div>
          <label className="flex items-center gap-2 text-xs text-slate-600">
            人工覆盖
            <select
              className="rounded border border-slate-200 px-2 py-1 text-sm focus-ring"
              disabled={locked}
              value={risk.overall}
              onChange={(e) =>
                ftoActions.overrideOverallRisk(e.target.value as RiskLevel)
              }
            >
              {RISK_ORDER.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </label>
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="p-4">
          <h2 className="text-sm font-semibold text-slate-900">按特征</h2>
          <ul className="mt-3 space-y-3">
            {features.map((f) => {
              const r = featureRisk(f.id)
              return (
                <li
                  key={f.id}
                  className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2"
                >
                  <div>
                    <p className="text-sm text-slate-800">{f.name}</p>
                    {r ? (
                      <div className="mt-1 flex flex-wrap items-center gap-2">
                        <RiskDot level={r.level} />
                        {r.overridden ? <Chip tone="accent">overridden</Chip> : null}
                      </div>
                    ) : (
                      <p className="mt-1 text-xs text-slate-400">未评估</p>
                    )}
                  </div>
                  <select
                    className="rounded border border-slate-200 px-2 py-1 text-xs focus-ring"
                    disabled={locked}
                    value={r?.level ?? ''}
                    onChange={(e) => {
                      const v = e.target.value as RiskLevel
                      if (v) ftoActions.overrideFeatureRisk(f.id, v)
                    }}
                  >
                    <option value="">—</option>
                    {RISK_ORDER.map((l) => (
                      <option key={l} value={l}>
                        {l}
                      </option>
                    ))}
                  </select>
                </li>
              )
            })}
          </ul>
        </Card>

        <Card className="p-4">
          <h2 className="text-sm font-semibold text-slate-900">按文献</h2>
          <ul className="mt-3 space-y-3">
            {hits.map((h) => {
              const r = hitRisk(h.id)
              return (
                <li
                  key={h.id}
                  className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2"
                >
                  <div>
                    <p className="font-mono text-xs text-slate-800">{h.publicationNumber}</p>
                    {r ? (
                      <div className="mt-1 flex flex-wrap items-center gap-2">
                        <RiskDot level={r.level} />
                        {r.overridden ? <Chip tone="accent">overridden</Chip> : null}
                      </div>
                    ) : (
                      <p className="mt-1 text-xs text-slate-400">未评估</p>
                    )}
                  </div>
                  <select
                    className="rounded border border-slate-200 px-2 py-1 text-xs focus-ring"
                    disabled={locked}
                    value={r?.level ?? ''}
                    onChange={(e) => {
                      const v = e.target.value as RiskLevel
                      if (v) ftoActions.overrideHitRisk(h.id, v)
                    }}
                  >
                    <option value="">—</option>
                    {RISK_ORDER.map((l) => (
                      <option key={l} value={l}>
                        {l}
                      </option>
                    ))}
                  </select>
                </li>
              )
            })}
          </ul>
        </Card>
      </div>
    </div>
  )
}
