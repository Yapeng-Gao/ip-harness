import { useMemo, useState } from 'react'
import { Card, EmptyState, ExtLink, PageHeader, StatusPill, Toast } from '../components/ui'
import {
  CHANNEL_META,
  filterLogs,
  LOG_ROWS,
  type LogChannel,
  type LogLevel,
  type TimeRange,
} from '../data/mockLogs'
import { midCaseUrl } from '../lib/links'

const TABS: LogChannel[] = ['app', 'audit', 'auth', 'agent']

const LEVEL_TONE: Record<LogLevel, 'info' | 'warn' | 'down'> = {
  info: 'info',
  warn: 'warn',
  error: 'down',
}

export function LogsPage() {
  const [channel, setChannel] = useState<LogChannel>('app')
  const [q, setQ] = useState('')
  const [level, setLevel] = useState<LogLevel | 'all'>('all')
  const [range, setRange] = useState<TimeRange>('24h')
  const [toast, setToast] = useState<string | null>(null)

  const rows = useMemo(
    () => filterLogs(LOG_ROWS, { channel, q, level, range }),
    [channel, q, level, range],
  )

  function onExport() {
    setToast('样机不落真实导出')
    window.setTimeout(() => setToast(null), 2200)
  }

  const meta = CHANNEL_META[channel]

  return (
    <div>
      <PageHeader
        eyebrow="日志"
        title="日志平台"
        desc="检索与过滤仅作用于本地 mock 行。无采集、无索引、无落盘。"
      />

      <div className="mb-4 flex flex-wrap gap-1 rounded-xl bg-slate-100 p-1" role="tablist" aria-label="日志分区">
        {TABS.map((id) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={channel === id}
            onClick={() => setChannel(id)}
            className={`btn-press flex-1 rounded-lg px-3 py-2 text-sm font-medium sm:flex-none ${
              channel === id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {CHANNEL_META[id].title}
          </button>
        ))}
      </div>

      <Card className="mb-4">
        <p className="text-xs text-slate-500">{meta.hint}</p>
        <div className="mt-3 flex flex-wrap items-end gap-3">
          <label className="min-w-[12rem] flex-1 text-xs text-slate-500">
            检索
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="服务 / 文案 / 案号"
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-400"
            />
          </label>
          <label className="text-xs text-slate-500">
            级别
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value as LogLevel | 'all')}
              className="mt-1 block rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
            >
              <option value="all">全部</option>
              <option value="info">info</option>
              <option value="warn">warn</option>
              <option value="error">error</option>
            </select>
          </label>
          <label className="text-xs text-slate-500">
            时间
            <select
              value={range}
              onChange={(e) => setRange(e.target.value as TimeRange)}
              className="mt-1 block rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
            >
              <option value="1h">近 1 小时</option>
              <option value="24h">近 24 小时</option>
              <option value="7d">近 7 天</option>
            </select>
          </label>
          <button
            type="button"
            onClick={onExport}
            className="btn-press rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 hover:bg-slate-50"
          >
            导出
          </button>
        </div>
      </Card>

      {rows.length === 0 ? (
        <EmptyState
          title="当前过滤无匹配 mock 行"
          body="样机无真实采集管道。放宽级别 / 时间或清空检索后仍可能为空——这是诚实空态，不是故障。"
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-rest">
          <table className="w-full min-w-[40rem] text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs text-slate-500">
              <tr>
                <th className="px-3 py-2 font-medium">时间</th>
                <th className="px-3 py-2 font-medium">级别</th>
                <th className="px-3 py-2 font-medium">服务</th>
                <th className="px-3 py-2 font-medium">内容</th>
                <th className="px-3 py-2 font-medium">案详审计</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-slate-100 last:border-0">
                  <td className="px-3 py-2 font-mono text-xs tabular-nums text-slate-600">
                    {r.at.replace('+08:00', '')}
                  </td>
                  <td className="px-3 py-2">
                    <StatusPill tone={LEVEL_TONE[r.level]}>{r.level}</StatusPill>
                  </td>
                  <td className="px-3 py-2 text-slate-700">{r.service}</td>
                  <td className="px-3 py-2 text-slate-800">
                    {r.message}
                    {r.extra ? (
                      <span className="ml-2 font-mono text-xs text-slate-400">{r.extra}</span>
                    ) : null}
                  </td>
                  <td className="px-3 py-2">
                    {r.caseId ? (
                      <ExtLink href={midCaseUrl(r.caseId)}>
                        /cases/{r.caseId}
                      </ExtLink>
                    ) : (
                      <span className="text-xs text-slate-400">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="mt-3 text-xs text-slate-500">
        案详审计深链：中台 <code className="font-mono">/cases/:id?tab=audit</code>
        （中台同步就绪后可用）。示例：{' '}
        <ExtLink href={midCaseUrl('c1')}>{midCaseUrl('c1')}</ExtLink>
      </p>

      {toast ? <Toast message={toast} /> : null}
    </div>
  )
}
