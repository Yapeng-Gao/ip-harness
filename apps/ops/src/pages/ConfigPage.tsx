import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Card, PageHeader, StatusPill } from '../components/ui'
import {
  ENVIRONMENTS,
  FEATURE_FLAGS,
  LICENSE,
  OUTBOUND_JOBS,
  READONLY_ACCOUNTS,
  RUNBOOKS,
  SECRETS,
} from '../data/mockConfig'
import { AlertNotifyPanel } from './AlertNotifyPanel'

const JOB_TONE = {
  queued: 'info' as const,
  running: 'ok' as const,
  held: 'warn' as const,
}

export function ConfigPage() {
  const [flags, setFlags] = useState(() =>
    Object.fromEntries(FEATURE_FLAGS.map((f) => [f.id, f.on])),
  )
  const [openRunbook, setOpenRunbook] = useState<string | null>(RUNBOOKS[0]?.id ?? null)
  const location = useLocation()

  useEffect(() => {
    if (location.hash === '#alerts') {
      window.requestAnimationFrame(() => {
        document.getElementById('alerts')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      })
    }
  }, [location.hash])

  return (
    <div>
      <PageHeader
        eyebrow="配置"
        title="配置 / 密钥 / License / runbook"
        desc="开关只改本页内存。密钥已脱敏。不接密钥托管、不改办案闸门。通知渠道见下方「通知渠道」区块（#alerts）。"
      />

      <h2 className="mb-3 text-sm font-semibold text-slate-800">开关中心</h2>
      <Card>
        <ul className="divide-y divide-slate-100">
          {FEATURE_FLAGS.map((f) => (
            <li key={f.id} className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0">
              <div>
                <p className="text-sm text-slate-800">{f.label}</p>
                <p className="font-mono text-xs text-slate-400">{f.id}</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={flags[f.id]}
                onClick={() => setFlags((prev) => ({ ...prev, [f.id]: !prev[f.id] }))}
                className={`btn-press relative h-6 w-10 rounded-full ${flags[f.id] ? 'bg-slate-900' : 'bg-slate-300'}`}
              >
                <span
                  className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm"
                  style={{ left: flags[f.id] ? '1.15rem' : '0.125rem' }}
                />
              </button>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-slate-500">样机本地态 · 刷新即回默认 · 不写生产配置。</p>
      </Card>

      <div className="mt-8">
        <AlertNotifyPanel />
      </div>

      <div className="mt-6 grid gap-3 lg:grid-cols-2">
        <Card>
          <p className="text-sm font-medium text-slate-900">密钥 / 证书（脱敏）</p>
          <ul className="mt-3 space-y-2">
            {SECRETS.map((s) => (
              <li key={s.id} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                <div className="flex items-center justify-between gap-2 text-sm">
                  <span className="font-mono text-slate-800">{s.name}</span>
                  <StatusPill tone="empty">{s.kind}</StatusPill>
                </div>
                <p className="mt-1 font-mono text-xs text-slate-500">
                  {s.masked} · 轮换 {s.rotated}
                </p>
              </li>
            ))}
          </ul>
        </Card>
        <Card>
          <p className="text-sm font-medium text-slate-900">出站任务队列</p>
          <ul className="mt-3 space-y-2">
            {OUTBOUND_JOBS.map((j) => (
              <li key={j.id} className="flex items-center justify-between gap-2 text-sm">
                <span>
                  {j.name}
                  <span className="ml-2 text-xs text-slate-400">{j.env}</span>
                </span>
                <StatusPill tone={JOB_TONE[j.status]}>{j.status}</StatusPill>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-slate-500">无真实 worker。held = 演练占位。</p>
        </Card>
      </div>

      <div className="mt-6 grid gap-3 lg:grid-cols-2">
        <Card>
          <p className="text-sm font-medium text-slate-900">多环境</p>
          <ul className="mt-3 space-y-2">
            {ENVIRONMENTS.map((e) => (
              <li key={e.id} className="flex items-center justify-between text-sm">
                <span className="font-mono">{e.name}</span>
                <span className="text-xs text-slate-500">
                  {e.current ? '当前' : e.note}
                </span>
              </li>
            ))}
          </ul>
        </Card>
        <Card>
          <p className="text-sm font-medium text-slate-900">License 席位</p>
          <p className="mt-2 text-2xl font-semibold tabular-nums">
            {LICENSE.used}/{LICENSE.seats}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {LICENSE.plan} · {LICENSE.note}
          </p>
        </Card>
      </div>

      <h2 className="mt-8 mb-3 text-sm font-semibold text-slate-800">安全只读账号</h2>
      <Card>
        <ul className="divide-y divide-slate-100">
          {READONLY_ACCOUNTS.map((a) => (
            <li key={a.id} className="flex flex-wrap items-center justify-between gap-2 py-2 text-sm">
              <span className="font-mono text-slate-800">{a.name}</span>
              <span className="text-xs text-slate-500">
                {a.role} · {a.lastSeen}
              </span>
            </li>
          ))}
        </ul>
      </Card>

      <h2 className="mt-8 mb-3 text-sm font-semibold text-slate-800">Runbook</h2>
      <div className="space-y-2">
        {RUNBOOKS.map((rb) => {
          const open = openRunbook === rb.id
          return (
            <Card key={rb.id} className="p-0">
              <button
                type="button"
                aria-expanded={open}
                onClick={() => setOpenRunbook(open ? null : rb.id)}
                className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
              >
                <span>
                  <span className="text-sm font-medium text-slate-900">{rb.title}</span>
                  <span className="ml-2 text-xs text-slate-400">{rb.owner}</span>
                </span>
                <span className="text-xs text-slate-500">{open ? '收起' : '展开'}</span>
              </button>
              {open ? (
                <pre className="whitespace-pre-wrap border-t border-slate-100 px-4 py-3 text-xs leading-relaxed text-slate-600">
                  {rb.body}
                </pre>
              ) : null}
            </Card>
          )
        })}
      </div>
    </div>
  )
}
