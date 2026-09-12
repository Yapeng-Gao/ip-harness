import { AppSurfaceLinks } from '@shared/components/AppSurfaceLinks'
import { PersonaSwitcher } from '@shared/components/PersonaSwitcher'
import { WorkspaceMenu } from '@shared/components/WorkspaceMenu'
import { useApp } from '@shared/context/AppContext'
import { useProduct } from '@shared/context/ProductContext'
import { PERSONA_LABELS } from '@shared/data/persona'
import { ShieldAlert } from 'lucide-react'
import {
  agentHref,
  crossPortBridgeHref,
  iamHref,
  midHref,
  opsHref,
  workbenchHref,
} from '../lib/deepLinks'
import { OidcEmptyState } from '../components/OidcEmptyState'
import {
  ACTIVE_PRODUCT_LS_KEY,
  COMMITTEE_VOTE_HARD_BLOCK_LS_KEY,
  CROSS_PORT_BRIDGE_MESSAGE_TYPE,
  CROSS_PORT_BROADCAST_CHANNEL,
  CROSS_PORT_PERSONA_COOKIE,
  CROSS_PORT_SNAPSHOT_LS_KEY,
  CROSS_PORT_WORKSPACE_COOKIE,
} from '../storageKeys'

/**
 * IAM 首页：工作区 + Persona 薄壳；醒目标明非真 SSO。
 * Persona/workspace 为样机 cookie（CROSS_PORT_*），非真 SSO 会话 cookie。
 */
