import { Button, Card, PageHeader, StatusPill } from '../components/ui'
import {
  createRefeedFromTicket,
  runQualityScore,
  setQualityForceFail,
  useAiDataStore,
} from '../state/store'

export function QualityPage() {
  const { qualityReports, tickets } = useAiDataStore()

  return (
    <div>
      <PageHeader
        eyebrow="质量与安全"
        title="打分 / 敏感 / 污染 · 评测回流"
        desc="对数据集跑打分，生成 mock findings（标「非真引擎」）。不达标打红。ImprovementTicket 可创建难例回灌任务。"
      />

      <Card className="mb-4 border-amber-200 bg-amber-50/80">
        <p className="text-xs font-medium text-amber-950">非真 PII</p>
        <p className="mt-1 text-xs leading-relaxed text-amber-950/90">
          本页全部为示意分数与敏感/污染卡片。样机无真 PII 引擎、不处理真实个人信息。勾选「下次强制 fail」可演示质量门阻断发布。
        </p>
      </Card>

      <div className="space-y-3">
        {qualityReports.map((row) => (
          <Card
            key={row.id}
            className={row.status === 'fail' ? 'border-rose-300 bg-rose-50/40' : ''}
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="text-sm font-medium text-slate-900">{row.datasetLabel}</p>
                <p className="mt-1 text-xs text-slate-500">{row.note}</p>
              </div>
              <StatusPill tone={row.tone}>
                {row.status}
                {row.score != null ? ` · ${row.score}` : ''}
              </StatusPill>
            </div>

            {row.findings.length > 0 ? (
              <ul className="mt-3 space-y-1">
                {row.findings.map((f) => (
                  <li
                    key={f.id}
                    className="rounded-md border border-slate-100 bg-white/80 px-2 py-1.5 text-xs text-slate-700"
                  >
                    <span className="font-medium">
                      [{f.kind}/{f.severity}]
                    </span>{' '}
                    {f.detail}{' '}
                    <span className="text-amber-800">· {f.engineNote}</span>
                  </li>
                ))}
              </ul>
            ) : null}

            <div className="mt-3 flex flex-wrap items-center gap-3">
              <Button
                disabled={row.status === 'scoring'}
                onClick={() => runQualityScore(row.datasetId)}
              >
                {row.status === 'scoring' ? '打分中…' : '跑打分'}
              </Button>
              <label className="inline-flex items-center gap-1.5 text-xs text-slate-700">
                <input
                  type="checkbox"
                  checked={row.forceFailNext}
                  onChange={(e) => setQualityForceFail(row.datasetId, e.target.checked)}
                />
                下次强制 fail（演示阻断）
              </label>
            </div>
          </Card>
        ))}
      </div>

      <h2 className="mt-8 mb-3 text-sm font-semibold text-slate-800">ImprovementTicket · 评测回流</h2>
      <div className="space-y-3">
        {tickets.map((t) => (
          <Card key={t.id}>
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="text-sm font-medium text-slate-900">{t.title}</p>
                <p className="mt-1 text-xs text-slate-500">
                  {t.fromEval} · {t.note}
                </p>
              </div>
              <StatusPill
                tone={t.status === 'open' ? 'warn' : t.status === 'linked' ? 'info' : 'ok'}
              >
                {t.status} · {t.severity}
              </StatusPill>
            </div>
            <div className="mt-3">
              <Button
                variant="secondary"
                disabled={t.status === 'linked'}
                onClick={() => createRefeedFromTicket(t.id)}
              >
                {t.status === 'linked' ? `已挂 ${t.linkedPipelineId}` : '创建难例回灌任务'}
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
