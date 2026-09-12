import { midHref } from '../../lib/deepLinks'
import {
  Play,
  Square,
  RotateCcw,
  FolderOpen,
  AlertTriangle,
  MoreHorizontal,
} from 'lucide-react'
import { RUN_STATUS_LABEL } from '@shared/data/agents'
import type { AgentSession } from '@shared/types'

type BannerKind = 'failed' | 'no_case' | 'route' | null

type Suggested = {
  agent: { name: string; specialty: string; tier?: string }
  reason: string
  requiresTierConfirm?: boolean
}

type Props = {
  sess: AgentSession
  subtitleLabel: string
  caseTitle?: string
  caseId?: string
  playing: boolean
  hitlActive: boolean
  moreOpen: boolean
  setMoreOpen: (v: boolean | ((prev: boolean) => boolean)) => void
  renamingTitle: boolean
  setRenamingTitle: (v: boolean) => void
  titleDraft: string
  setTitleDraft: (v: string) => void
  onRenameCommit: (title: string) => void
  activeBanner: BannerKind
  suggested?: Suggested
  switchReasonChip: string | null
  onRetry: () => void
  onFocusCaseSelect: () => void
  onSwitchSuggested: () => void
  onStop: () => void
  onDryRun: () => void
  onEquivalenceDemo: () => void
  showEquivalenceDemo: boolean
}

