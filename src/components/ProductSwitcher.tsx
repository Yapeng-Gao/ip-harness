import { useNavigate } from 'react-router-dom'
import { useProduct } from '../context/ProductContext'
import { useApp } from '../context/AppContext'
import { personaCanAccessAgent } from '../data/persona'
import type { ActiveProduct } from '../types'
import { APP_DEV_URLS } from '@ip/contracts'

type Props = {
  /** Which product is currently active in this shell */
  current: ActiveProduct
  /** compact = sidebar/topbar; large = login */
  size?: 'sm' | 'md' | 'lg'
  className?: string
  /** Controlled mode for Login before navigate */
  value?: ActiveProduct
  onChange?: (p: ActiveProduct) => void
}

/**
 * Unified SaaS ↔ Agent segmented control.
 * Selected = white fill + soft shadow (same in Sidebar, AgentShell, Login).
 */
export function ProductSwitcher({
  current,
  size = 'sm',
  className = '',
  value,
  onChange,
}: Props) {
  const { setActiveProduct } = useProduct()
  const { persona } = useApp()
  const navigate = useNavigate()
  const active = value ?? current
  const agentAllowed = personaCanAccessAgent(persona)

  const pick = (p: ActiveProduct) => {
    if (p === 'agent' && !agentAllowed && !onChange) {
      return
    }
    if (onChange) {
      onChange(p)
      return
    }
    setActiveProduct(p)
    const multi = import.meta.env.VITE_MULTI_APP === 'true'
    if (multi) {
      window.location.href = p === 'agent' ? APP_DEV_URLS.agent : APP_DEV_URLS.mid
      return
    }
    navigate(p === 'agent' ? '/agent' : '/')
  }

  const pad =
    size === 'lg'
      ? 'px-4 py-2 text-sm'
      : size === 'md'
        ? 'px-2.5 py-1.5 text-xs'
        : 'px-2 py-1.5 text-xs'

  const wrap =
    size === 'lg'
      ? 'gap-1 rounded-xl p-1'
      : 'gap-1 rounded-lg p-1'

  const btn = (p: ActiveProduct, label: string) => {
    const selected = active === p
    const blocked = p === 'agent' && !agentAllowed && !onChange
    return (
      <button
        type="button"
        onClick={() => pick(p)}
        aria-pressed={selected}
        disabled={blocked}
        title={blocked ? '当前 Persona 不可进入知产 Agent' : undefined}
        className={`btn-press focus-ring rounded-lg text-center font-medium ${pad} ${
          blocked
            ? 'cursor-not-allowed text-slate-300'
            : selected
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-500 hover:bg-white/70 hover:text-slate-800'
        }`}
      >
        {label}
      </button>
    )
  }

  const display = className.includes('inline-grid') || className.includes('inline-')
    ? 'inline-grid'
    : 'grid'

  return (
    <div
      className={`${display} grid-cols-2 bg-slate-100 ${wrap} ${className.replace(/\binline-grid\b/g, '')}`}
      role="group"
      aria-label="产品切换"
    >
      {btn('saas', '作业中台')}
      {btn('agent', '知产 Agent')}
    </div>
  )
}
