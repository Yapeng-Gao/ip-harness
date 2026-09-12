import type { Agency } from '../types'

/** 示意数据 · 代理所市场（改编示意，非真实报价承诺） */
export const AGENCIES: Agency[] = [
  {
    id: 'ag1',
    name: '北京德恒知识产权代理有限公司',
    specialties: ['撰写申请', '审查答复', '立项前调研'],
    domains: ['云计算', '物联网', 'AI 基础设施'],
    priceRange: '代理费 ¥12,000 – ¥45,000 + 官费另计',
    rating: 4.8,
    activeCases: 14,
    blurb: '擅长软硬件交叉与网络协议类发明撰写与 OA 答复；官费代缴可托管。',
    capabilityTags: ['软硬交叉', '协议类发明', 'OA 争点拆解', '电子申请托管'],
    nodeStrengths: ['撰写申请', '审查答复', '立项前调研'],
    reviews: [
      { id: 'r1', by: '星河智造 · IP', rating: 5, comment: '边缘计算案一通答复策略清晰，期限无延误。', at: '2026-08-20', node: '审查答复' },
      { id: 'r2', by: '星河智造 · 云计算', rating: 4, comment: '交底结构化效率高，权利要求布局可再加强从属层次。', at: '2026-07-12', node: '撰写申请' },
    ],
  },
  {
    id: 'ag2',
    name: '金杜律师事务所（知识产权部）',
    specialties: ['运用转化', '监控预警', '授权维持'],
    domains: ['智能制造', '医疗器械', '显示器件'],
    priceRange: '代理费 ¥20,000 – ¥120,000 + 官费另计',
    rating: 4.9,
    activeCases: 8,
    blurb: '综合所，转化许可与诉讼维权经验丰富。',
    capabilityTags: ['许可谈判', '诉讼维权', '专利池顾问', '跨境尽调'],
    nodeStrengths: ['运用转化', '监控预警', '授权维持'],
    reviews: [
      { id: 'r1', by: '星河智造 · 智能制造', rating: 5, comment: '许可条款把关严谨，落地节奏可控。', at: '2026-09-01', node: '运用转化' },
      { id: 'r2', by: '星河智造 · IP', rating: 5, comment: '年费与证书变更流程顺畅。', at: '2026-05-18', node: '授权维持' },
    ],
  },
  {
    id: 'ag3',
    name: '中科专利商标代理有限公司',
    specialties: ['立项前调研', '立项决策', '撰写申请'],
    domains: ['新能源材料', '固态电池', '化工'],
    priceRange: '代理费 ¥8,000 – ¥32,000 + 官费另计',
    rating: 4.6,
    activeCases: 18,
    blurb: '材料化学与能源领域检索 / FTO 深度覆盖；对接商业专利库示意。',
    capabilityTags: ['FTO 深度', '材料化学检索', '新颖性初评', '商业库对接'],
    nodeStrengths: ['立项前调研', '立项决策', '撰写申请'],
    reviews: [
      { id: 'r1', by: '星河智造 · 新能源', rating: 5, comment: '固态电解质检索命中质量高，IPC 覆盖准。', at: '2026-09-03', node: '立项前调研' },
      { id: 'r2', by: '星河智造 · IP', rating: 4, comment: '报价透明，交期略紧但仍按时。', at: '2026-06-22', node: '撰写申请' },
    ],
  },
  {
    id: 'ag4',
    name: '京师华信专利代理事务所',
    specialties: ['审查答复', '撰写申请'],
    domains: ['自动驾驶', '计算机视觉', '机器人'],
    priceRange: '代理费 ¥10,000 – ¥40,000 + 官费另计',
    rating: 4.5,
    activeCases: 11,
    blurb: '智驾与视觉算法专利布局与争点策略见长。',
    capabilityTags: ['算法权利要求', '智驾场景', '争点策略', '多国布局建议'],
    nodeStrengths: ['审查答复', '撰写申请'],
    reviews: [
      { id: 'r1', by: '星河智造 · 物联网', rating: 4, comment: 'Mesh 路由独权层次清楚，实施例可再充实。', at: '2026-09-04', node: '撰写申请' },
      { id: 'r2', by: '星河智造 · 智驾', rating: 5, comment: 'OA 争点拆解专业，沟通响应快。', at: '2026-08-10', node: '审查答复' },
    ],
  },
  {
    id: 'ag5',
    name: '北京集佳知识产权代理有限公司',
    specialties: ['授权维持', '监控预警', 'PCT'],
    domains: ['全领域', '年费托管', '竞品监测'],
    priceRange: '年费代缴 ¥800 – ¥3,000/件·年 + 官费',
    rating: 4.4,
    activeCases: 26,
    blurb: '年费代缴与竞品公开监测订阅；PCT 进中国经验丰富。',
    capabilityTags: ['年费托管', 'PCT 进中国', '竞品公开监测', '批量提醒'],
    nodeStrengths: ['授权维持', '监控预警', 'PCT'],
    reviews: [
      { id: 'r1', by: '星河智造 · IP', rating: 4, comment: '年费提醒准时，批量台账清晰。', at: '2026-04-01', node: '授权维持' },
    ],
  },
  {
    id: 'ag6',
    name: '柳沈律师事务所',
    specialties: ['运用转化', '立项决策', '撰写申请'],
    domains: ['半导体', '通信', '跨境布局'],
    priceRange: '代理费 ¥15,000 – ¥80,000 + 官费另计',
    rating: 4.7,
    activeCases: 7,
    blurb: 'PCT / 多国布局与专利池合作顾问。',
    capabilityTags: ['PCT 策略', '专利池', '半导体布局', '跨境顾问'],
    nodeStrengths: ['运用转化', '立项决策', '撰写申请'],
    reviews: [
      { id: 'r1', by: '星河智造 · IP', rating: 5, comment: '多国布局建议可落地，费用口径清楚。', at: '2026-07-30', node: '立项决策' },
    ],
  },
  {
    id: 'ag7',
    name: '上海专利商标事务所有限公司',
    specialties: ['撰写申请', '审查答复', '无效宣告'],
    domains: ['生物医药', '化工', '机械'],
    priceRange: '代理费 ¥9,000 – ¥50,000 + 官费另计',
    rating: 4.6,
    activeCases: 16,
    blurb: '传统强所，生物与化工撰写答复稳健。',
    capabilityTags: ['生物医药撰写', '无效宣告', '化工实施例', '稳健答复'],
    nodeStrengths: ['撰写申请', '审查答复', '无效宣告'],
    reviews: [
      { id: 'r1', by: '外部评价（示意）', rating: 5, comment: '生物药案说明书齐套，审查员沟通顺畅。', at: '2026-05-15', node: '撰写申请' },
      { id: 'r2', by: '星河智造 · IP', rating: 4, comment: '无效检索扎实，策略偏稳健。', at: '2026-03-20', node: '无效宣告' },
    ],
  },
]

export function getAgency(id: string) {
  return AGENCIES.find((a) => a.id === id)
}
