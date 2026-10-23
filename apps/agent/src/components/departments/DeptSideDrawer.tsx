import { useEffect } from 'react'
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

/**
 * 公司首页点部 → 右侧抽屉壳（浅色）
 * 内容与部门台钉栏同构：复用 DeptSidePanel。
 * 公司叙事可在 CaseCompanyHome 中：选中某部 → open + 传入该部 props。
 */
export function DeptSideDrawer({
  open,
  onClose,
  overlayTestId = 'dept-side-drawer',
  ...panelProps
}: DrawerProps) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-40 flex justify-end"
      data-testid={overlayTestId}
      role="dialog"
      aria-modal="true"
      aria-label={`${panelProps.deptLabel} 部门抽屉`}
    >
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/20"
        aria-label="关闭抽屉"
        onClick={onClose}
        data-testid="dept-side-drawer-backdrop"
      />
      <div
        className="relative z-10 flex h-full w-full max-w-sm flex-col border-l border-slate-200 bg-white shadow-xl"
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
    </div>
  )
}
