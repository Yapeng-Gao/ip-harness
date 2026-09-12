export interface MockInboxItem {
  id: string
  caseId: string
  title: string
  kind: string
  due: string
  risk: string
  personas: string[]
}

export const SEED_INBOX: MockInboxItem[] = [
  {
    id: 't1',
    caseId: 'c2',
    title: '固态电池电解质配方 · 调研结论提交',
    kind: 'research_submit',
    due: '2026-09-20',
    risk: '高',
    personas: ['agency', 'enterprise_ip'],
  },
  {
    id: 't2',
    caseId: 'c5',
    title: '自动驾驶场景仿真 · 立项评审',
    kind: 'intake_review',
    due: '2026-09-16',
    risk: '高',
    personas: ['enterprise_ip'],
  },
  {
    id: 't3',
    caseId: 'c4',
    title: '低功耗蓝牙 Mesh · 权利要求定稿',
    kind: 'draft_claims',
    due: '2026-09-18',
    risk: '中',
    personas: ['agency'],
  },
  {
    id: 't4',
    caseId: 'c1',
    title: '边缘计算节点调度 · OA 答复',
    kind: 'prosecution',
    due: '2026-09-28',
    risk: '高',
    personas: ['agency', 'enterprise_ip'],
  },
]
