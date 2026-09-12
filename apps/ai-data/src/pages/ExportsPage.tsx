import {
  approveExport,
  completeExport,
  createCandidateFromExport,
  requestExport,
  useAiDataStore,
} from '../state/store'
import { Button, Card, EmptyState, PageHeader, StatusPill } from '../components/ui'
import type { ExportStatus } from '../state/types'
import type { StatusTone } from '../components/ui'

const TONE: Record<ExportStatus, StatusTone> = {
  requested: 'warn',
  approved: 'info',
  done: 'ok',
}

export function ExportsPage() {
  const { exports: orders } = useAiDataStore()

  return (
    <div>
      <PageHeader
        eyebrow="脱敏导出"
        title="导出单"
        desc="申请→审批→完成；完成后可「生成候选数据集」进 datasets。无案正文、无 PatentCase。"
      />

      <div className="mb-4">
        <Button onClick={() => requestExport()}>申请导出单</Button>
      </div>

      <div className="mb-4 space-y-3">
        {orders.map((o) => (
          <Card key={o.id}>
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="text-sm font-medium text-slate-900">{o.title}</p>
                <p className="mt-1 text-xs text-slate-500">
                  {o.from} · 申请 {o.requested}
                </p>
              </div>
              <StatusPill tone={TONE[o.status]}>{o.status}</StatusPill>
            </div>
            <p className="mt-3 text-xs text-slate-500">{o.note}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {o.status === 'requested' ? (
                <Button variant="secondary" onClick={() => approveExport(o.id)}>
                  审批
                </Button>
              ) : null}
              {o.status === 'approved' ? (
                <Button variant="secondary" onClick={() => completeExport(o.id)}>
                  完成
                </Button>
              ) : null}
              {o.status === 'done' ? (
                <Button
                  disabled={Boolean(o.candidateDatasetId)}
                  onClick={() => createCandidateFromExport(o.id)}
                >
                  {o.candidateDatasetId
                    ? `已生成 ${o.candidateDatasetId}`
                    : '生成候选数据集'}
                </Button>
              ) : null}
            </div>
          </Card>
        ))}
      </div>

      {orders.length === 0 ? (
        <EmptyState
          title="无导出单"
          body="点「申请导出单」创建 requested 状态。"
          action={
            <Button variant="secondary" onClick={() => requestExport()}>
              去申请导出单
            </Button>
          }
        />
      ) : (
        <EmptyState
          title="无案正文"
          body="样机只展示导出单状态机；不读取案卷、不落湖、不写 PatentCase。"
        />
      )}
    </div>
  )
}
