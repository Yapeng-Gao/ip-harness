import { useState } from 'react'
import { Card, PageHeader, StatusPill, Toast } from '../components/ui'
import { LOAD_REPORT, SCENARIOS } from '../data/mockLoadtest'

export function LoadtestPage() {
  const [toast, setToast] = useState<string | null>(null)

  function runMock(name: string) {
    setToast(`压测「${name}」· 样机不打真端点`)
    window.setTimeout(() => setToast(null), 2400)
  }

  return (
    <div>
      <PageHeader
        eyebrow="压测"
        title="场景与报告"
        desc="负载画像与静态报告。不写对象存储，不对已发布端点发真实流量。"
      />

      <h2 className="mb-3 text-sm font-semibold text-slate-800">场景</h2>
      <div className="grid gap-3 lg:grid-cols-2">
        {SCENARIOS.map((s) => (
          <Card key={s.id}>
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm font-medium text-slate-900">{s.name}</p>
              <StatusPill tone={s.tone}>{s.lastRun === '未跑' ? '未跑' : '有报告（假）'}</StatusPill>
            </div>
            <p className="mt-1 text-xs text-slate-500">目标 {s.target}</p>
            <p className="mt-1 text-xs text-slate-600">{s.profile}</p>
            <p className="mt-2 text-xs text-slate-500">上次 {s.lastRun}</p>
            <button
              type="button"
              className="btn-press mt-3 rounded-md border border-slate-200 px-2.5 py-1 text-xs text-slate-700 hover:bg-slate-50"
              onClick={() => runMock(s.name)}
            >
              试跑（mock）
            </button>
          </Card>
        ))}
      </div>

      <h2 className="mt-8 mb-3 text-sm font-semibold text-slate-800">最近报告（静态）</h2>
      <Card>
        <p className="text-sm font-medium text-slate-900">{LOAD_REPORT.scenario}</p>
        <dl className="mt-3 grid gap-3 sm:grid-cols-3 text-sm">
          <div>
            <dt className="text-xs text-slate-500">p50</dt>
            <dd className="mt-0.5 tabular-nums font-medium">{LOAD_REPORT.p50}</dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500">p95</dt>
            <dd className="mt-0.5 tabular-nums font-medium">{LOAD_REPORT.p95}</dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500">错误率</dt>
            <dd className="mt-0.5 tabular-nums font-medium">{LOAD_REPORT.errorRate}</dd>
          </div>
        </dl>
        <p className="mt-3 text-xs text-slate-500">{LOAD_REPORT.note}</p>
      </Card>
      {toast ? <Toast message={toast} /> : null}
    </div>
  )
}
