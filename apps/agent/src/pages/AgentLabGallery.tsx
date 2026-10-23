import { Link } from 'react-router-dom'
import {
  Bot,
  FolderKanban,
  History,
  LayoutGrid,
  Library,
  PenLine,
  ArrowRight,
  Sparkles,
  Briefcase,
} from 'lucide-react'
import { agentSessionPath } from '../lib/deepLinks'

type LabCard = {
  id: string
  version: string
  blurb: string
  href: string
  cta: string
  icon: typeof Bot
  badge?: string
  secondary?: { label: string; href: string }
}

/** 幕次导航 · agent-depth-reliability / pairing playbook（对齐业务冷启动） */
const CARDS: LabCard[] = [
  {
    id: 'home',
    version: '幕 1 · 多案流水',
    badge: '默认冷启动',
    blurb: '代理人默认首页：案表（当前部门 / 待确认）→ 点行进公司首页；开新案子短路径。',
    href: '/agent/cases',
    cta: '打开多案流水',
    icon: Briefcase,
    secondary: { label: '开新案子', href: '/agent/cases/new' },
  },
  {
    id: 'departments',
    version: '幕 2 · 组织编制',
    badge: '配置',
    blurb: '全库编制旁路（七部作业请进案子公司首页）。常设部门与专家 skill。',
    href: '/agent/departments',
    cta: '打开组织编制',
    icon: LayoutGrid,
  },
  {
    id: 'assets',
    version: '幕 2b · 资产',
    blurb: '全局资料库：分类树 + 文件列表 + 挂项目 / 带到对话。',
    href: '/agent/assets',
    cta: '打开资产',
    icon: Library,
  },
  {
    id: 'warmup',
    version: '幕 0 · 能力预演',
    blurb: 'Solo 单助手 + Team 多 bot 互传；非专利默认，可跳过。',
    href: '/agent/sandbox',
    cta: '打开沙盒',
    icon: PenLine,
    secondary: { label: '团队', href: '/agent/team' },
  },
  {
    id: 'drill',
    version: '旁路 · 演练全队',
    badge: '非冷启动',
    blurb: '总控 + 14 席分簇调度台。须显式进入；不抢业务简模式。',
    href: '/agent/cases/case-biz-edge-scheduler?drill=1&seat=orchestrator',
    cta: '打开演练全队',
    icon: Sparkles,
  },
  {
    id: 'l3',
    version: '幕 3 · 项目 / 群聊',
    blurb: '同一专家脑 + mid 映射 / room；壳差不是脑差。',
    href: '/agent/projects/proj-demo-patent',
    cta: '打开示范项目',
    icon: FolderKanban,
    secondary: { label: '项目列表', href: '/agent/projects' },
  },
  {
    id: 'hitl',
    version: '幕 4 · 确认铁律',
    blurb: '待确认或经典 HITL 会话：确认后才写库示意。',
    href: '/agent/pending',
    cta: '待我确认',
    icon: History,
    secondary: {
      label: 'HITL 样机',
      href: agentSessionPath('sess-oa-1', { focus: 'hitl' }),
    },
  },
  {
    id: 'team',
    version: '历史 · L2 团队',
    blurb: 'Grok 形多 bot；深度不在此层。',
    href: '/agent/team',
    cta: '打开团队',
    icon: Bot,
  },
  {
    id: 'harness',
    version: '说明 · Harness',
    blurb: '编排 / 工具 / HITL / 写入 — 纸面架构鸟瞰。',
    href: '/agent/harness',
    cta: '打开说明',
    icon: Library,
  },
]

/**
 * Prototype gallery — 五幕导航 + 历史壳（非冷启动）。
 */
export function AgentLabGallery() {
  return (
    <div
      className="flex flex-1 flex-col overflow-y-auto"
      data-testid="agent-lab-gallery"
    >
      <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6">
        <div className="mb-6 flex items-start gap-3">
          <span
            className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-slate-900 text-white"
            aria-hidden
          >
            <Sparkles className="h-4 w-4" strokeWidth={2} />
          </span>
          <div className="min-w-0">
            <h1 className="text-lg font-semibold tracking-tight text-slate-900">
              Agent 原型展廊
            </h1>
            <p className="mt-1 text-sm leading-relaxed text-slate-600">
              冷启动是{' '}
              <Link
                to="/agent/cases"
                className="font-medium text-slate-800 underline-offset-2 hover:underline"
              >
                /agent/cases · 多案流水（业务模式）
              </Link>
              ；下表按演示五幕排列，勿再把 L1 当作默认。
            </p>
          </div>
        </div>

        <ul
          className="grid gap-3 sm:grid-cols-2"
          aria-label="原型卡片"
          data-testid="agent-lab-cards"
        >
          {CARDS.map((card) => {
            const Icon = card.icon
            return (
              <li key={card.id}>
                <article
                  className="flex h-full flex-col rounded-[var(--radius-md)] border border-slate-200/90 bg-white p-4 shadow-[var(--shadow-rest)] transition-[box-shadow,border-color] hover:border-slate-300 hover:shadow-md"
                  data-testid={`agent-lab-card-${card.id}`}
                >
                  <div className="flex items-start gap-2.5">
                    <span
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-600"
                      aria-hidden
                    >
                      <Icon className="h-3.5 w-3.5" strokeWidth={1.75} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <h2 className="text-[14px] font-semibold text-slate-900">
                          {card.version}
                        </h2>
                        {card.badge && (
                          <span className="rounded-full bg-emerald-50 px-1.5 py-px text-[10px] font-semibold text-emerald-800 ring-1 ring-emerald-200/80">
                            {card.badge}
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-[13px] leading-snug text-slate-600">
                        {card.blurb}
                      </p>
                    </div>
                  </div>

                  <div className="mt-auto flex flex-wrap items-center gap-2 pt-3.5">
                    <Link
                      to={card.href}
                      className="btn-press focus-ring hit-40 inline-flex items-center gap-1.5 rounded-[var(--radius-md)] bg-slate-900 px-3 text-[12px] font-semibold text-white hover:bg-slate-800"
                      data-testid={`agent-lab-enter-${card.id}`}
                    >
                      {card.cta}
                      <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                    </Link>
                    {card.secondary && (
                      <Link
                        to={card.secondary.href}
                        className="focus-ring rounded px-1.5 py-1 text-[12px] font-medium text-slate-500 hover:text-slate-800"
                        data-testid={`agent-lab-secondary-${card.id}`}
                      >
                        {card.secondary.label}
                      </Link>
                    )}
                  </div>
                </article>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}
