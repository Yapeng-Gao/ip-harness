/**
 * Slim case seed for api-mock — not full PatentCase.
 * Fields aligned with mid demo c1/c2 (+ a few extras for list).
 */
export interface MockCase {
  id: string
  title: string
  caseNo: string
  stage: string
  risk: string
  nextDeadline: string
  summary: string
  handoffNote?: string
}

export const SEED_CASES: MockCase[] = [
  {
    id: 'c1',
    title: '一种边缘计算节点调度方法',
    caseNo: 'CN202410328901.2',
    stage: 'prosecution',
    risk: '高',
    nextDeadline: '2026-09-28',
    summary: '基于负载预测与能耗约束的边缘节点动态调度算法，提升集群整体吞吐。',
    handoffNote: '代理撰写中',
  },
  {
    id: 'c2',
    title: '固态电池电解质配方',
    caseNo: 'ID-2026-0812',
    stage: 'pre_research',
    risk: '中',
    nextDeadline: '2026-09-20',
    summary: '硫化物固态电解质新型配方，兼顾离子电导率与界面稳定性。',
    handoffNote: '检索进行中',
  },
  {
    id: 'c3',
    title: '工业视觉缺陷检测系统',
    caseNo: 'ZL202210456788.1',
    stage: 'commercialization',
    risk: '低',
    nextDeadline: '2026-10-15',
    summary: '多光谱融合工业视觉检测方案，已获授权并推进产线许可落地。',
  },
  {
    id: 'c4',
    title: '低功耗蓝牙 Mesh 路由协议',
    caseNo: 'CN202310891234.5',
    stage: 'drafting',
    risk: '中',
    nextDeadline: '2026-09-18',
    summary: '面向大规模传感器网络的自适应 Mesh 路由，降低端到端延迟。',
  },
  {
    id: 'c5',
    title: '自动驾驶场景仿真数据增强方法',
    caseNo: 'ID-2026-0601',
    stage: 'decision',
    risk: '高',
    nextDeadline: '2026-09-16',
    summary: '基于物理约束的对抗式仿真数据增强，提升长尾场景覆盖率。',
  },
]
