import type { StatusTone } from '../components/ui'

export type RecipeCard = {
  id: string
  name: string
  kind: '预训练' | 'SFT' | '偏好' | '评测'
  mix: string
  tone: StatusTone
  note: string
}

export const RECIPES: RecipeCard[] = [
  {
    id: 'rcp-pretrain',
    name: 'pretrain-default',
    kind: '预训练',
    mix: '公开 70% · 脱敏导出 20% · 合成 10%（假）',
    tone: 'ok',
    note: 'SamplePlan 示意 · 不改生产流量',
  },
  {
    id: 'rcp-sft',
    name: 'sft-claims',
    kind: 'SFT',
    mix: '难例 40% · 常规 60%（假）',
    tone: 'ok',
    note: '分层采样卡片 · 无真挖掘',
  },
  {
    id: 'rcp-pref',
    name: 'pref-dpo-v0',
    kind: '偏好',
    mix: '成对偏好 100%（假）',
    tone: 'info',
    note: 'RLHF/DPO 形状 · 无真标注平台',
  },
  {
    id: 'rcp-eval',
    name: 'eval-gate',
    kind: '评测',
    mix: '硬例 50% · 回归 50%（假）',
    tone: 'warn',
    note: '评测配方 · 不自动改 case handoff',
  },
]
