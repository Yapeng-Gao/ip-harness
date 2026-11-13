import { Link } from 'react-router-dom'
import { Button, Card, PageHeader, ProgressBar, StatusPill } from '../components/ui'
import { jobStatusTone, runPipeline, useAiDataStore } from '../state/store'

export function PipelinesPage() {
  const { pipelines, datasets, qualityReports } = useAiDataStore()

  return (
    <div>
      <PageHeader
        eyebrow="流水线"
        title="采集 → 清洗 → 去重 → 质量门 → 发布"
        desc="多步 DAG 可 Run。质量门 fail 时 publish 进入 blocked，禁止跳到发布成功。"
      />

      <Card className="mb-4 border-amber-200 bg-amber-50/80">
        <p className="text-xs leading-relaxed text-amber-950/90">
          假进度 · 无真 Spark。请先在{' '}
          <Link to="/quality" className="underline">
            质量页
          </Link>{' '}
          对目标数据集打分并 <strong>pass</strong>，再 Run；否则质量门失败并阻断发布。
        </p>
      </Card>

      <div className="space-y-6">
        {pipelines.map((p) => {
          const ds = datasets.find((d) => d.id === p.targetDatasetId)
          const q = qualityReports.find((r) => r.datasetId === p.targetDatasetId)
          const qualityOk = q?.status === 'pass'
          return (
            <Card key={p.id}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-slate-900">{p.name}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    目标 {ds?.name ?? p.targetDatasetId} · {p.note}
                    {p.fromTicketId ? ` · ticket ${p.fromTicketId}` : ''}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    <StatusPill tone={qualityOk ? 'ok' : q?.status === 'fail' ? 'down' : 'empty'}>
                      质量门前置：{q?.status ?? 'idle'}
                    </StatusPill>
                    {p.running ? <StatusPill tone="info">running</StatusPill> : null}
                  </div>
                </div>
                <Button disabled={p.running} onClick={() => runPipeline(p.id)}>
                  {p.running ? '运行中…' : 'Run'}
                </Button>
              </div>

              <ol className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
                {p.steps.map((step, i) => (
                  <li key={step.id}>
                    <div className="rounded-lg border border-slate-100 bg-slate-50/80 p-3">
                      <p className="text-xs text-slate-500">
                        {i + 1}/{p.steps.length}
                      </p>
                      <p className="mt-0.5 text-sm font-medium text-slate-900">{step.label}</p>
                      <div className="mt-1">
                        <StatusPill tone={jobStatusTone(step.status)}>{step.status}</StatusPill>
                      </div>
                      <p className="mt-1 text-xs text-slate-500">{step.detail}</p>
                      <div className="mt-2">
                        <ProgressBar value={step.progress} />
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
