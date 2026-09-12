import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button, Card, PageHeader, ProgressBar, StatusPill } from '../components/ui'
import { useAiInfra } from '../state/AiInfraStore'

export function LoadtestPage() {
  const { state, startLoadTest } = useAiInfra()
  const [endpointId, setEndpointId] = useState(state.endpoints[0]?.id ?? '')
  const [concurrency, setConcurrency] = useState(20)
  const [durationSec, setDurationSec] = useState(30)
  const noEndpoints = state.endpoints.length === 0

  return (
    <div>
      <PageHeader
        eyebrow="压测"
        title="场景与报告"
        desc="对样机端点启压测。TTFT / tokens/s / 错误率随并发与时长公式变化。不打真端点。"
      />

      <Card className="mb-4">
        <p className="text-sm font-medium text-slate-900">启动压测</p>
        <form
          className="mt-3 grid gap-3 sm:grid-cols-2"
          onSubmit={(e) => {
            e.preventDefault()
            const ep = endpointId || state.endpoints[0]?.id
            if (!ep) return
            startLoadTest(ep, concurrency, durationSec)
          }}
        >
          <label className="block text-xs text-slate-600 sm:col-span-2">
            端点
            <select
              className="mt-1 w-full rounded-md border border-slate-200 px-2 py-1.5 text-sm focus-ring"
              value={endpointId || state.endpoints[0]?.id || ''}
              onChange={(e) => setEndpointId(e.target.value)}
              disabled={noEndpoints}
            >
              {noEndpoints ? <option value="">无可用端点</option> : null}
              {state.endpoints.map((ep) => (
                <option key={ep.id} value={ep.id}>
                  {ep.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-xs text-slate-600">
            并发
            <input
              type="number"
              min={1}
              max={200}
              className="mt-1 w-full rounded-md border border-slate-200 px-2 py-1.5 text-sm focus-ring"
              value={concurrency}
              onChange={(e) => setConcurrency(Number(e.target.value) || 1)}
            />
          </label>
          <label className="block text-xs text-slate-600">
            时长（秒，样机加速）
            <input
              type="number"
              min={5}
              max={300}
              className="mt-1 w-full rounded-md border border-slate-200 px-2 py-1.5 text-sm focus-ring"
              value={durationSec}
              onChange={(e) => setDurationSec(Number(e.target.value) || 5)}
            />
          </label>
          <div className="sm:col-span-2">
            <div className="flex flex-wrap items-center gap-2">
              <Button type="submit" disabled={noEndpoints} className="agent-confirm-cta">
                开始压测
              </Button>
              {noEndpoints ? (
                <p className="agent-confirm-reason" data-tone="block" role="status">
                  请先部署端点 ·{' '}
                  <Link
                    to="/endpoints"
                    className="focus-ring rounded underline decoration-rose-300 underline-offset-2 hover:decoration-rose-600"
                  >
                    去端点
                  </Link>
                </p>
              ) : null}
            </div>
            <p className="mt-2 text-xs text-slate-500">
              公式示意：ttft↑ 随并发；tokens/s 有上限；高并发抬升 errorRate。
            </p>
          </div>
        </form>
      </Card>

      <h2 className="mb-3 text-sm font-semibold text-slate-800">跑次</h2>
      <div className="space-y-3">
        {state.loadTests.length === 0 ? (
          <Card>
            <p className="text-sm text-slate-600">尚无压测。调参后启动。</p>
          </Card>
        ) : null}
        {state.loadTests.map((lt) => {
          const ep = state.endpoints.find((e) => e.id === lt.endpointId)
          return (
            <Card key={lt.id}>
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    {ep?.name ?? lt.endpointId} · c={lt.concurrency} · {lt.durationSec}s
                  </p>
                  <p className="font-mono text-xs text-slate-500">{lt.id}</p>
                </div>
                <StatusPill
                  tone={
                    lt.status === 'succeeded' ? 'ok' : lt.status === 'running' ? 'info' : 'empty'
                  }
                >
                  {lt.status === 'succeeded' ? '报告就绪' : lt.status === 'running' ? '运行中' : '排队'}
                </StatusPill>
              </div>
              {lt.status === 'running' ? (
                <div className="mt-2">
                  <ProgressBar value={lt.progress} label="进度（加速）" />
                </div>
              ) : null}
              {lt.report ? (
                <dl className="mt-3 grid gap-3 sm:grid-cols-3 text-sm">
                  <div>
                    <dt className="text-xs text-slate-500">TTFT</dt>
                    <dd className="mt-0.5 font-medium tabular-nums">{lt.report.ttftMs} ms</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-slate-500">tokens/s</dt>
                    <dd className="mt-0.5 font-medium tabular-nums">{lt.report.tokensPerSec}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-slate-500">错误率</dt>
                    <dd className="mt-0.5 font-medium tabular-nums">
                      {(lt.report.errorRate * 100).toFixed(1)}%
                    </dd>
                  </div>
                </dl>
              ) : null}
            </Card>
          )
        })}
      </div>
    </div>
  )
}
