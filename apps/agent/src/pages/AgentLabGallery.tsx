import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Bot,
  FolderKanban,
  Library,
  PenLine,
  ArrowRight,
  Sparkles,
} from 'lucide-react'
import { SoftEmpty } from '../components/soft/SoftEmpty'

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

/** 旁路展品 · 不重复卖主链案盘/编制/待确认为大卡片 */
const BYPASS_CARDS: LabCard[] = [
  {
    id: 'seats',
    version: '旁路 · 席位样机目录',
    badge: '样机',
    blurb: '席位样机与回流故事线；非一期进门，请从公司案办理。',
    href: '/agent/seats',
    cta: '打开席位目录',
    icon: Sparkles,
  },
  {
    id: 'warmup',
    version: '旁路 · 沙盒 / 多助手',
    blurb: '沙盒单助手与多助手互传；非一期主办理，可跳过。',
    href: '/agent/sandbox',
    cta: '打开沙盒',
    icon: PenLine,
    secondary: { label: '多助手壳', href: '/agent/team' },
  },
  {
    id: 'drill',
    version: '旁路 · 席位演练',
    badge: '非冷启动',
    blurb: '总控分簇调度示意；须显式进入，不抢公司简模式。',
    href: '/agent/cases/case-biz-edge-scheduler?drill=1&seat=orchestrator',
    cta: '打开席位演练',
    icon: Bot,
  },
  {
    id: 'l3',
    version: '旁路 · 遗留项目夹',
    blurb: '遗留专班项目夹示意；主路径仍是大厅→公司→部台。',
    href: '/agent/projects',
    cta: '打开项目夹列表',
    icon: FolderKanban,
    secondary: { label: '示范项目', href: '/agent/projects/proj-demo-patent' },
  },
  {
    id: 'harness',
    version: '纸面 · 运行说明',
    badge: '纸面',
    blurb: '调度/工具/确认/存稿鸟瞰 · 不作业交卷；请回大厅办理。',
    href: '/agent/harness',
    cta: '打开纸面说明',
    icon: Library,
  },
]

/** 主链入口 · 收折文字链，避免与展廊大卡职责叠 */
const MAIN_SHORTCUTS: { id: string; label: string; href: string }[] = [
  { id: 'hall', label: '大厅', href: '/agent' },
  { id: 'cases', label: '案盘', href: '/agent/cases' },
  { id: 'pending', label: '待我确认', href: '/agent/pending' },
  { id: 'departments', label: '部门管理', href: '/agent/departments' },
  { id: 'assets', label: '资产库', href: '/agent/assets' },
]

/**
 * 实验室展廊 · 旁路样机卡 + 主链入口收折（非冷启动 / 不可作业交卷）。
 */
export function AgentLabGallery() {
  const [q, setQ] = useState('')
  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase()
    if (!needle) return BYPASS_CARDS
    return BYPASS_CARDS.filter((c) => {
      const hay = `${c.version} ${c.blurb} ${c.cta} ${c.badge ?? ''} ${c.id}`.toLowerCase()
      return hay.includes(needle)
    })
  }, [q])
  const filtering = q.trim().length > 0

  return (
    <div
      className="flex flex-1 flex-col overflow-y-auto"
      data-testid="agent-lab-gallery"
      data-lab-nonprimary="1"
      data-lab-no-work="1"
    >
      <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6">
        <div className="mb-5 flex items-start gap-3">
          <span
            className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-slate-900 text-white"
            aria-hidden
          >
            <Sparkles className="h-4 w-4" strokeWidth={2} />
          </span>
          <div className="min-w-0 flex-1">
            <h1 className="text-lg font-semibold tracking-tight text-slate-900">
              实验室 · 示意展廊
            </h1>
            <p className="mt-1 text-sm leading-relaxed text-slate-600">
              只陈列旁路样机；案盘/编制/待确认不放大卡抢主链。办主链请回{' '}
              <Link
                to="/agent"
                className="font-medium text-slate-800 underline-offset-2 hover:underline"
              >
                大厅
              </Link>
              {' '}或{' '}
              <Link
                to="/agent/cases"
                className="font-medium text-slate-800 underline-offset-2 hover:underline"
              >
                案盘
              </Link>
              。
            </p>
          </div>
        </div>

        <div className="mb-4">
          <label className="sr-only" htmlFor="agent-lab-search">
            搜索展品
          </label>
          <input
            id="agent-lab-search"
            data-testid="agent-lab-search"
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="找幕次或展品…"
            className="ui-input ui-input-sm focus-ring w-full max-w-sm"
          />
        </div>

        <details
          className="mb-4 rounded-lg border border-dashed border-slate-200 bg-slate-50/60 px-3 py-2"
          data-testid="agent-lab-main-fold"
        >
          <summary className="cursor-pointer select-none text-[12px] font-medium text-slate-600">
            主链入口（请优先进大厅 · 非展品大卡）
          </summary>
          <ul className="mt-2 flex flex-wrap gap-2" data-testid="agent-lab-main-shortcuts">
            {MAIN_SHORTCUTS.map((s) => (
              <li key={s.id}>
                <Link
                  to={s.href}
                  className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-700 hover:border-slate-300"
                  data-testid={`agent-lab-main-${s.id}`}
                >
                  {s.label}
                </Link>
              </li>
            ))}
          </ul>
        </details>

        {filtered.length === 0 ? (
          <SoftEmpty
            kind={filtering ? 'lab-filter' : 'lab-empty'}
            testId="agent-lab-empty"
            action={
              <div className="flex flex-wrap justify-center gap-2">
                {filtering ? (
                  <button
                    type="button"
                    className="ui-btn ui-btn-sm ui-btn-primary btn-press focus-ring"
                    data-testid="agent-lab-empty-clear"
                    onClick={() => setQ('')}
                  >
                    清除搜索
                  </button>
                ) : null}
                <Link
                  to="/agent"
                  className="ui-btn ui-btn-sm ui-btn-secondary btn-press focus-ring"
                  data-testid="agent-lab-empty-to-hall"
                >
                  回大厅
                </Link>
                <Link
                  to="/agent/cases"
                  className="ui-btn ui-btn-sm ui-btn-secondary btn-press focus-ring"
                  data-testid="agent-lab-empty-to-cases"
                >
                  去案盘
                </Link>
              </div>
            }
          />
        ) : (
          <ul
            className="grid gap-3 sm:grid-cols-2"
            aria-label="原型卡片"
            data-testid="agent-lab-cards"
          >
            {filtered.map((card) => {
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
        )}
      </div>
    </div>
  )
}
