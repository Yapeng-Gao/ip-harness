import { Link } from 'react-router-dom'
import { ArrowRight, Building2, ChevronRight } from 'lucide-react'
import { ExpertAvatar } from './ExpertAvatar'
import { DeptStatusDot } from './DeptStatusDot'
import type { DeptStatus } from '../../departments/deptProgress'
import {
  ADOPT_CTA_DONE_LABEL,
  ADOPT_CTA_LABEL,
  ADOPT_NE_CONFIRM_NOTE,
  handoffPhaseFromStatus,
  handoffPhaseLabel,
} from '../../departments/handoffPhase'

export type DeptSideExpert = {
  id: string
  label: string
  /** 建议稿 / 交卷态一句（可选） */
  hint?: string
  selected?: boolean
  adopted?: boolean
}

export type DeptSideSwitchDept = {
  id: string
  label: string
  href: string
  active?: boolean
  /** §3.1a：待确认时锁住「更后」部门推进 */
  locked?: boolean
  lockReason?: string
}

export type DeptSidePanelProps = {
  /**
   * rail = 部门台右栏遗留变体（pages 85d64e4 后部门台改三栏内嵌，抽屉仍用本面板）
   * drawer = 公司首页点部抽屉内容（由 DeptSideDrawer 包一层）
   */
  variant: 'rail' | 'drawer'
  /** 部门显示名 */
  deptLabel: string
  /** 交卷物 / 状态一句（硬闸：一句，勿堆指标） */
  statusLine: string
  status?: DeptStatus
  experts: DeptSideExpert[]
  /**
   * 抽屉主动作：「去该部干活」
   * 右栏可省略，或传「进入专家岗」等
   */
  primaryAction?: {
    label: string
    href?: string
    onClick?: () => void
    testId?: string
  }
  /** 右栏 / 抽屉：回公司首页 */
  companyHref?: string
  /** 右栏：换部快捷链（≤7 主链即可） */
  switchDepts?: DeptSideSwitchDept[]
  onExpertClick?: (id: string) => void
  onAdopt?: (id: string) => void
  showAdopt?: boolean
  /** 抽屉关闭 */
  onClose?: () => void
  /** 回流意见（可落右栏 / 抽屉） */
  returnHint?: string | null
  className?: string
  testId?: string
}

/**
 * 公司首页抽屉 ⇄ 部门台右栏叙事 · 同构面板（product-pages §2 / §4.3 / vision §6.3a）
 *
 * 只展示：≤3 专家+头像、交卷态一句、去该部/回公司/换部。
 * MVP 禁：假指标、执行集群、工具引擎卡；浅色壳，不抄暗色。
 */
