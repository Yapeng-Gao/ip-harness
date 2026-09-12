import type { StatusTone } from '../components/ui'

export type PipeRun = {
  id: string
  name: string
  stage: string
  progress: number
  status: string
  tone: StatusTone
  note: string
}

export type PipeStage = {
  id: string
  label: string
  status: string
  tone: StatusTone
  detail: string
}

export const PIPELINE_FLOW: PipeStage[] = [
  { id: 'ingest', label: '采集', status: '完成（示意）', tone: 'ok', detail: '假 IngestJob · 无 RawBlob 落盘' },
  { id: 'clean', label: '清洗', status: '进行中（假）', tone: 'warn', detail: '假 CleanJob · 无真 schema 引擎' },
  { id: 'dedup', label: '去重', status: '排队', tone: 'info', detail: '假 DedupRun · 无近重索引' },
  { id: 'publish', label: '发布', status: '未执行', tone: 'empty', detail: '不自动推 ai-infra Release' },
]

export const PIPELINE_RUNS: PipeRun[] = [
  {
    id: 'run-sft',
    name: 'sft-clean-sep',
    stage: '清洗',
    progress: 47,
    status: '运行中（假）',
    tone: 'ok',
    note: '假进度 · 无 Spark',
  },
  {
    id: 'run-pretrain',
    name: 'pretrain-ingest',
    stage: '采集',
    progress: 100,
    status: '完成（示意）',
    tone: 'ok',
    note: '假完成 · 无湖仓分区',
  },
  {
    id: 'run-eval',
    name: 'eval-publish',
    stage: '发布',
    progress: 12,
    status: '门禁中',
    tone: 'warn',
    note: '质量门示意 · 未写 Manifest',
  },
]

export const PIPELINE_NOTE =
  '采集→清洗→发布为假进度示意。样机无真 Spark / 湖仓，不落真实 DatasetVersion。'