export function IamHome() {
  const { persona, workspace } = useApp()
  const { activeProduct } = useProduct()

  return (
    <div className="app-shell-bg min-h-screen">
      <AppSurfaceLinks current="iam" />

      <div
        role="status"
        className="shell-banner-demo px-4 py-2 text-center"
      >
        <span className="inline-flex items-center gap-1.5">
          <ShieldAlert className="h-3.5 w-3.5 shrink-0" aria-hidden />
          演示环境 · 非真 SSO / 非 OIDC · Persona/工作区为样机 cookie，不是真 SSO 会话
        </span>
      </div>

      <main className="mx-auto max-w-3xl px-6 py-10">
        <p className="shell-page-kicker">
          apps/iam · IAM 薄壳
        </p>
        <h1 className="shell-page-title mt-2">登录 / 工作区 / Persona</h1>
        <p className="mt-2 text-sm text-slate-600">
          复用共享 Login、WorkspaceMenu、PersonaSwitcher；正式身份体系（SSO / OIDC）尚未接入。P2
          真 IAM（企业 IdP、令牌、会话）仅占位，未排期实现。
        </p>

        <div className="surface-card mt-6 flex flex-wrap items-center gap-3 p-4">
          <WorkspaceMenu />
          <PersonaSwitcher variant="topbar" />
        </div>

        <dl className="mt-6 grid gap-3 text-sm text-slate-700 sm:grid-cols-2">
          <div className="surface-card p-4 ring-1 ring-amber-100">
            <dt className="text-xs text-slate-500">
              <span className="mr-1 rounded bg-amber-50 px-1 py-0.5 text-[10px] font-semibold text-amber-900">
                Dev
              </span>
              当前工作区 · 样机 cookie{' '}
              <code className="rounded bg-slate-100 px-1 font-mono text-xs">
                {CROSS_PORT_WORKSPACE_COOKIE}
              </code>
              （localhost 跨口 · <strong>非</strong> SSO 会话）
            </dt>
            <dd className="mt-1 font-medium">{workspace?.name ?? '未选择'}</dd>
          </div>
          <div className="surface-card p-4 ring-1 ring-amber-100">
            <dt className="text-xs text-slate-500">
              <span className="mr-1 rounded bg-amber-50 px-1 py-0.5 text-[10px] font-semibold text-amber-900">
                Dev
              </span>
              Persona · 样机 cookie{' '}
              <code className="rounded bg-slate-100 px-1 font-mono text-xs">
                {CROSS_PORT_PERSONA_COOKIE}
              </code>
              （localhost 跨口 · <strong>非</strong> SSO 会话）
            </dt>
            <dd className="mt-1 font-medium">{PERSONA_LABELS[persona]}</dd>
          </div>
          <div className="surface-card p-4 ring-1 ring-amber-100 sm:col-span-2">
            <dt className="text-xs text-slate-500">
              <span className="mr-1 rounded bg-amber-50 px-1 py-0.5 text-[10px] font-semibold text-amber-900">
                Dev
              </span>
              产品面记忆（localStorage · 同口隔离 ·{' '}
              <code className="rounded bg-slate-100 px-1 font-mono text-xs">
                {ACTIVE_PRODUCT_LS_KEY}
              </code>
              ）
            </dt>
            <dd className="mt-1 font-medium">{activeProduct}</dd>
          </div>
        </dl>

        <section
          aria-label="Dev tools · 存储约定"
          className="mt-6 rounded-xl border border-dashed border-amber-200/80 bg-amber-50/30 p-4 text-xs text-slate-600"
        >
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className="rounded-md border border-amber-300 bg-amber-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-950">
              Dev tools
            </span>
            <h2 className="text-sm font-semibold text-slate-800">
              存储约定（只读 · 样机 cookie ≠ 真 SSO）
            </h2>
          </div>
          <p className="mb-2 text-[11px] leading-relaxed text-amber-950/80">
            以下为演示调试信息，不是产品登录完成态。
          </p>
          <p className="mt-1.5 leading-relaxed text-slate-500">
            常量来自 <code className="rounded bg-slate-100 px-1">@ip/contracts</code>
            。Persona/工作区经 <strong>样机 cookie</strong>（
            <code className="rounded bg-slate-100 px-1 font-mono text-xs">
              {CROSS_PORT_PERSONA_COOKIE}
            </code>
            /
            <code className="rounded bg-slate-100 px-1 font-mono text-xs">
              {CROSS_PORT_WORKSPACE_COOKIE}
            </code>
            ）跨端口共享，这是演示态，<strong>不是</strong>真 SSO 会话 cookie。全量案件态同口多
            tab 同步，跨口依赖 mid bridge 或 legacy——cookie 跨口与同口 LS{' '}
            <strong>分口径</strong>，禁止写成「各业务 app 同一套 localStorage」。
          </p>
          <ul className="mt-3 space-y-2 leading-relaxed">
            <li>
              <span className="font-medium text-slate-700">Cookie · 跨口（样机 · 非 SSO）</span>
              <ul className="mt-1 list-inside list-disc pl-1">
                <li>
                  <code className="rounded bg-slate-100 px-1 font-mono text-xs">
                    {CROSS_PORT_PERSONA_COOKIE}
                  </code>{' '}
                  · Persona
                </li>
                <li>
                  <code className="rounded bg-slate-100 px-1 font-mono text-xs">
                    {CROSS_PORT_WORKSPACE_COOKIE}
                  </code>{' '}
                  · 工作区
                </li>
              </ul>
            </li>
            <li>
              <span className="font-medium text-slate-700">localStorage · 同口（端口隔离）</span>
              <ul className="mt-1 list-inside list-disc pl-1">
                <li>
                  <code className="rounded bg-slate-100 px-1 font-mono text-xs">
                    {ACTIVE_PRODUCT_LS_KEY}
                  </code>{' '}
                  · 产品面
                </li>
                <li>
                  <code className="rounded bg-slate-100 px-1 font-mono text-xs">
                    {CROSS_PORT_SNAPSHOT_LS_KEY}
                  </code>{' '}
                  · 全量快照
                </li>
                <li>
                  <code className="rounded bg-slate-100 px-1 font-mono text-xs">
                    {COMMITTEE_VOTE_HARD_BLOCK_LS_KEY}
                  </code>{' '}
                  · 委员硬挡 Go
                </li>
              </ul>
            </li>
            <li>
              <span className="font-medium text-slate-700">通道</span>
              <ul className="mt-1 list-inside list-disc pl-1">
                <li>
                  BroadcastChannel{' '}
                  <code className="rounded bg-slate-100 px-1 font-mono text-xs">
                    {CROSS_PORT_BROADCAST_CHANNEL}
                  </code>{' '}
                  · 同口 tab
                </li>
                <li>
                  bridge postMessage type{' '}
                  <code className="rounded bg-slate-100 px-1 font-mono text-xs">
                    {CROSS_PORT_BRIDGE_MESSAGE_TYPE}
                  </code>
                </li>
                <li>
                  mid bridge iframe{' '}
                  <a
                    className="font-mono text-xs text-slate-700 underline-offset-2 hover:underline"
                    href={crossPortBridgeHref()}
                  >
                    {crossPortBridgeHref()}
                  </a>
                </li>
              </ul>
            </li>
          </ul>
        </section>

        <div className="mt-6">
          <OidcEmptyState />
        </div>

        <section
          aria-label="P2 真 IAM 占位"
          className="mt-6 rounded-xl border border-dashed border-slate-200 bg-slate-50/80 p-4 text-xs text-slate-500"
        >
          <h2 className="text-sm font-semibold text-slate-700">P2 真 IAM（占位 · 未排期）</h2>
          <p className="mt-1.5 leading-relaxed">
            未来可接企业 IdP（OIDC/SAML）、令牌交换与真会话 cookie；当前原型仅样机 Persona/工作区
            cookie，无令牌、无 SSO 会话。
          </p>
        </section>

        <div className="mt-8 flex flex-wrap gap-3 text-sm">
          <a
            className="ui-btn ui-btn-primary btn-press"
            href={iamHref('/login')}
          >
            打开登录页
          </a>
          <a
            className="ui-btn ui-btn-secondary btn-press"
            href={midHref('/')}
          >
            进入作业中台
          </a>
          <a
            className="ui-btn ui-btn-secondary btn-press"
            href={workbenchHref('/workbench')}
          >
            进入办理台
          </a>
          <a
            className="ui-btn ui-btn-secondary btn-press"
            href={agentHref('/agent')}
          >
            进入知产 Agent
          </a>
          <a
            className="ui-btn ui-btn-secondary btn-press"
            href={opsHref('/')}
          >
            进入运维面
          </a>
        </div>
      </main>
    </div>
  )
}
