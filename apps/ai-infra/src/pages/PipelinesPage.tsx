import { useMemo, useState } from 'react'
import { Button, Card, PageHeader, StatusPill } from '../components/ui'
import { previewPipelinePublish, useAiInfra } from '../state/AiInfraStore'
import { PIPE_STEP_LABEL, PIPE_STEP_TONE } from '../state/types'

export function PipelinesPage() {
  const { state, startPipeline, pipelineGate, pipelinePublish, pipelineRerunEval } =
    useAiInfra()

  const revisions = useMemo(
    () =>
      state.models.flatMap((m) =>
        m.revisions.map((r) => ({
          id: r.id,
          label: `${m.name} · ${r.version}（${r.stage}）`,
          stage: r.stage,
        })),
      ),
    [state.models],
  )
  const defaultRevisionId =
    revisions.find((r) => r.stage !== 'prod')?.id ?? revisions[0]?.id ?? ''
  const defaultEndpointId = state.endpoints[0]?.id ?? ''

  const [targets, setTargets] = useState<Record<string, { revisionId: string; endpointId: string }>>(
    {},
  )

  function targetOf(runId: string) {
    return (
      targets[runId] ?? {
        revisionId: defaultRevisionId,
        endpointId: defaultEndpointId,
      }
    )
  }

  return (
    <div>
      <PageHeader
        eyebrow="训推门禁"
        title="训练 → 评测门禁 → 发布"
        desc="启动后训练步自动推进；评测门禁需显式 Pass/Fail。Fail 阻断；Pass 后发布会晋级所选 revision 一级并挂到端点（内存副作用，非真流量）。"
      />

      <Card className="mb-4 border-amber-200 bg-amber-50/80">
        <p className="text-xs leading-relaxed text-amber-950/90">
          模板示意算法与平台协作门禁。发布只改内存 stage / endpoint.modelRevisionId，不落真实
          Release、不切真流量。
        </p>
        <Button className="mt-3" onClick={() => startPipeline()}>
          启动新跑次
        </Button>
      </Card>

      {state.pipelineRuns.length === 0 ? (
        <Card>
          <p className="text-sm text-slate-600">尚无跑次。点「启动新跑次」开始闭环。</p>
        </Card>
      ) : null}

      <div className="space-y-4">
        {state.pipelineRuns.map((run) => {
          const evalStep = run.steps.find((s) => s.key === 'eval')
          const canPublish = evalStep?.status === 'succeeded' && !run.finished
          const atGate = run.blockedAtGate && evalStep?.status === 'blocked'
          const evalFailed = evalStep?.status === 'failed'
          const t = targetOf(run.id)
          const preview = canPublish
            ? previewPipelinePublish(state, t.revisionId || undefined, t.endpointId || undefined)
            : null
          return (
            <Card key={run.id}>
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-medium text-slate-900">{run.template}</p>
                  <p className="font-mono text-xs text-slate-500">{run.id}</p>
                </div>
                <StatusPill tone={run.finished ? (evalFailed ? 'down' : 'ok') : 'info'}>
                  {run.finished ? (evalFailed ? '已终止' : '已完成') : '进行中'}
                </StatusPill>
              </div>
              <ol className="grid gap-2 sm:grid-cols-3">
                {run.steps.map((step, i) => (
                  <li key={step.id} className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                    <p className="text-xs text-slate-500">
                      {i + 1} / {run.steps.length}
                    </p>
                    <p className="mt-1 text-sm font-medium text-slate-900">{step.label}</p>
                    <div className="mt-2">
                      <StatusPill tone={PIPE_STEP_TONE[step.status]}>
                        {PIPE_STEP_LABEL[step.status]}
                      </StatusPill>
                    </div>
                  </li>
                ))}
              </ol>
              {canPublish ? (
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  <label className="block text-xs text-slate-600">
                    发布目标 revision
                    <select
                      className="mt-1 w-full rounded-md border border-slate-200 px-2 py-1.5 text-sm"
                      value={t.revisionId}
                      onChange={(e) =>
                        setTargets((prev) => ({
                          ...prev,
                          [run.id]: { ...t, revisionId: e.target.value },
                        }))
                      }
                    >
                      {revisions.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="block text-xs text-slate-600">
                    挂到端点
                    <select
                      className="mt-1 w-full rounded-md border border-slate-200 px-2 py-1.5 text-sm"
                      value={t.endpointId}
                      onChange={(e) =>
                        setTargets((prev) => ({
                          ...prev,
                          [run.id]: { ...t, endpointId: e.target.value },
                        }))
                      }
                    >
                      {state.endpoints.length === 0 ? (
                        <option value="">（将新建样机端点）</option>
                      ) : (
                        state.endpoints.map((ep) => (
                          <option key={ep.id} value={ep.id}>
                            {ep.name}
                          </option>
                        ))
                      )}
                    </select>
                  </label>
                </div>
              ) : null}
              {preview ? (
                <p className="mt-2 text-xs leading-relaxed text-slate-600">{preview}</p>
              ) : null}
              {run.publishEffect ? (
                <p className="mt-2 rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-xs leading-relaxed text-emerald-900">
                  {run.publishEffect.note}
                </p>
              ) : null}
              <div className="mt-3 flex flex-wrap gap-2">
                {atGate ? (
                  <>
                    <Button variant="success" onClick={() => pipelineGate(run.id, true)}>
                      评测 Pass
                    </Button>
                    <Button
                      variant="danger"
                      className="!bg-rose-700 !text-white hover:!bg-rose-600"
                      onClick={() => pipelineGate(run.id, false)}
                    >
                      评测 Fail
                    </Button>
                  </>
                ) : null}
                {canPublish ? (
                  <Button
                    onClick={() =>
                      pipelinePublish(run.id, {
                        revisionId: t.revisionId || undefined,
                        endpointId: t.endpointId || undefined,
                      })
                    }
                  >
                    发布
                  </Button>
                ) : null}
                {evalFailed ? (
                  <Button variant="secondary" onClick={() => pipelineRerunEval(run.id)}>
                    重跑评测
                  </Button>
                ) : null}
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
