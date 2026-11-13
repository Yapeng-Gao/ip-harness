import type { StatusTone } from '../components/ui'

export type SourceCard = {
  id: string
  name: string
  kind: string
  status: string
  tone: StatusTone
  note: string
}

export const SOURCES: SourceCard[] = [
  {
    id: 'src-oss',
    name: '公开语料镜像（示意）',
    kind: '对象存储路径',
    status: '已登记',
    tone: 'ok',
    note: '无真 bucket · 刷新即失',
  },
  {
    id: 'src-export',
    name: '办案脱敏导出接入',
    kind: '导出单管道',
    status: '待配置',
    tone: 'empty',
    note: '仅收脱敏产物 · 禁案正文',
  },
]

export const SOURCES_EMPTY = {
  title: '私有爬虫源 · 未接入',
  body: '空态示意：样机不接真爬虫、不拉真网络。',
} as const
