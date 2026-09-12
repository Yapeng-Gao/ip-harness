import { Login } from '@shared/pages/Login'
import { ShieldAlert, ExternalLink, ArrowRight } from 'lucide-react'
import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { OidcEmptyState } from '../components/OidcEmptyState'
import {
  agentHref,
  iamHref,
  midHref,
  opsHref,
  resolveReturnUrl,
  workbenchHref,
} from '../lib/deepLinks'

/**
 * 登录包装页：醒目非真 SSO 横幅 + OIDC 空态 + 共享 Login；
 * 另加绝对深链回跳区（?return= / ?next= + mid/workbench/agent/ops）。
 * 不改共享 Login：其 multi-app 仍跳产品根；回跳区显式走 APP_DEV_URLS 绝对链。
 */
export function IamLoginPage() {
  const [searchParams] = useSearchParams()
  const returnUrl = useMemo(() => resolveReturnUrl(searchParams), [searchParams])

  return (
    <div className="app-shell-bg min-h-screen">
      <header className="shell-banner-demo sticky top-0 z-20">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-2 px-4 py-2.5">
          <p className="inline-flex items-center gap-2 text-sm font-semibold text-amber-950">
            <ShieldAlert className="h-4 w-4 shrink-0" aria-hidden />
            演示登录 · 非真 SSO / 非 OIDC · 样机 cookie，非真会话
          </p>
          <a
            href={iamHref('/')}
            className="text-xs font-medium text-amber-900/70 underline-offset-2 hover:underline"
          >
            返回 IAM 首页
          </a>
        </div>
      </header>

      <div className="mx-auto grid max-w-5xl gap-6 px-4 py-6 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-start">
        <div className="min-w-0 space-y-4">
          {returnUrl ? (
            <div
              role="status"
              className="rounded-xl border border-[color-mix(in_srgb,var(--color-accent)_28%,transparent)] bg-accent-soft px-4 py-3 text-sm text-slate-900"
            >
              <p className="font-medium">登录后将回跳：</p>
              <p className="mt-1 break-all font-mono text-xs text-slate-600">{returnUrl}</p>
              <a
                href={returnUrl}
                className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-primary-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-primary-500"
              >
                回跳到来源
                <ArrowRight className="h-3.5 w-3.5" aria-hidden />
              </a>
              <p className="mt-2 text-xs text-slate-500">
                建议先在下方选租户写入样机 cookie，再点回跳；共享 Login 的「进入」仍跳产品根，不读
                return。
              </p>
            </div>
          ) : null}

          {/* 压掉共享 Login 外层全屏居中，便于嵌入薄壳布局 */}
          <div className="surface-card overflow-hidden [&>div]:min-h-0 [&>div]:items-stretch [&>div]:justify-start [&>div]:bg-transparent [&>div]:p-5 [&>div>main]:max-w-none">
            <Login />
          </div>
          <p className="px-1 text-xs text-slate-500">
            选租户后由共享 Login 按产品跳转 mid / agent 根（需{' '}
            <code className="rounded bg-slate-100 px-1">VITE_MULTI_APP=true</code>
            ）。本页不提供真实 SSO；Persona/工作区为样机 cookie（
            <code className="rounded bg-slate-100 px-1">CROSS_PORT_*</code>
            ），不是真 SSO 会话 cookie。
          </p>

          <section
            aria-label="绝对深链回跳"
            className="surface-card p-4"
          >
            <h2 className="text-sm font-semibold text-slate-800">绝对深链回跳（APP_DEV_URLS）</h2>
            <p className="mt-1 text-xs text-slate-500">
              跨口请用下方绝对链，勿依赖相对路径或硬编码端口。支持查询{' '}
              <code className="rounded bg-slate-100 px-1">?return=</code> /{' '}
              <code className="rounded bg-slate-100 px-1">?next=</code>
              （须为某一 APP_DEV_URLS 前缀）。
            </p>
            <ul className="mt-3 flex flex-wrap gap-2 text-sm">
              {returnUrl ? (
                <li>
                  <a
                    href={returnUrl}
                    className="ui-btn ui-btn-sm ui-btn-primary btn-press"
                  >
                    <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                    来源 return
                  </a>
                </li>
              ) : null}
              <li>
                <a
                  href={midHref('/')}
                  className="ui-btn ui-btn-sm ui-btn-secondary btn-press"
                >
                  mid
                </a>
              </li>
              <li>
                <a
                  href={workbenchHref('/workbench')}
                  className="ui-btn ui-btn-sm ui-btn-secondary btn-press"
                >
                  workbench
                </a>
              </li>
              <li>
                <a
                  href={agentHref('/agent')}
                  className="ui-btn ui-btn-sm ui-btn-secondary btn-press"
                >
                  agent
                </a>
              </li>
              <li>
                <a
                  href={opsHref('/')}
                  className="ui-btn ui-btn-sm ui-btn-secondary btn-press"
                >
                  ops
                </a>
              </li>
            </ul>
          </section>
        </div>

        <aside className="lg:sticky lg:top-16">
          <OidcEmptyState />
          <p className="mt-3 text-xs leading-relaxed text-slate-400">
            本侧栏仅为接入示意；企业 IdP 回调、令牌交换、真会话 cookie 均未实现（P2 占位 ·
            未排期）。
          </p>
        </aside>
      </div>
    </div>
  )
}
