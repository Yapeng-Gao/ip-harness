import { useNavigate } from 'react-router-dom'
import { Building2, Scale, ArrowRight } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useProduct } from '../context/ProductContext'
import { WORKSPACES } from '../data/workspaces'
import { useState } from 'react'
import type { ActiveProduct } from '../types'
import { ProductSwitcher } from '../components/ProductSwitcher'
import { APP_DEV_URLS } from '@ip/contracts'

export function Login() {
  const { selectWorkspace } = useApp()
  const { setActiveProduct } = useProduct()
  const navigate = useNavigate()
  const [product, setProduct] = useState<ActiveProduct>('saas')

  const enter = (id: string) => {
    selectWorkspace(id)
    setActiveProduct(product)
    const multi = import.meta.env.VITE_MULTI_APP === 'true'
    if (multi) {
      if (product === 'agent') window.location.href = APP_DEV_URLS.agent
      else if (product === 'saas') window.location.href = APP_DEV_URLS.mid
      else window.location.href = APP_DEV_URLS.mid
      return
    }
    navigate(product === 'agent' ? '/agent' : '/')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <a href="#login-main" className="skip-link">跳到主要内容</a>
      <main id="login-main" tabIndex={-1} className="w-full max-w-3xl outline-none">
        <div className="mb-8">
          <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-md bg-slate-900 text-xs font-bold text-white">
            IP
          </div>
          <h1 className="text-balance text-2xl font-semibold text-slate-900">IP Harness</h1>
          <p className="mt-1 text-sm text-slate-500">
            选择租户进入 · 作业中台或知产 Agent
          </p>
        </div>

        <div className="mb-6">
          <ProductSwitcher
            current={product}
            size="lg"
            value={product}
            onChange={setProduct}
            className="inline-grid"
          />
        </div>

        <ul className="divide-y divide-slate-200 overflow-hidden rounded-lg border border-slate-200 bg-white">
          {WORKSPACES.map((ws) => {
            const Icon = ws.kind === 'enterprise' ? Building2 : Scale
            return (
              <li key={ws.id}>
                <button
                  type="button"
                  onClick={() => enter(ws.id)}
                  className="btn-press focus-ring list-row group flex w-full items-start gap-3 px-4 py-3.5 text-left hover:bg-slate-50"
                  aria-label={`进入工作区 ${ws.name}`}
                >
                  <div
                    className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-sm font-bold text-white ${ws.brandBg}`}
                    aria-hidden
                  >
                    {ws.logoLetter}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-slate-900">{ws.name}</span>
                      <Icon className={`h-3.5 w-3.5 ${ws.brandColor}`} aria-hidden />
                    </div>
                    <div className="mt-0.5 text-xs text-slate-500">
                      {ws.kind === 'enterprise' ? '企业租户' : '代理所租户'} · {ws.homeBlurb}
                    </div>
                  </div>
                  <span className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-slate-700">
                    进入{product === 'agent' ? '知产 Agent' : '作业中台'}{' '}
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                  </span>
                </button>
              </li>
            )
          })}
        </ul>

        <p className="mt-6 text-xs text-slate-400">
          演示环境 · 产品选择写入 localStorage · 侧栏可随时切换
        </p>
      </main>
    </div>
  )
}
