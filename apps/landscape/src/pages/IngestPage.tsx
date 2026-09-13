import { Card, Chip, EmptyState, PageHeader } from '../components/ui'
import { useLandscapeStore } from '../state/store'

export function IngestPage() {
  const { ingestTasks } = useLandscapeStore()

  return (
    <div>
      <PageHeader
        eyebrow="入库示意"
        title="多源入库（假任务）"
        desc="仅示意进度条 / 空态。勿假装真爬取或已接通全球产业库。"
      />
      {ingestTasks.length === 0 ? (
        <EmptyState
          title="暂无入库任务"
          body="样机可预置一条假进度，或保持空态。本页不触发任何网络抓取。"
        />
      ) : (
        <ul className="space-y-3">
          {ingestTasks.map((t) => (
            <li key={t.id}>
              <Card className="p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h2 className="text-sm font-semibold text-slate-900">{t.source}</h2>
                    <p className="mt-1 text-xs text-slate-500">{t.note}</p>
                  </div>
                  <Chip tone={t.status === 'running' ? 'warn' : t.status === 'done' ? 'ok' : 'mock'}>
                    {t.status}
                  </Chip>
                </div>
                <div className="mt-3">
                  <div className="mb-1 flex justify-between text-[11px] text-slate-500">
                    <span>假进度</span>
                    <span className="tabular-nums">{t.progress}%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-violet-400/80"
                      style={{ width: `${t.progress}%` }}
                    />
                  </div>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}
      <p className="mt-4 text-xs text-slate-400">
        非目标：真持续爬取、真图数据库、改 APP_PORTS。
      </p>
    </div>
  )
}
