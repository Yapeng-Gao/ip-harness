import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import { X } from 'lucide-react'
import type { InterDeptTicket } from '../../business/interDeptTicket'

export type CaseFileTab = '材料' | '检查表' | '工单' | '判断痕迹'

export type CaseFileMaterial = {
  label: string
  status: '有' | '缺口' | '备注'
  note?: string
}

export type CaseFileCheckRow = {
  dept: string
  kind: '进入' | '结束' | '本轮'
  summary: string
  ok?: boolean
}

export type CaseFileJudgment = {
  at: string
  text: string
}

type Props = {
  open: boolean
  onClose: () => void
  caseId: string
  caseTitle: string
  materials: CaseFileMaterial[]
  checks: CaseFileCheckRow[]
  tickets: InterDeptTicket[]
  judgments: CaseFileJudgment[]
  /** 三线徽标（勿混词） */
  lineBadges?: string[]
  initialTab?: CaseFileTab
}

const TABS: CaseFileTab[] = ['材料', '检查表', '工单', '判断痕迹']

/**
 * 案卷抽屉 · 交互大纲 §4.5 / 线框 s-docket
 * 材料 / 检查表 / 工单 / 判断痕迹；壳级入口，不另起知识库叙事。
 */
export function CaseFileDrawer({
  open,
  onClose,
  caseId,
  caseTitle,
  materials,
  checks,
  tickets,
  judgments,
  lineBadges = [],
  initialTab = '材料',
}: Props) {
  const [tab, setTab] = useState<CaseFileTab>(initialTab)
  const panelRef = useRef<HTMLDivElement>(null)
  const restoreFocusRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (open) setTab(initialTab)
  }, [open, initialTab])

  useEffect(() => {
    if (!open) return
    restoreFocusRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null
    const root = document.getElementById('root')
    if (root) root.inert = true
    const raf = requestAnimationFrame(() => {
      panelRef.current?.focus()
    })
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('keydown', onKey)
      if (root) root.inert = false
      const prev = restoreFocusRef.current
      restoreFocusRef.current = null
      requestAnimationFrame(() => prev?.focus?.())
    }
  }, [open, onClose])

  if (!open) return null

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex justify-end"
      data-testid="case-file-drawer"
      role="dialog"
      aria-modal="true"
      aria-label="案卷抽屉"
    >
      <div
        className="absolute inset-0 bg-slate-900/25"
        aria-hidden
        onClick={onClose}
        data-testid="case-file-drawer-backdrop"
      />
      <div
        ref={panelRef}
        tabIndex={-1}
        className="relative z-10 flex h-full w-full max-w-md flex-col border-l border-slate-200 bg-white shadow-2xl outline-none"
        data-testid="case-file-drawer-panel"
      >
        <header className="flex shrink-0 items-start justify-between gap-2 border-b border-slate-200 px-4 py-3">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              案卷抽屉
            </p>
            <h2 className="mt-0.5 truncate text-[15px] font-semibold text-slate-900">
              {caseTitle}
            </h2>
            <Link
              to={`/agent/cases/${caseId}`}
              className="mt-1 inline-block text-[11px] text-slate-500 underline-offset-2 hover:underline"
              onClick={onClose}
            >
              公司案首页
            </Link>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="btn-press focus-ring rounded-md p-1.5 text-slate-500 hover:bg-slate-50"
            aria-label="关闭案卷"
            data-testid="case-file-drawer-close"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </header>

        <nav
          className="flex shrink-0 gap-1 overflow-x-auto border-b border-slate-100 px-3 py-2"
          aria-label="案卷页签"
          data-testid="case-file-tabs"
        >
          {TABS.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`btn-press focus-ring shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium ${
                tab === t
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
              data-testid={`case-file-tab-${t}`}
              aria-pressed={tab === t}
            >
              {t}
            </button>
          ))}
        </nav>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
          {tab === '材料' ? (
            <ul className="space-y-2" data-testid="case-file-materials">
              {materials.length === 0 ? (
                <li className="rounded-lg border border-dashed border-slate-200 px-3 py-6 text-center text-[12px] text-slate-500">
                  本案尚无归档材料
                </li>
              ) : (
                materials.map((m) => (
                  <li
                    key={m.label}
                    className="flex items-start justify-between gap-2 rounded-lg border border-slate-100 bg-slate-50/80 px-3 py-2"
                  >
                    <span className="text-[13px] font-medium text-slate-800">
                      {m.label}
                    </span>
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                        m.status === '有'
                          ? 'bg-emerald-50 text-emerald-800'
                          : m.status === '缺口'
                            ? 'bg-amber-50 text-amber-900'
                            : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {m.status}
                      {m.note ? ` · ${m.note}` : ''}
                    </span>
                  </li>
                ))
              )}
            </ul>
          ) : null}

          {tab === '检查表' ? (
            <ul className="space-y-2" data-testid="case-file-checks">
              {checks.map((row) => (
                <li
                  key={`${row.dept}-${row.kind}`}
                  className="rounded-lg border border-slate-100 px-3 py-2"
                >
                  <div className="flex items-center gap-2 text-[11px] text-slate-500">
                    <span className="font-semibold text-slate-700">{row.dept}</span>
                    <span>· {row.kind}</span>
                    {row.ok != null ? (
                      <span
                        className={
                          row.ok ? 'text-emerald-700' : 'text-amber-700'
                        }
                      >
                        {row.ok ? '过' : '未过'}
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-0.5 text-[12px] text-slate-700">{row.summary}</p>
                </li>
              ))}
            </ul>
          ) : null}

          {tab === '工单' ? (
            <div className="space-y-3" data-testid="case-file-tickets">
              {tickets.length === 0 ? (
                <p className="rounded-lg border border-dashed border-slate-200 px-3 py-6 text-center text-[12px] text-slate-500">
                  尚无部间工单
                </p>
              ) : (
                tickets.map((t) => (
                  <div
                    key={t.id}
                    className="rounded-lg border border-slate-200 px-3 py-2.5"
                  >
                    <p className="text-[13px] font-semibold text-slate-900">
                      {t.intentLabel}
                    </p>
                    <p className="mt-0.5 text-[11px] text-slate-500">
                      打包 {t.packer} · 接单 {t.receiver}
                    </p>
                    <Link
                      to={`/agent/cases/${caseId}/depts/${t.toSlug}?ticket=1`}
                      className="mt-2 inline-block text-[11px] font-medium text-slate-800 underline-offset-2 hover:underline"
                      onClick={onClose}
                    >
                      打开工单 / 进接收部
                    </Link>
                  </div>
                ))
              )}
            </div>
          ) : null}

          {tab === '判断痕迹' ? (
            <ul
              className="space-y-2 font-mono text-[11px] leading-relaxed text-slate-700"
              data-testid="case-file-judgments"
            >
              {judgments.length === 0 ? (
                <li className="rounded-lg border border-dashed border-slate-200 px-3 py-6 text-center font-sans text-[12px] text-slate-500">
                  尚无硬请示沉淀
                </li>
              ) : (
                judgments.map((j, i) => (
                  <li
                    key={`${j.at}-${i}`}
                    className="rounded-lg border border-slate-100 bg-slate-50/80 px-3 py-2"
                  >
                    <span className="text-slate-400">{j.at}</span>
                    <p className="mt-0.5 font-sans text-[12px] text-slate-800">
                      {j.text}
                    </p>
                  </li>
                ))
              )}
            </ul>
          ) : null}
        </div>

        {lineBadges.length > 0 ? (
          <footer
            className="shrink-0 border-t border-slate-100 px-4 py-2"
            data-testid="case-file-line-badges"
          >
            <div className="flex flex-wrap gap-1.5">
              {lineBadges.map((b) => (
                <span
                  key={b}
                  className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600"
                >
                  {b}
                </span>
              ))}
            </div>
            <p className="mt-1 text-[10px] text-slate-400">三词勿混用</p>
          </footer>
        ) : null}
      </div>
    </div>,
    document.body,
  )
}
