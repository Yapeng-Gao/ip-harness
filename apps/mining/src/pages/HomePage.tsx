import { Link } from 'react-router-dom'
import { ArrowRight, Beaker } from 'lucide-react'
import { Button, Card, Chip, PageHeader } from '../components/ui'
import { useMiningStore } from '../state/store'

export function HomePage() {
  const { project, candidates, intents, disclosure } = useMiningStore()
  const relatedCount = disclosure.relatedHitIds.length

  return (
    <div>
      <PageHeader
        eyebrow="入口"
        title="专利挖掘样机项目"
        desc="选择默认样机项目进入四步向导：交底 → 候选发明点 → 评分 → 送立项/撰写占位。全内存 mock，刷新即失；不写立案库。"
      />
      <Card className="p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Beaker className="h-5 w-5 text-violet-600" aria-hidden />
              <h2 className="text-base font-semibold text-slate-900">{project.name}</h2>
              <Chip tone="mock">样机</Chip>
            </div>
            <p className="mt-2 text-xs text-slate-500">
              ID <code>{project.id}</code> · 候选 {candidates.length} · 送出事件{' '}
              {intents.length} · 关联 Hit {relatedCount}
            </p>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-600">
              演示固态电池交底拆解为发明点卡片、示意打分后送立项/撰写占位。无真挖掘引擎，送出仅写内存
              intents[]，禁用「已创建案件」文案。
            </p>
          </div>
          <Link to="/disclosure">
            <Button className="inline-flex items-center gap-1.5">
              进入交底
              <ArrowRight className="h-3.5 w-3.5" aria-hidden />
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  )
}
