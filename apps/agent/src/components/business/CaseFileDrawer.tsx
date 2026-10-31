import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import { X } from 'lucide-react'
import type { InterDeptTicket } from '../../business/interDeptTicket'
import type {
  JudgmentRecord,
  PreferenceRecord,
} from '../../business/judgmentArchive'
import {
  addPreferenceManual,
  listSavedPreferences,
  removePreference,
} from '../../business/preferenceStore'

export type CaseFileTab = '材料' | '检查表' | '工单' | '判断档案'

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

/** @deprecated 种子行；实写请用 JudgmentRecord */
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
  /** 实写判断档案（确认/驳回后） */
  judgments: JudgmentRecord[]
  preferences?: PreferenceRecord[]
  onSavePreference?: (prefId: string) => void
  onPrecipitateJudgment?: (judgmentId: string) => void
  lineBadges?: string[]
  initialTab?: CaseFileTab
}

const TABS: CaseFileTab[] = ['材料', '检查表', '工单', '判断档案']

/**
 * 案卷抽屉 · 交互大纲 §4.5
 * 判断档案 = T10 沉淀（结论/选项/理由/依据）；≠操作考勤
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
  preferences = [],
  onSavePreference,
  onPrecipitateJudgment,
  lineBadges = [],
  initialTab = '材料',
}: Props) {
  const [tab, setTab] = useState<CaseFileTab>(initialTab)
  const [storeTick, setStoreTick] = useState(0)
  const panelRef = useRef<HTMLDivElement>(null)
  const restoreFocusRef = useRef<HTMLElement | null>(null)
  const storePrefs = listSavedPreferences()
  void storeTick

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

  const savedPrefs = preferences.filter((p) => p.saved)
  const pendPrefs = preferences.filter((p) => p.precipitable && !p.saved)

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex justify-end"
      data-testid="case-file-drawer"
    >
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/30"
        aria-label="关闭案卷"
        onClick={onClose}
        data-testid="case-file-backdrop"
      />
      <div
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="case-file-title"
        className="relative flex h-full w-full max-w-md flex-col bg-white shadow-xl outline-none"
        data-testid="case-file-panel"
      >
        <header className="flex shrink-0 items-start justify-between gap-2 border-b border-slate-100 px-4 py-3">
          <div className="min-w-0">
            <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
              案卷抽屉
            </p>
            <h2
              id="case-file-title"
              className="truncate text-[15px] font-semibold text-slate-900"
            >
              {caseTitle}
            </h2>
            <p className="text-[11px] text-slate-500">{caseId}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="btn-press focus-ring rounded-md p-1.5 text-slate-500 hover:bg-slate-100"
            aria-label="关闭"
            data-testid="case-file-close"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <div
          className="flex shrink-0 gap-1 overflow-x-auto border-b border-slate-100 px-3 py-2"
          role="tablist"
          data-testid="case-file-tabs"
        >
          {TABS.map((t) => (
            <button
              key={t}
              type="button"
              role="tab"
              aria-selected={tab === t}
              onClick={() => setTab(t)}
              className={`btn-press focus-ring shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium ${
                tab === t
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
              data-testid={`case-file-tab-${t}`}
              data-dtab={
                t === '判断档案'
                  ? 'judgments'
                  : t === '材料'
                    ? 'materials'
                    : t === '检查表'
                      ? 'checklist'
                      : 'orders'
              }
            >
              {t}
            </button>
          ))}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
          {tab === '材料' ? (
            <ul className="space-y-2" data-testid="case-file-materials">
              {materials.map((m) => (
                <li
                  key={m.label}
                  className="flex items-start justify-between gap-2 rounded-lg border border-slate-100 px-3 py-2"
                >
                  <span className="text-[12px] text-slate-800">{m.label}</span>
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
              ))}
            </ul>
          ) : null}

          {tab === '检查表' ? (
            <ul className="space-y-2" data-testid="case-file-checks">
              {checks.map((c, i) => (
                <li
                  key={`${c.dept}-${c.kind}-${i}`}
                  className="rounded-lg border border-slate-100 px-3 py-2"
                >
                  <p className="text-[11px] font-semibold text-slate-700">
                    {c.dept} · {c.kind}
                    {c.ok === true ? (
                      <span className="ml-1 text-emerald-700">过</span>
                    ) : c.ok === false ? (
                      <span className="ml-1 text-amber-800">未</span>
                    ) : null}
                  </p>
                  <p className="mt-0.5 text-[12px] text-slate-600">{c.summary}</p>
                </li>
              ))}
            </ul>
          ) : null}

          {tab === '工单' ? (
            <div className="space-y-2" data-testid="case-file-tickets">
              {tickets.length === 0 ? (
                <p className="rounded-lg border border-dashed border-slate-200 px-3 py-6 text-center text-[12px] text-slate-500">
                  尚无部间工单
                </p>
              ) : (
                tickets.map((t) => (
                  <div
                    key={t.id}
                    className="rounded-lg border border-slate-100 px-3 py-2"
                  >
                    <p className="text-[12px] font-semibold text-slate-800">
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

          {tab === '判断档案' ? (
            <div data-testid="judgment-archive">
              <h3
                className="text-[13px] font-semibold text-slate-900"
                data-testid="judgment-archive-title"
              >
                判断档案
              </h3>
              <p className="mt-0.5 text-[11px] text-slate-500">
                T10 · 结论 / 选项 / 理由 / 依据 · 确认后写回（≠操作考勤）
              </p>

              <div className="mt-3 space-y-2" data-testid="pref-list">
                {savedPrefs.length > 0 ? (
                  <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                    已沉淀偏好 · {savedPrefs.length}
                  </p>
                ) : null}
                {savedPrefs.map((pr) => (
                  <div
                    key={pr.id}
                    className="rounded-lg border border-emerald-100 bg-emerald-50/60 px-3 py-2"
                    data-testid="pref-saved"
                  >
                    <p className="text-[11px] font-semibold text-emerald-900">
                      已沉淀
                    </p>
                    <p className="mt-0.5 text-[12px] text-slate-800">{pr.text}</p>
                    <p className="mt-0.5 text-[10px] text-slate-500">
                      来自 {pr.from}
                      {pr.savedAt ? ` · ${pr.savedAt}` : ''}
                    </p>
                  </div>
                ))}
                {pendPrefs.map((pr) => (
                  <div
                    key={pr.id}
                    className="rounded-lg border border-violet-100 bg-violet-50/50 px-3 py-2"
                    data-testid="pref-precip"
                  >
                    <p className="text-[11px] font-semibold text-violet-900">
                      可沉淀为偏好
                    </p>
                    <p className="mt-0.5 text-[12px] text-slate-800">{pr.text}</p>
                    <p className="mt-0.5 text-[10px] text-slate-500">
                      来自 {pr.from}
                    </p>
                    {onSavePreference ? (
                      <button
                        type="button"
                        className="btn-press focus-ring mt-2 rounded-full border border-violet-300 bg-white px-2.5 py-1 text-[11px] font-medium text-violet-900"
                        data-testid="btn-precip-pref"
                        onClick={() => {
                          onSavePreference(pr.id)
                          setStoreTick((n) => n + 1)
                        }}
                      >
                        写入偏好列表
                      </button>
                    ) : null}
                  </div>
                ))}
              </div>

              <div
                className="mt-4 rounded-lg border border-slate-200 bg-white px-3 py-2"
                data-testid="pref-store-panel"
              >
                <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                  跨案偏好仓 · localStorage
                </p>
                <p className="mt-0.5 text-[10px] text-slate-500">
                  演示可读可写 · 非真知识库引擎
                </p>
                <ul className="mt-2 space-y-1.5">
                  {storePrefs.length === 0 ? (
                    <li className="text-[11px] text-slate-400">仓空 · 沉淀后出现</li>
                  ) : (
                    storePrefs.slice(0, 8).map((sp) => (
                      <li
                        key={sp.id}
                        className="flex items-start justify-between gap-2 rounded-md bg-slate-50 px-2 py-1.5"
                        data-testid="pref-store-item"
                      >
                        <span className="min-w-0 flex-1 text-[11px] text-slate-800">
                          {sp.text}
                        </span>
                        <button
                          type="button"
                          className="btn-press focus-ring shrink-0 text-[10px] text-rose-700"
                          data-testid="pref-store-remove"
                          onClick={() => {
                            removePreference(sp.id)
                            setStoreTick((n) => n + 1)
                          }}
                        >
                          删
                        </button>
                      </li>
                    ))
                  )}
                </ul>
                <button
                  type="button"
                  className="btn-press focus-ring mt-2 rounded-full border border-slate-300 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-700"
                  data-testid="pref-store-add"
                  onClick={() => {
                    addPreferenceManual({
                      text: '跨案偏好：交底事实先钉再全绿',
                      from: '案卷手动',
                      applyOnDept: '交底部',
                    })
                    setStoreTick((n) => n + 1)
                  }}
                >
                  手动写入一条演示偏好
                </button>
              </div>

              <ul
                className="mt-4 space-y-2"
                data-testid="case-file-judgments"
              >
                {judgments.length === 0 ? (
                  <li className="rounded-lg border border-dashed border-slate-200 px-3 py-6 text-center text-[12px] text-slate-500">
                    尚无判断档案 · 硬请示确认/驳回后写入
                  </li>
                ) : (
                  judgments.map((j) => (
                    <li
                      key={j.id}
                      className="rounded-lg border border-slate-100 bg-slate-50/80 px-3 py-2"
                      data-testid="judgment-item"
                    >
                      <p className="text-[12px] font-semibold text-slate-900">
                        {j.gate}
                      </p>
                      <p className="text-[10px] text-slate-400">{j.at}</p>
                      <p className="mt-1 text-[11px] text-slate-700">
                        <span className="font-medium text-slate-500">结论</span>{' '}
                        {j.conclusion}
                      </p>
                      <p className="text-[11px] text-slate-700">
                        <span className="font-medium text-slate-500">选项</span>{' '}
                        {j.option}
                      </p>
                      <p className="text-[11px] text-slate-700">
                        <span className="font-medium text-slate-500">理由</span>{' '}
                        {j.reason}
                      </p>
                      {j.source ? (
                        <p className="text-[11px] text-slate-600">
                          <span className="font-medium text-slate-500">来源</span>{' '}
                          {j.source}
                        </p>
                      ) : null}
                      {j.compare ? (
                        <p className="text-[11px] text-slate-600">
                          <span className="font-medium text-slate-500">对比</span>{' '}
                          {j.compare}
                        </p>
                      ) : null}
                      {j.confidence ? (
                        <p className="text-[11px] text-slate-600">
                          <span className="font-medium text-slate-500">置信</span>{' '}
                          {j.confidence === 'high'
                            ? '高'
                            : j.confidence === 'mid'
                              ? '中·存疑可进'
                              : '低·存疑'}
                        </p>
                      ) : null}
                      {j.evidenceAnchor ? (
                        <p className="mt-0.5 text-[10px] text-slate-400">
                          依据锚 · {j.evidenceAnchor}
                        </p>
                      ) : null}
                      {onPrecipitateJudgment && !j.id.startsWith('seed-') ? (
                        <button
                          type="button"
                          className="btn-press focus-ring mt-2 text-[11px] font-medium text-slate-700 underline-offset-2 hover:underline"
                          data-testid="judgment-precip"
                          onClick={() => onPrecipitateJudgment(j.id)}
                        >
                          写入为跨案偏好
                        </button>
                      ) : null}
                    </li>
                  ))
                )}
              </ul>
            </div>
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
