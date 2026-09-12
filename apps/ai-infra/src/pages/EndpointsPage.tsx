import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button, Card, EmptyState, PageHeader, StatusPill } from '../components/ui'
import { useAiInfra } from '../state/AiInfraStore'

export function EndpointsPage() {
  const { state, deployEndpoint, setCanary, rollbackEndpoint, findRevisionLabel } = useAiInfra()
  const revisions = useMemo(
    () =>
      state.models.flatMap((m) =>
        m.revisions.map((r) => ({ id: r.id, label: `${m.name} · ${r.version}（${r.stage}）` })),
      ),
    [state.models],
  )
  const [name, setName] = useState('')
  const [revId, setRevId] = useState(revisions[0]?.id ?? '')

  return (
    <div>
      <PageHeader
        eyebrow="在线推理"
        title="端点 / 金丝雀 / 回滚"
        desc="从 model revision 部署端点；滑动金丝雀流量；一键回滚将 canary% 置 0。无真推理进程。"
      />

      <Card className="mb-4">
        <p className="text-sm font-medium text-slate-900">部署端点</p>
        <form
          className="mt-2 grid gap-2 sm:grid-cols-3"
          onSubmit={(e) => {
            e.preventDefault()
            const r = revId || revisions[0]?.id
            if (!r || !name.trim()) return
            deployEndpoint(name.trim(), r)
            setName('')
          }}
        >
          <input
            id="ai-deploy-endpoint"
            className="rounded-md border border-slate-200 px-2 py-1.5 text-sm focus-ring"
            placeholder="端点名"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <select
            className="rounded-md border border-slate-200 px-2 py-1.5 text-sm focus-ring"
            value={revId || revisions[0]?.id || ''}
            onChange={(e) => setRevId(e.target.value)}
          >
            {revisions.map((r) => (
              <option key={r.id} value={r.id}>
                {r.label}
              </option>
            ))}
          </select>
          <Button type="submit">部署</Button>
        </form>
      </Card>

      <div className="grid gap-3 lg:grid-cols-2">
        {state.endpoints.map((ep) => (
          <Card key={ep.id}>
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-medium text-slate-900">{ep.name}</p>
                <p className="mt-0.5 font-mono text-xs text-slate-500">
                  stable {findRevisionLabel(ep.modelRevisionId)}
                </p>
                {ep.canaryRevisionId ? (
                  <p className="font-mono text-xs text-slate-500">
                    canary {findRevisionLabel(ep.canaryRevisionId)}
                  </p>
                ) : null}
              </div>
              <StatusPill tone={ep.status === 'canary' ? 'info' : 'ok'}>
                {ep.status === 'canary' ? '金丝雀' : '已发布'}
              </StatusPill>
            </div>
            <label className="mt-3 block text-xs text-slate-600">
              金丝雀流量 {ep.trafficCanaryPct}%
              <input
                type="range"
                min={0}
                max={100}
                className="mt-1 w-full"
                value={ep.trafficCanaryPct}
                onChange={(e) => setCanary(ep.id, Number(e.target.value))}
              />
            </label>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button variant="secondary" onClick={() => rollbackEndpoint(ep.id)}>
                一键回滚（canary→0）
              </Button>
            </div>
            <p className="mt-2 text-xs text-slate-500">切流为 UI 态 · 不改生产真流量</p>
          </Card>
        ))}
      </div>

      {state.endpoints.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            title="无端点"
            body="从上方选择 revision 部署；若尚无模型请先去注册。"
            action={
              <>
                <Button
                  variant="secondary"
                  onClick={() => document.getElementById('ai-deploy-endpoint')?.focus()}
                >
                  去部署端点
                </Button>
                <Link
                  to="/models"
                  className="ui-btn ui-btn-sm ui-btn-ghost btn-press focus-ring"
                >
                  去注册模型
                </Link>
              </>
            }
          />
        </div>
      ) : null}
    </div>
  )
}
