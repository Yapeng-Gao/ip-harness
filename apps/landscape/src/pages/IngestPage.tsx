import { Link } from 'react-router-dom'
import { Button, Card, Chip, EmptyState, PageHeader } from '../components/ui'
import { graphCounts, runIngestTask, useLandscapeStore } from '../state/store'

export function IngestPage() {
  const { ingestTasks, ingestAppended } = useLandscapeStore()
  const counts = graphCounts()

  return (
    <div>
      <PageHeader
        eyebrow="入库示意"
        title="多源入库（假任务）"
        desc="可跑完并追加预置 Hit/边到内存图。计数变化可见。勿假装真爬取或已接通全球产业库。"
      />

      <Card className="mb-4 p-4">
        <h2 className="text-sm font-semibold text-slate-900">图计数（内存）</h2>
        <p className="mt-2 flex flex-wrap gap-3 text-xs text-slate-600">
          <span>
            节点 <strong className="tabular-nums">{counts.nodes}</strong>
          </span>
          <span>
            企业 <strong className="tabular-nums">{counts.orgs}</strong>
          </span>
          <span>
            边 <strong className="tabular-nums">{counts.edges}</strong>
          </span>
          <span>
            Hit <strong className="tabular-nums">{counts.hits}</strong>
          </span>
          <span>
            洞察 <strong className="tabular-nums">{counts.insights}</strong>
          </span>
        </p>
        <p className="mt-2 text-[11px] text-slate-400">
          边分类：part-org {counts.byType['part-org']} · org-competitor{' '}
          {counts.byType['org-competitor']} · part-hit {counts.byType['part-hit']} · node-insight{' '}
          {counts.byType['node-insight']} · org-standard {counts.byType['org-standard']}
          {ingestAppended ? ' · 已追加过预置包' : ' · 尚未追加'}
        </p>
      </Card>

      {ingestTasks.length === 0 ? (
        <EmptyState
          title="暂无入库任务"
          body="样机可预置一条假进度，或保持空态。本页不触发任何网络抓取。"
          action={
            <Link to="/">
              <Button variant="secondary">回域选择</Button>
            </Link>
          }
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
                  <div className="flex flex-wrap items-center gap-2">
                    <Chip
                      tone={t.status === 'running' ? 'warn' : t.status === 'done' ? 'ok' : 'mock'}
                    >
                      {t.status}
                    </Chip>
                    <Button
                      variant="primary"
                      disabled={t.status === 'running'}
                      onClick={() => runIngestTask(t.id)}
                    >
                      {t.status === 'done' ? '已完成' : t.status === 'running' ? '推进中…' : '跑假入库'}
                    </Button>
                  </div>
                </div>
                <div className="mt-3">
                  <div className="mb-1 flex justify-between text-[11px] text-slate-500">
                    <span>假进度</span>
                    <span className="tabular-nums">{t.progress}%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-[var(--color-accent)]/70"
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
        非目标：真持续爬取、真图数据库、改 APP_PORTS、开 landscape-api:5191。
      </p>
    </div>
  )
}
