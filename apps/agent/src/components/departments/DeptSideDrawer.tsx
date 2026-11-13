import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import {
  DeptSidePanel,
  type DeptSidePanelProps,
} from './DeptSidePanel'

type DrawerProps = Omit<DeptSidePanelProps, 'variant' | 'className'> & {
  open: boolean
  onClose: () => void
  /** 覆盖层 test id */
  overlayTestId?: string
}

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'textarea:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ')

function focusableIn(root: HTMLElement): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
    (el) => {
      if (el.getAttribute('aria-hidden') === 'true') return false
      if (el.closest('[aria-hidden="true"]')) return false
      // visible enough for keyboard
      return el.getClientRects().length > 0
    },
  )
}

/**
 * 公司首页点部 → 右侧抽屉壳（浅色）
 * 内容与部门台右栏叙事同构：复用 DeptSidePanel（抽屉变体）。
 * 公司叙事可在 CaseCompanyHome 中：选中某部 → open + 传入该部 props。
 *
 * A11y：打开聚焦面板、Tab 陷阱、背景 inert、overscroll-contain、关闭焦点回触发卡。
 */
export function DeptSideDrawer({
  open,
  onClose,
  overlayTestId = 'dept-side-drawer',
  ...panelProps
}: DrawerProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const restoreFocusRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!open) return

    restoreFocusRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null

    const root = document.getElementById('root')
    if (root) root.inert = true

    const focusPanel = () => {
      const el = panelRef.current
      if (!el) return
      const nodes = focusableIn(el)
      ;(nodes[0] ?? el).focus()
    }
    const raf = requestAnimationFrame(focusPanel)

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
        return
      }
      if (e.key !== 'Tab') return
      const el = panelRef.current
      if (!el) return
      const nodes = focusableIn(el)
      if (nodes.length === 0) {
        e.preventDefault()
        el.focus()
        return
      }
      const first = nodes[0]!
      const last = nodes[nodes.length - 1]!
      const active = document.activeElement
      if (e.shiftKey) {
        if (active === first || active === el) {
          e.preventDefault()
          last.focus()
        }
      } else if (active === last) {
        e.preventDefault()
        first.focus()
      }
    }
    window.addEventListener('keydown', onKey)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('keydown', onKey)
      if (root) root.inert = false
      const prev = restoreFocusRef.current
      restoreFocusRef.current = null
      requestAnimationFrame(() => {
        prev?.focus?.()
      })
    }
  }, [open, onClose])

  if (!open) return null

  return createPortal(
    <div
      className="fixed inset-0 z-40 flex justify-end"
      data-testid={overlayTestId}
      role="dialog"
      aria-modal="true"
      aria-label={`${panelProps.deptLabel} 部门抽屉`}
    >
      <div
        className="absolute inset-0 bg-slate-900/20"
        aria-hidden
        onClick={onClose}
        data-testid="dept-side-drawer-backdrop"
      />
      <div
        ref={panelRef}
        tabIndex={-1}
        className="dept-drawer-panel relative z-10 flex h-full w-full max-w-sm flex-col border-l border-slate-200 bg-white shadow-xl overscroll-contain outline-none"
        data-testid="dept-side-drawer-panel"
      >
        <DeptSidePanel
          {...panelProps}
          variant="drawer"
          onClose={onClose}
          className="h-full"
          testId="dept-side-panel"
        />
      </div>
    </div>,
    document.body,
  )
}
