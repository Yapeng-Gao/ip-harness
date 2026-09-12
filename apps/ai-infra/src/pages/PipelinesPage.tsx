import { Card, PageHeader, StatusPill } from '../components/ui'
import { PIPELINE_NOTE, PIPELINE_TEMPLATE } from '../data/mockPipelines'

export function PipelinesPage() {
  return (
    <div>
      <PageHeader
        eyebrow="训推门禁"
        title="训练 → 评测 → 发布"
        desc="模板示意算法与平台协作门禁。不替代算法责任，不自动改 case handoff。"
      />

      <Card className="mb-4 border-amber-200 bg-amber-50/80">
        <p className="text-xs leading-relaxed text-amber-950/90">{PIPELINE_NOTE}</p>
      </Card>

      <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {PIPELINE_TEMPLATE.map((step, i) => (
          <li key={step.id}>
            <Card>
              <p className="text-xs text-slate-500">
                {i + 1} / {PIPELINE_TEMPLATE.length}
              </p>
              <p className="mt-1 text-sm font-medium text-slate-900">{step.label}</p>
              <div className="mt-2">
                <StatusPill tone={step.tone}>{step.status}</StatusPill>
              </div>
              <p className="mt-2 text-xs text-slate-500">{step.detail}</p>
            </Card>
          </li>
        ))}
      </ol>
    </div>
  )
}
