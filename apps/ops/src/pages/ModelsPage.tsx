import { useState } from 'react'
import { Card, PageHeader, StatusPill } from '../components/ui'
import { MODEL_CARDS, MODEL_ROUTES, SCHEMA_ALIGN } from '../data/mockModels'

export function ModelsPage() {
  const [redact, setRedact] = useState(true)

  return (
    <div>
      <PageHeader
        eyebrow="模型"
        title="模型监控"
        desc="版本 / 路由、延迟与 token、成功率、护栏拦截、人工接管。数字为样机 mock。"
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {MODEL_CARDS.map((c) => (
          <Card key={c.id}>
            <p className="text-xs text-slate-500">{c.label}</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums text-slate-900">{c.value}</p>
            <p className="mt-1 text-xs text-slate-500">{c.note}</p>
          </Card>
        ))}
      </div>

      <div className="mt-6 grid gap-3 lg:grid-cols-2">
        <Card>
          <p className="text-sm font-medium text-slate-900">schemaVersion 对齐</p>
          <dl className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between gap-3">
              <dt className="text-slate-500">audit</dt>
              <dd className="font-mono text-slate-800">{SCHEMA_ALIGN.audit}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-slate-500">caseContext</dt>
              <dd className="font-mono text-slate-800">{SCHEMA_ALIGN.caseContext}</dd>
            </div>
          </dl>
          <p className="mt-3 text-xs text-slate-500">{SCHEMA_ALIGN.note}</p>
        </Card>
        <Card>
          <p className="text-sm font-medium text-slate-900">脱敏开关（示意）</p>
          <p className="mt-1 text-xs text-slate-500">
            仅本地 UI 态，不写生产配置、不接密钥托管。
          </p>
          <button
            type="button"
            role="switch"
            aria-checked={redact}
            onClick={() => setRedact((v) => !v)}
            className="btn-press mt-4 inline-flex items-center gap-3 text-sm"
          >
            <span
              className={`relative h-6 w-10 rounded-full ${redact ? 'bg-slate-900' : 'bg-slate-300'}`}
            >
              <span
                className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm"
                style={{ left: redact ? '1.15rem' : '0.125rem' }}
              />
            </span>
            {redact ? '日志 / 提示词脱敏 · 开' : '日志 / 提示词脱敏 · 关'}
          </button>
          <p className="mt-3 font-mono text-xs text-slate-500">
            {redact ? 'prompt: [REDACTED inventor email]' : 'prompt: 李明远 / inventor@example.com'}
          </p>
        </Card>
      </div>

      <h2 className="mt-8 mb-3 text-sm font-semibold text-slate-800">版本 / 路由</h2>
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-rest">
        <table className="w-full min-w-[48rem] text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs text-slate-500">
            <tr>
              <th className="px-3 py-2 font-medium">路由</th>
              <th className="px-3 py-2 font-medium">版本</th>
              <th className="px-3 py-2 font-medium">p50 / p95</th>
              <th className="px-3 py-2 font-medium">token in/out</th>
              <th className="px-3 py-2 font-medium">成功率</th>
              <th className="px-3 py-2 font-medium">护栏</th>
              <th className="px-3 py-2 font-medium">接管</th>
              <th className="px-3 py-2 font-medium">schema</th>
            </tr>
          </thead>
          <tbody>
            {MODEL_ROUTES.map((r) => (
              <tr key={r.id} className="border-b border-slate-100 last:border-0">
                <td className="px-3 py-2 font-medium text-slate-800">{r.name}</td>
                <td className="px-3 py-2 font-mono text-xs text-slate-600">{r.version}</td>
                <td className="px-3 py-2 tabular-nums text-slate-700">
                  {r.latencyP50} / {r.latencyP95}
                </td>
                <td className="px-3 py-2 tabular-nums text-slate-700">
                  {r.tokensIn} / {r.tokensOut}
                </td>
                <td className="px-3 py-2 tabular-nums">{r.successPct}%</td>
                <td className="px-3 py-2 tabular-nums">{r.guardHits}</td>
                <td className="px-3 py-2 tabular-nums">{r.humanTakeover}</td>
                <td className="px-3 py-2">
                  <StatusPill tone={r.schemaAligned ? 'ok' : 'warn'}>
                    {r.schemaAligned ? 'aligned' : 'legacy 漂移'}
                  </StatusPill>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
