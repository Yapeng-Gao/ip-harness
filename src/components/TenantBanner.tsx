import { Shield } from 'lucide-react'
import { useApp } from '../context/AppContext'

export function TenantBanner() {
  const { workspace, visibleCases } = useApp()
  return (
    <div
      className={`mb-4 flex flex-wrap items-center gap-2 rounded-[var(--radius-lg)] border border-slate-200/80 bg-white/90 px-3 py-2 text-[11px] shadow-[var(--shadow-rest)] backdrop-blur`}
      role="status"
    >
      <Shield className={`h-3.5 w-3.5 ${workspace.brandColor}`} aria-hidden />
      <span className={`font-medium ${workspace.brandColor}`}>{workspace.chipLabel}</span>
      <span className="text-slate-400">·</span>
      <span className="tabular-nums text-slate-600">
        当前租户可见 {visibleCases.length} 案 · 已隔离
      </span>
    </div>
  )
}