export function DeptSidePanel({
  variant,
  deptLabel,
  statusLine,
  status,
  experts,
  primaryAction,
  companyHref,
  switchDepts,
  onExpertClick,
  onAdopt,
  showAdopt = false,
  onClose,
  returnHint,
  className = '',
  testId = 'dept-side-panel',
}: DeptSidePanelProps) {
  const capped = experts.slice(0, 3)

  return (
    <aside
      className={`flex h-full min-h-0 flex-col bg-white text-slate-800 ${className}`}
      data-testid={testId}
      data-variant={variant}
    >
      <header className="shrink-0 border-b border-slate-200 px-3 py-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              {variant === 'drawer' ? '部门抽屉' : '部门右栏'}
            </p>
            <h2 className="mt-0.5 truncate text-[14px] font-semibold text-slate-900">
              {deptLabel}
            </h2>
            <div className="mt-1 flex flex-wrap items-center gap-1.5">
              {status ? (
                <>
                  <DeptStatusDot status={status} withLabel={false} />
                  <span
                    className="text-[10px] font-medium text-slate-600"
                    data-testid="dept-side-panel-phase"
                    data-handoff-phase={handoffPhaseFromStatus(status)}
                  >
                    {handoffPhaseLabel(handoffPhaseFromStatus(status))}
                  </span>
                </>
              ) : null}
            </div>
          </div>
          {variant === 'drawer' && onClose ? (
            <button
              type="button"
              onClick={onClose}
              className="btn-press focus-ring rounded-md px-2 py-1 text-[11px] font-medium text-slate-500 hover:bg-slate-50"
              data-testid="dept-side-panel-close"
              aria-label="关闭"
            >
              关闭
            </button>
          ) : null}
        </div>
        <p
          className="mt-2 text-[12px] leading-relaxed text-slate-600"
          data-testid="dept-side-panel-status"
        >
          {statusLine}
        </p>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3">
        <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
          专家岗（≤3）
        </p>
        {capped.length === 0 ? (
          <p className="text-[12px] text-slate-500">本部门暂未配置专家岗</p>
        ) : (
          <ul className="space-y-2">
            {capped.map((ex) => {
              const selected = Boolean(ex.selected)
              return (
                <li
                  key={ex.id}
                  className={`rounded-lg border px-2.5 py-2 ${
                    selected
                      ? 'border-slate-900 bg-slate-900 text-white'
                      : 'border-slate-200 bg-slate-50 text-slate-800'
                  }`}
                  data-testid={`dept-side-expert-${ex.id}`}
                >
                  <button
                    type="button"
                    onClick={() => onExpertClick?.(ex.id)}
                    className="focus-ring flex w-full items-center gap-2 text-left"
                    disabled={!onExpertClick}
                  >
                    <ExpertAvatar
                      name={ex.label}
                      tone={selected ? 'onDark' : 'light'}
                    />
                    <span className="min-w-0 flex-1 text-[12px] font-medium">
                      {ex.label}
                    </span>
                    {onExpertClick ? (
                      <ChevronRight
                        className={`h-3.5 w-3.5 shrink-0 ${
                          selected ? 'text-white/70' : 'text-slate-300'
                        }`}
                        aria-hidden
                      />
                    ) : null}
                  </button>
                  {ex.hint ? (
                    <p
                      className={`mt-1 pl-9 text-[11px] leading-relaxed ${
                        selected ? 'text-white/75' : 'text-slate-500'
                      }`}
                    >
                      {ex.hint}
                    </p>
                  ) : null}
                  {showAdopt && onAdopt ? (
                    <div className="mt-1.5 flex flex-wrap gap-2 pl-9">
                      <button
                        type="button"
                        onClick={() => onAdopt(ex.id)}
                        className={`btn-press focus-ring rounded-md px-2 py-0.5 text-[10px] font-semibold ${
                          ex.adopted
                            ? selected
                              ? 'bg-white text-slate-900'
                              : 'bg-emerald-600 text-white'
                            : selected
                              ? 'bg-white/15 text-white'
                              : 'bg-white text-slate-700 ring-1 ring-slate-200'
                        }`}
                        data-testid={`dept-side-adopt-${ex.id}`}
                      >
                        {ex.adopted ? ADOPT_CTA_DONE_LABEL : ADOPT_CTA_LABEL}
                      </button>
                    </div>
                  ) : null}
                </li>
              )
            })}
          </ul>
        )}

        {showAdopt ? (
          <p
            className="mt-3 text-[10px] leading-relaxed text-slate-400"
            data-testid="dept-side-adopt-ne-confirm"
          >
            {ADOPT_NE_CONFIRM_NOTE}
          </p>
        ) : null}

        {returnHint ? (
          <div
            className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-2 text-[11px] text-amber-950"
            data-testid="dept-side-return-hint"
            role="status"
          >
            回流意见：{returnHint}
          </div>
        ) : null}
      </div>

      <footer className="shrink-0 space-y-2 border-t border-slate-200 px-3 py-3">
        {primaryAction ? (
          primaryAction.href ? (
            <Link
              to={primaryAction.href}
              className="btn-press focus-ring inline-flex w-full items-center justify-center gap-1.5 rounded-md bg-slate-900 px-3 py-2 text-xs font-semibold text-white"
              data-testid={primaryAction.testId ?? 'dept-side-primary'}
              onClick={primaryAction.onClick}
            >
              {primaryAction.label}
              <ArrowRight className="h-3.5 w-3.5" aria-hidden />
            </Link>
          ) : (
            <button
              type="button"
              onClick={primaryAction.onClick}
              className="btn-press focus-ring inline-flex w-full items-center justify-center gap-1.5 rounded-md bg-slate-900 px-3 py-2 text-xs font-semibold text-white"
              data-testid={primaryAction.testId ?? 'dept-side-primary'}
            >
              {primaryAction.label}
              <ArrowRight className="h-3.5 w-3.5" aria-hidden />
            </button>
          )
        ) : null}

        <div className="flex flex-wrap gap-2">
          {companyHref ? (
            <Link
              to={companyHref}
              className="btn-press focus-ring inline-flex flex-1 items-center justify-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-medium text-slate-700"
              data-testid="dept-side-back-company"
            >
              <Building2 className="h-3 w-3" aria-hidden />
              回公司首页
            </Link>
          ) : null}
        </div>

        {switchDepts && switchDepts.length > 0 ? (
          <div data-testid="dept-side-switch-depts">
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              换部
            </p>
            <ul className="flex flex-wrap gap-1">
              {switchDepts.map((d) => (
                <li key={d.id}>
                  {d.locked && !d.active ? (
                    <span
                      className="inline-block cursor-not-allowed rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-400"
                      title={d.lockReason ?? '待你确认后才能推进'}
                      data-testid={`dept-side-switch-${d.id}`}
                      data-locked="1"
                      aria-disabled="true"
                    >
                      {d.label} · 锁
                    </span>
                  ) : (
                    <Link
                      to={d.href}
                      className={`focus-ring inline-block rounded-full px-2 py-0.5 text-[10px] font-medium ${
                        d.active
                          ? 'bg-slate-900 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                      data-testid={`dept-side-switch-${d.id}`}
                      data-locked="0"
                    >
                      {d.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </footer>
    </aside>
  )
}
