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

const CARDS: LabCard[] = [
  {
    id: 'grok',
    version: 'V·Grok 复刻',
    badge: '当前默认',
    blurb: '自由 bot 侧栏 + 主聊，对齐 Grok Bot 心智。',
    href: '/agent',
    cta: '打开默认壳',
    icon: Bot,
  },
  {
    id: 'compose',
    version: 'V·旧 Composer',
    blurb: '单聊开始办理 — 兼容入口，非主心智。',
    href: '/agent/compose',
    cta: '进入 Composer',
    icon: PenLine,
  },
  {
    id: 'catalog',
    version: 'V·Catalog',
    blurb: 'Agent 目录：按阶段 / 档位挑选专家。',
    href: '/agent/agents',
    cta: '打开 Catalog',
    icon: LayoutGrid,
  },
  {
    id: 'sessions-hitl',
    version: 'V·会话+HITL',
    blurb: '会话列表与请你确认闸；深链直达 OA 样机闸口。',
    href: agentSessionPath('sess-oa-1', { focus: 'hitl' }),
    cta: '打开 HITL 样机',
    icon: History,
    secondary: { label: '会话列表', href: '/agent/sessions' },
  },
  {
    id: 'projects',
    version: 'V·项目·固定专家',
    blurb: '项目夹 + 固定专家轨；种子专利包可直接进。',
    href: '/agent/projects/proj-demo-patent',
    cta: '打开专利示范项',
    icon: FolderKanban,
    secondary: { label: '项目列表', href: '/agent/projects' },
  },
  {
    id: 'harness',
    version: 'V·Harness 说明',
    blurb: '编排 / 工具 / HITL / 业务写入 — 架构鸟瞰。',
    href: '/agent/harness',
    cta: '打开说明',
    icon: Library,
  },
]

/**
 * Prototype gallery — browse historical / alternate Agent shells without
 * changing the default `/agent` = Grok replica.
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
              各代活口原型一览。默认入口仍是{' '}
              <Link
                to="/agent"
                className="font-medium text-slate-800 underline-offset-2 hover:underline"
              >
                /agent · Grok 复刻
              </Link>
              ；此处仅作样机导航，不改主心智。
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
