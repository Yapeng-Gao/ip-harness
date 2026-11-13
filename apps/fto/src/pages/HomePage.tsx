import { Link } from 'react-router-dom'
import { ArrowRight, Beaker } from 'lucide-react'
import { Button, Card, PageHeader, Chip } from '../components/ui'
import { useFtoStore } from '../state/store'

export function HomePage() {
  const { projectName, projectId, features, hits, report } = useFtoStore()
  return (
    <div>
      <PageHeader
        eyebrow="入口"
        title="FTO 样机项目"
        desc="选择默认样机项目进入五步向导：特征 → 命中 → 矩阵 → 风险 → 报告 Confirm。全内存 mock，刷新即失。"
      />
      <Card className="p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Beaker className="h-5 w-5 text-amber-700" aria-hidden />
              <h2 className="text-base font-semibold text-slate-900">{projectName}</h2>
              <Chip tone="mock">样机</Chip>
              <Chip tone={report.status === 'confirmed' ? 'ok' : 'neutral'}>
                {report.status}
              </Chip>
            </div>
            <p className="mt-2 text-xs text-slate-500">
              ID <code>{projectId}</code> · 特征 {features.length} · 命中 {hits.length}
            </p>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-600">
              演示固态电池电芯相关特征与 Search 种子公开号交集文献的假比对流程。无真 FTO
              引擎，Confirm 不写 case-core。
            </p>
          </div>
          <Link to="/features">
            <Button className="inline-flex items-center gap-1.5">
              进入特征表
              <ArrowRight className="h-3.5 w-3.5" aria-hidden />
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  )
}