export function SessionWorkspaceHeader({
  sess,
  subtitleLabel,
  caseTitle,
  caseId,
  playing,
  hitlActive,
  moreOpen,
  setMoreOpen,
  renamingTitle,
  setRenamingTitle,
  titleDraft,
  setTitleDraft,
  onRenameCommit,
  activeBanner,
  suggested,
  switchReasonChip,
  onRetry,
  onFocusCaseSelect,
  onSwitchSuggested,
  onStop,
  onDryRun,
  onEquivalenceDemo,
  showEquivalenceDemo,
}: Props) {
  return (
    <div className="shrink-0 border-b border-slate-200 bg-white px-4 py-2.5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="min-w-0">
          {renamingTitle ? (
            <input
              autoFocus
              value={titleDraft}
              onChange={(e) => setTitleDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const title = titleDraft.trim()
                  if (title) onRenameCommit(title)
                  setRenamingTitle(false)
                }
                if (e.key === 'Escape') setRenamingTitle(false)
              }}
              onBlur={() => {
                const title = titleDraft.trim()
                if (title) onRenameCommit(title)
                setRenamingTitle(false)
              }}
              className="focus-ring w-full max-w-md rounded border border-slate-200 px-2 py-1 text-sm font-semibold"
              aria-label="重命名会话"
            />
          ) : (
            <h1 className="group flex items-center gap-1.5 truncate text-sm font-semibold text-slate-900">
              <span className="truncate">{sess.title}</span>
              <button
                type="button"
                aria-label="重命名会话"
                className="btn-press focus-ring shrink-0 rounded px-1 py-0.5 text-xs font-normal text-slate-400 opacity-0 hover:bg-slate-100 hover:text-slate-700 group-hover:opacity-100 focus:opacity-100"
                onClick={() => {
                  setTitleDraft(sess.title)
                  setRenamingTitle(true)
                }}
              >
                改名
              </button>
            </h1>
          )}
          <p className="truncate text-xs text-slate-500">
            {subtitleLabel} · {RUN_STATUS_LABEL[sess.status]}
            {caseTitle ? ` · ${caseTitle}` : ''}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {caseId ? (
            <a
              href={midHref(`/cases/${caseId}?from=agent`)}
              className="btn-press focus-ring inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
              aria-label="回中台案件"
            >
              <FolderOpen className="h-3.5 w-3.5" aria-hidden /> 回中台
            </a>
          ) : (
            <a
              href={midHref('/cases')}
              className="btn-press focus-ring inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
              aria-label="回中台案件库"
            >
              <FolderOpen className="h-3.5 w-3.5" aria-hidden /> 回中台
            </a>
          )}

          {!playing && !hitlActive && (
            <div className="relative" data-more-menu>
              <button
                type="button"
                title="更多"
                aria-expanded={moreOpen}
                aria-haspopup="menu"
                onClick={() => setMoreOpen((v) => !v)}
                className="btn-press focus-ring inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-600 hover:bg-slate-50"
              >
                <MoreHorizontal className="h-4 w-4" aria-hidden />
                <span className="sr-only">更多操作</span>
              </button>
              {moreOpen && (
                <div
                  className="menu-enter absolute right-0 z-30 mt-1 w-48 overflow-hidden rounded-[var(--radius-md)] border border-slate-200 bg-white elevated"
                  role="menu"
                >
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      onDryRun()
                      setMoreOpen(false)
                    }}
                    className="btn-press focus-ring flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-slate-700 hover:bg-slate-50"
                  >
                    <Play className="h-3.5 w-3.5" aria-hidden /> 预览一下
                  </button>
                  {showEquivalenceDemo && (
                    <button
                      type="button"
                      role="menuitem"
                      title="能力已阉割：仅低风险（调研等）；交底/OA/年费/布局/权利要求请用正式办理+ConfirmBar；禁 fileResponse"
                      onClick={() => {
                        onEquivalenceDemo()
                        setMoreOpen(false)
                      }}
                      className="btn-press focus-ring flex w-full flex-col items-start gap-0.5 px-3 py-2 text-left text-xs text-slate-500 hover:bg-slate-50"
                    >
                      <span>一键等效演示（已阉割）</span>
                      <span className="text-[10px] font-normal leading-snug text-amber-700">
                        仅低风险 · 禁 file/高风险捷径
                      </span>
                    </button>
                  )}
                  <p className="border-t border-slate-100 px-3 py-1.5 text-xs text-slate-400">
                    主路径：底部「启动」→ 确认条逐步 HITL
                  </p>
                </div>
              )}
            </div>
          )}

          {playing && (
            <button
              type="button"
              onClick={onStop}
              className="btn-press focus-ring inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700"
            >
              <Square className="h-3 w-3" aria-hidden /> 停止
            </button>
          )}
        </div>
      </div>

      {activeBanner === 'failed' && (
        <div className="mt-2 flex flex-wrap items-center gap-2 border-l-4 border-l-rose-500 border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-rose-600" aria-hidden />
          <span className="min-w-0 flex-1">
            办理失败
            {sess.failReason ? `：${sess.failReason}` : ''}
          </span>
          <button
            type="button"
            className="btn-press focus-ring shrink-0 rounded-lg bg-rose-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-rose-500"
            onClick={onRetry}
          >
            <span className="inline-flex items-center gap-1">
              <RotateCcw className="h-3 w-3" aria-hidden /> 重试
            </span>
          </button>
        </div>
      )}

      {activeBanner === 'no_case' && (
        <div className="mt-2 flex flex-wrap items-center gap-2 border-l-4 border-l-amber-500 border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-amber-600" aria-hidden />
          <span className="min-w-0 flex-1">尚未关联案件，确认后不会写回中台</span>
          <button
            type="button"
            className="btn-press focus-ring shrink-0 rounded-md bg-slate-900 px-2.5 py-1 text-xs font-medium text-white hover:bg-slate-800"
            onClick={onFocusCaseSelect}
          >
            去选案件
          </button>
        </div>
      )}

      {activeBanner === 'route' && suggested && (
        suggested.requiresTierConfirm ? (
        <div className="mt-2 flex flex-wrap items-center gap-2 border-l-4 border-l-amber-500 border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs text-amber-950">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-amber-700" aria-hidden />
          <span className="min-w-0 flex-1">
            <span className="font-semibold">当前改荐 Core 办理</span>
            <span className="mt-0.5 block leading-snug">
              未确认前按「调研检索」走主闭环。原匹配「{suggested.agent.name}」为 Beta·非采购闭环。
              点确认后才切换；否则保持 Core。
            </span>
            <span className="mt-0.5 block text-amber-800/80">{suggested.reason}</span>
          </span>
          <button
            type="button"
            onClick={onSwitchSuggested}
            className="btn-press focus-ring ml-auto shrink-0 rounded-md bg-amber-800 px-2.5 py-1 text-xs font-medium text-white hover:bg-amber-700"
          >
            确认试用 Beta
          </button>
        </div>
        ) : (
        <div className="mt-2 flex flex-wrap items-center gap-2 border-l-4 border-l-slate-700 border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800">
          <span className="min-w-0 flex-1">
            <span className="font-medium">Auto 已按 Core 匹配：{suggested.agent.name}</span>
            <span className="text-slate-500">（{suggested.agent.specialty}）</span>
            <span className="mt-0.5 block text-slate-500">{suggested.reason}</span>
          </span>
          <button
            type="button"
            onClick={onSwitchSuggested}
            className="btn-press focus-ring ml-auto shrink-0 rounded-md bg-slate-900 px-2.5 py-1 text-xs font-medium text-white hover:bg-slate-800"
          >
            切换到该 Agent
          </button>
        </div>
        )
      )}

      {switchReasonChip && !activeBanner && (
        <div className="toast-enter mt-2 inline-flex max-w-full items-center gap-1.5 border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-700">
          <span className="truncate">{switchReasonChip}</span>
        </div>
      )}
    </div>
  )
}

export type { BannerKind }
