import { Card, PageHeader, StatusPill } from '../components/ui'
import { useAiInfra } from '../state/AiInfraStore'
import { PIPE_STEP_LABEL, PIPE_STEP_TONE } from '../state/types'

export function PipelinesPage() {
  const { state, startPipeline, pipelineGate, pipelinePublish, pipelineRerunEval } = useAiInfra()

  return (
    <div>
      <PageHeader
        eyebrow="训推门禁"
        title="训练 → 评测门禁 → 发布"
        desc="启动后训练步自动推进；评测门禁需显式 Pass/Fail。Fail 阻断；Pass 后才可点发布。非办案 HITL。"
      />

      <Card className="mb-4 border-amber-200 bg-amber-50/80">
        <p className="text-xs leading-relaxed text-amber-950/90">
          模板示意算法与平台协作门禁。样机不替代算法责任，不落真实 Release。
        </p>
        <button
          type="button"
          className="btn-press mt-3 rounded-md bg-slate-900 px-3 py-1.5 text-xs font-medium text-white"
          onClick={() => startPipeline()}
        >
          启动新跑次
        </button>
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
              <div className="mt-3 flex flex-wrap gap-2">
                {atGate ? (
                  <>
                    <button
                      type="button"
                      className="btn-press rounded-md bg-emerald-700 px-3 py-1.5 text-xs font-medium text-white"
                      onClick={() => pipelineGate(run.id, true)}
                    >
                      评测 Pass
                    </button>
                    <button
                      type="button"
                      className="btn-press rounded-md bg-rose-700 px-3 py-1.5 text-xs font-medium text-white"
                      onClick={() => pipelineGate(run.id, false)}
                    >
                      评测 Fail
                    </button>
                  </>
                ) : null}
                {canPublish ? (
                  <button
                    type="button"
                    className="btn-press rounded-md bg-slate-900 px-3 py-1.5 text-xs font-medium text-white"
                    onClick={() => pipelinePublish(run.id)}
                  >
                    发布
                  </button>
                ) : null}
                {evalFailed ? (
                  <button
                    type="button"
                    className="btn-press rounded-md border border-slate-200 px-3 py-1.5 text-xs hover:bg-slate-50"
                    onClick={() => pipelineRerunEval(run.id)}
                  >
                    重跑评测
                  </button>
                ) : null}
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
