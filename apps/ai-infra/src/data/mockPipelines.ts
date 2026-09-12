import type { StatusTone } from '../components/ui'

export type PipeStep = {
  id: string
  label: string
  status: string
  tone: StatusTone
  detail: string
}

export const PIPELINE_TEMPLATE: PipeStep[] = [
  { id: 's1', label: '训练', status: '完成（示意）', tone: 'ok', detail: 'train-cls-v3 假作业' },
  { id: 's2', label: '评测门槛', status: '通过（假指标）', tone: 'ok', detail: 'F1 ≥ 0.80 · 本地数字' },
  { id: 's3', label: '人工审批', status: '待签', tone: 'warn', detail: '不接 HITL Confirm / DomainCommand' },
  { id: 's4', label: '发布', status: '未执行', tone: 'empty', detail: '不自动改 case handoff' },
  { id: 's5', label: '观察窗', status: '未开始', tone: 'empty', detail: '无真 SLO 探针' },
]

export const PIPELINE_NOTE =
  '训练→评测→发布为门禁模板示意。样机不替代算法团队责任，不落真实 Release。'
