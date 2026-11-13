import { Link } from 'react-router-dom'
import { CheckCircle2, Copy, Lock, Unlock } from 'lucide-react'
import { Button, Card, Chip, PageHeader, RiskDot } from '../components/ui'
import { ftoActions, useFtoStore } from '../state/store'

export function ReportPage() {
  const state = useFtoStore()
  const { features, hits, matrix, risk, report, projectName, projectId } = state
  const gate = ftoActions.canConfirm()
  const confirmed = report.status === 'confirmed'
  const draft = ftoActions.getReportDraft()
  const md = ftoActions.buildMarkdown()

  return (
    <div>
      <PageHeader
        eyebrow="⑤ 报告 Confirm"
        title="报告预览与 Confirm"
        desc="预览项目 / 特征 / 命中 / 矩阵摘要 / 风险 / 免责声明。Confirm 后只读；不调用 DomainCommand、不写 case-core。"
      />
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {!confirmed ? (
          <Button
            variant="success"
            disabled={!gate.ok}
            title={gate.reason}
            onClick={() => ftoActions.confirmReport()}
            className="inline-flex items-center gap-1"
          >
            <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
            Confirm
          </Button>
        ) : (
          <Button
            variant="secondary"
            onClick={() => ftoActions.reopenEdit()}
            className="inline-flex items-center gap-1"
          >
            <Unlock className="h-3.5 w-3.5" aria-hidden />
            重新打开编辑
          </Button>
        )}
        <Button
          variant="secondary"
          onClick={() => ftoActions.copyMarkdown()}
          className="inline-flex items-center gap-1"
        >
          <Copy className="h-3.5 w-3.5" aria-hidden />
          复制 Markdown
        </Button>
        {confirmed ? (
          <Chip tone="ok">
            <Lock className="mr-1 inline h-3 w-3" aria-hidden />
            confirmed 只读
          </Chip>
        ) : !gate.ok ? (
          <Chip tone="danger">无法 Confirm：{gate.reason}</Chip>
        ) : (
          <Chip tone="mock">draft · 可 Confirm</Chip>
        )}
        <div className="ml-auto">
          <Link to="/risk">
            <Button variant="secondary">← 风险</Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-4">
          <h2 className="text-sm font-semibold text-slate-900">预览</h2>
          <dl className="mt-3 space-y-2 text-sm">
            <div>
              <dt className="text-xs text-slate-500">项目</dt>
              <dd className="font-medium text-slate-900">{projectName}</dd>
              <dd className="font-mono text-xs text-slate-500">{projectId}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">特征摘要</dt>
              <dd className="text-slate-700">
                {features.length === 0
                  ? '（空）'
                  : features.map((f) => f.name).join('；')}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">命中列表</dt>
              <dd className="text-slate-700">
                <ul className="mt-1 list-inside list-disc text-xs">
                  {hits.map((h) => (
                    <li key={h.id}>
                      <code>{h.publicationNumber}</code> {h.title}
                    </li>
                  ))}
                </ul>
              </dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">矩阵摘要</dt>
              <dd className="text-slate-700">{draft.matrixSummary}</dd>
              <dd className="text-xs text-slate-400">单元格数 {matrix.cells.length}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">风险结论</dt>
              <dd className="mt-1">
                <RiskDot level={risk.overall} />
              </dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">免责声明</dt>
              <dd className="text-amber-800">{draft.disclaimer} · 样机 · 无真 FTO 引擎</dd>
            </div>
          </dl>
        </Card>

        <Card className="p-4">
          <h2 className="text-sm font-semibold text-slate-900">Markdown 草稿</h2>
          <pre className="mt-3 max-h-[28rem] overflow-auto rounded-lg bg-slate-50 p-3 text-[11px] leading-relaxed text-slate-700 whitespace-pre-wrap">
            {md}
          </pre>
        </Card>
      </div>
    </div>
  )
}
