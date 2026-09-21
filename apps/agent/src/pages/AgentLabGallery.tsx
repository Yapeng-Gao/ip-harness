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

/** 五幕导航 · agent-depth-reliability / pairing playbook（对齐业务冷启动） */
const CARDS: LabCard[] = [
  {
    id: 'biz',
    version: '幕 1 · 业务主线',
    badge: '默认冷启动',
    blurb: '开新活 → 席 bot（查新等已加深）→ 待我确认。对外演示主干。',
    href: '/agent',
    cta: '打开我的案子',
    icon: Briefcase,
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
    id: 'catalog',
    version: '幕 2 · 专家工作台',
    blurb: '默认 7 / 更多 / 全表；加席写回同一案。',
    href: '/agent/catalog',
    cta: '打开 Catalog',
    icon: LayoutGrid,
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
                to="/agent"
                className="font-medium text-slate-800 underline-offset-2 hover:underline"
              >
                /agent · 我的案子（业务模式）
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
