import { Card, PageHeader, ProgressBar, StatusPill } from '../components/ui'
import { PIPELINE_FLOW, PIPELINE_NOTE, PIPELINE_RUNS } from '../data/mockPipelines'

export function PipelinesPage() {
  return (
    <div>
      <PageHeader
        eyebrow="流水线"
        title="采集 → 清洗 → 发布"
        desc="假进度示意数据工程师协作门禁。无真 Spark、不自动推 ai-infra Release。"
      />

      <Card className="mb-4 border-amber-200 bg-amber-50/80">
        <p className="text-xs leading-relaxed text-amber-950/90">{PIPELINE_NOTE}</p>
      </Card>

      <ol className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {PIPELINE_FLOW.map((step, i) => (
          <li key={step.id}>
            <Card>
              <p className="text-xs text-slate-500">
                {i + 1} / {PIPELINE_FLOW.length}
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

      <h2 className="mb-3 text-sm font-semibold text-slate-800">运行中 / 近期（mock）</h2>
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-rest">
        <table className="w-full min-w-[40rem] text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs text-slate-500">
            <tr>
              <th className="px-3 py-2 font-medium">流水线</th>
              <th className="px-3 py-2 font-medium">阶段</th>
              <th className="px-3 py-2 font-medium">状态</th>
              <th className="px-3 py-2 font-medium">假进度</th>
            </tr>
          </thead>
          <tbody>
            {PIPELINE_RUNS.map((r) => (
              <tr key={r.id} className="border-b border-slate-100 last:border-0">
                <td className="px-3 py-2">
                  <p className="font-medium text-slate-900">{r.name}</p>
                  <p className="text-xs text-slate-500">{r.note}</p>
                </td>
                <td className="px-3 py-2">{r.stage}</td>
                <td className="px-3 py-2">
                  <StatusPill tone={r.tone}>{r.status}</StatusPill>
                </td>
                <td className="min-w-[10rem] px-3 py-2">
                  <ProgressBar value={r.progress} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
