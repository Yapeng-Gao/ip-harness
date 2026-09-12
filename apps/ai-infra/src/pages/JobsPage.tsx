import { useMemo, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Card, PageHeader, ProgressBar, StatusPill } from '../components/ui'
import { useAiInfra } from '../state/AiInfraStore'
import {
  JOB_KIND_LABEL,
  JOB_STATUS_LABEL,
  JOB_STATUS_TONE,
  type JobKind,
} from '../state/types'

const QUEUES = ['algo-train', 'batch', 'infer'] as const

export function JobsPage() {
  const { jobId } = useParams()
  const nav = useNavigate()
  const api = useAiInfra()
  const { state, datasets, datasetSource, createJob, cancelJob, retryJob } = api

  const [kind, setKind] = useState<JobKind>('train')
  const [name, setName] = useState('')
  const [datasetVersionId, setDatasetVersionId] = useState(datasets[0]?.id ?? '')
  const [queue, setQueue] = useState<string>(QUEUES[0])
  const [priority, setPriority] = useState(5)
  const [forceFail, setForceFail] = useState(false)

  const selected = useMemo(
    () => state.jobs.find((j) => j.id === jobId) ?? null,
    [state.jobs, jobId],
  )

  const datasetLabel = (id: string) => {
    const d = datasets.find((x) => x.id === id)
    if (!d) return id
    const seedTag = datasetSource === 'seed' ? ' · 种子 · 非跨壳' : ''
    return `${d.name}@${d.version}${seedTag}`
  }

  function onCreate(e: FormEvent) {
    e.preventDefault()
    const ds = datasetVersionId || datasets[0]?.id
    if (!ds) return
    createJob({
      kind,
      name: name.trim() || `${kind}-${Date.now().toString(36).slice(-4)}`,
      datasetVersionId: ds,
      queue,
      priority,
      forceFail,
    })
    setName('')
    setForceFail(false)
  }

  return (
    <div>
      <PageHeader
        eyebrow="作业"
        title="训练 / 批推"
        desc="创建 → 排队 → 调度（非 drain 节点）→ 进度推进 → 成功/失败。取消与重试可点。假日志流，无真调度器。"
      />

      <Card className="mb-4">
        <p className="text-sm font-medium text-slate-900">新建作业</p>
        <p className="mt-1 text-xs text-slate-500">
          数据集优先读 localStorage 键{' '}
          <code className="font-mono">ip.harness.aiData.publishedDatasets</code>
          ；空/无效则用与 ai-data 对齐的共享种子。
          {datasetSource === 'seed' ? (
            <span className="ml-1 text-amber-700">当前：种子 · 非跨壳（5179≠5181 origin）</span>
          ) : (
            <span className="ml-1 text-emerald-700">当前：本 origin localStorage</span>
          )}
        </p>
        <form className="mt-3 grid gap-3 sm:grid-cols-2" onSubmit={onCreate}>
          <label className="block text-xs text-slate-600">
            类型
            <select
              className="mt-1 w-full rounded-md border border-slate-200 px-2 py-1.5 text-sm"
              value={kind}
              onChange={(e) => setKind(e.target.value as JobKind)}
            >
              <option value="train">训练</option>
              <option value="batch">批推</option>
            </select>
          </label>
          <label className="block text-xs text-slate-600">
            名称
            <input
              className="mt-1 w-full rounded-md border border-slate-200 px-2 py-1.5 text-sm"
              value={name}
              placeholder="含 fail 将强制失败"
              onChange={(e) => setName(e.target.value)}
            />
          </label>
          <label className="block text-xs text-slate-600 sm:col-span-2">
            数据集 version
            <select
              className="mt-1 w-full rounded-md border border-slate-200 px-2 py-1.5 text-sm"
              value={datasetVersionId || datasets[0]?.id || ''}
              onChange={(e) => setDatasetVersionId(e.target.value)}
            >
              {datasets.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}@{d.version}
                  {datasetSource === 'seed' ? '（种子 · 非跨壳）' : ''}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-xs text-slate-600">
            队列
            <select
              className="mt-1 w-full rounded-md border border-slate-200 px-2 py-1.5 text-sm"
              value={queue}
              onChange={(e) => setQueue(e.target.value)}
            >
              {QUEUES.map((q) => (
                <option key={q} value={q}>
                  {q}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-xs text-slate-600">
            优先级 (1–10)
            <input
              type="number"
              min={1}
              max={10}
              className="mt-1 w-full rounded-md border border-slate-200 px-2 py-1.5 text-sm"
              value={priority}
              onChange={(e) => setPriority(Number(e.target.value) || 1)}
            />
          </label>
          <label className="flex items-center gap-2 text-xs text-slate-700 sm:col-span-2">
            <input
              type="checkbox"
              checked={forceFail}
              onChange={(e) => setForceFail(e.target.checked)}
            />
            强制失败演示
          </label>
          <div className="sm:col-span-2">
            <button
              type="submit"
              className="btn-press rounded-md bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-800"
            >
              创建并入队
            </button>
          </div>
        </form>
      </Card>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-rest">
        <table className="w-full min-w-[52rem] text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs text-slate-500">
            <tr>
              <th className="px-3 py-2 font-medium">作业</th>
              <th className="px-3 py-2 font-medium">类型</th>
              <th className="px-3 py-2 font-medium">状态</th>
              <th className="px-3 py-2 font-medium">进度</th>
              <th className="px-3 py-2 font-medium">数据集</th>
              <th className="px-3 py-2 font-medium">动作</th>
            </tr>
          </thead>
          <tbody>
            {state.jobs.map((j) => (
              <tr
                key={j.id}
                className={`border-b border-slate-100 last:border-0 ${
                  jobId === j.id ? 'bg-[var(--color-accent-soft)]' : ''
                }`}
              >
                <td className="px-3 py-2">
                  <Link
                    to={`/jobs/${j.id}`}
                    className="font-medium text-slate-900 underline-offset-2 hover:underline"
                  >
                    {j.name}
                  </Link>
                  <p className="text-xs text-slate-500">
                    {j.queue} · p{j.priority}
                    {j.assignedNodeId ? ` · ${j.assignedNodeId}` : ''}
                  </p>
                </td>
                <td className="px-3 py-2">{JOB_KIND_LABEL[j.kind]}</td>
                <td className="px-3 py-2">
                  <StatusPill tone={JOB_STATUS_TONE[j.status]}>
                    {JOB_STATUS_LABEL[j.status]}
                  </StatusPill>
                </td>
                <td className="min-w-[9rem] px-3 py-2">
                  <ProgressBar value={j.progress} />
                </td>
                <td className="px-3 py-2 text-xs text-slate-600">{datasetLabel(j.datasetVersionId)}</td>
                <td className="px-3 py-2">
                  <div className="flex flex-wrap gap-1">
                    {(j.status === 'queued' || j.status === 'running') && (
                      <button
                        type="button"
                        className="btn-press rounded-md border border-slate-200 px-2 py-0.5 text-xs hover:bg-slate-50"
                        onClick={() => cancelJob(j.id)}
                      >
                        取消
                      </button>
                    )}
                    {j.status === 'failed' && (
                      <button
                        type="button"
                        className="btn-press rounded-md border border-slate-200 px-2 py-0.5 text-xs hover:bg-slate-50"
                        onClick={() => {
                          retryJob(j.id)
                          nav('/jobs')
                        }}
                      >
                        重试
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected ? (
        <Card className="mt-4">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-sm font-medium text-slate-900">详情 · {selected.name}</p>
              <p className="mt-0.5 font-mono text-xs text-slate-500">{selected.id}</p>
            </div>
            <StatusPill tone={JOB_STATUS_TONE[selected.status]}>
              {JOB_STATUS_LABEL[selected.status]}
            </StatusPill>
          </div>
          <ProgressBar value={selected.progress} label="进度" />
          <p className="mt-2 text-xs text-slate-500">
            数据集 {datasetLabel(selected.datasetVersionId)} · slots {selected.gpuSlots}
            {selected.forceFail ? ' · 强制失败' : ''}
          </p>
          <div className="mt-3 max-h-56 overflow-auto rounded-md bg-slate-950 px-3 py-2 font-mono text-[11px] leading-relaxed text-emerald-300">
            {selected.logs.length === 0 ? (
              <p className="text-slate-500">暂无日志</p>
            ) : (
              selected.logs.map((line, i) => <div key={`${i}-${line}`}>{line}</div>)
            )}
          </div>
        </Card>
      ) : null}
    </div>
  )
}
