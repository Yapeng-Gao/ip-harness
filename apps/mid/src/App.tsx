import { BrowserRouter, Routes, Route, Navigate, useParams, Link } from 'react-router-dom'
import { AppProvider } from '@shared/context/AppContext'
import { AgentProvider } from '@shared/context/AgentContext'
import { ProductProvider } from '@shared/context/ProductContext'
import { MidLayout } from './shell/MidLayout'
import { AppSurfaceLinks } from '@shared/components/AppSurfaceLinks'
import { Dashboard } from '@shared/pages/Dashboard'
import { Pipeline } from '@shared/pages/Pipeline'
import { CaseDetail } from '@shared/pages/CaseDetail'
import { CaseLibrary } from '@shared/pages/CaseLibrary'
import { STAGES } from '@shared/data/stages'
import type { StageId } from '@shared/types'
import { workbenchPathForStage } from '@shared/data/workbenchMap'
import { Settings } from '@shared/pages/Settings'
import { Agencies } from '@shared/pages/Agencies'
import { InsightTracks } from '@shared/pages/InsightTracks'
import { InsightInnovate } from '@shared/pages/InsightInnovate'
import { InsightLayout } from '@shared/pages/InsightLayout'
import { InsightChain } from '@shared/pages/InsightChain'
import { DataStrategy } from '@shared/pages/DataStrategy'
import { Billing } from '@shared/pages/Billing'
import { OrgSettings } from '@shared/pages/OrgSettings'
import { Docket } from '@shared/pages/Docket'
import { APP_DEV_URLS } from '@ip/contracts'

function StageRedirect() {
  const { stageId } = useParams()
  const valid = STAGES.some((s) => s.id === stageId)
  if (!valid) {
    return (
      <div className="flex h-full items-center justify-center p-8 text-slate-400">
        未知阶段 · <Link to="/pipeline" className="ml-2 text-slate-700">返回</Link>
      </div>
    )
  }
  // Phase 0: stage → workbench app deep link
  const path = workbenchPathForStage(stageId as StageId)
  window.location.href = `${APP_DEV_URLS.workbench}${path}`
  return (
    <div className="p-8 text-sm text-slate-500">
      正在打开办理台… <a className="text-slate-800 underline" href={`${APP_DEV_URLS.workbench}${path}`}>{path}</a>
    </div>
  )
}

function MidRoutes() {
  return (
    <Routes>
      <Route element={<MidLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="hub" element={<Navigate to="/" replace />} />
        <Route path="pipeline" element={<Pipeline />} />
        <Route path="cases" element={<CaseLibrary />} />
        <Route path="cases/:id" element={<CaseDetail />} />
        <Route path="docket" element={<Docket />} />
        <Route path="stage/:stageId" element={<StageRedirect />} />
        <Route path="monitor" element={<Navigate to="/docket?focus=risk" replace />} />
        <Route path="agencies" element={<Agencies />} />
        <Route path="insight/tracks" element={<InsightTracks />} />
        <Route path="insight/innovate" element={<InsightInnovate />} />
        <Route path="insight/layout" element={<InsightLayout />} />
        <Route path="insight/chain" element={<InsightChain />} />
        <Route path="insight/sources" element={<DataStrategy />} />
        <Route path="settings" element={<Settings />} />
        <Route path="settings/data" element={<DataStrategy />} />
        <Route path="settings/billing" element={<Billing />} />
        <Route path="billing" element={<Billing />} />
        <Route path="billing/cases" element={<Billing />} />
        <Route path="settings/org" element={<OrgSettings />} />
        {/* Cross-app redirects */}
        <Route
          path="workbench/*"
          element={
            <RedirectExternal base={APP_DEV_URLS.workbench} prefix="/workbench" />
          }
        />
        <Route
          path="inventor"
          element={<MetaRedirect href={`${APP_DEV_URLS.workbench}/inventor`} />}
        />
        <Route
          path="portal/inventor"
          element={<MetaRedirect href={`${APP_DEV_URLS.workbench}/inventor`} />}
        />
        <Route path="login" element={<MetaRedirect href={APP_DEV_URLS.iam} />} />
        <Route
          path="agent/*"
          element={
            <RedirectExternal base={APP_DEV_URLS.agent} prefix="/agent" />
          }
        />
      </Route>
    </Routes>
  )
}

function MetaRedirect({ href }: { href: string }) {
  window.location.href = href
  return (
    <div className="p-8 text-sm text-slate-500">
      跳转中… <a className="underline text-slate-800" href={href}>{href}</a>
    </div>
  )
}

function RedirectExternal({ base, prefix }: { base: string; prefix: string }) {
  const path = typeof window !== 'undefined' ? window.location.pathname : prefix
  const search = typeof window !== 'undefined' ? window.location.search : ''
  const hash = typeof window !== 'undefined' ? window.location.hash : ''
  const rest = path.startsWith(prefix) ? path : prefix
  const href = `${base}${rest}${search}${hash}`
  return <MetaRedirect href={href} />
}

export default function App() {
  return (
    <AppProvider>
      <AgentProvider>
        <ProductProvider>
          <BrowserRouter>
            <AppSurfaceLinks current="mid" />
            <MidRoutes />
          </BrowserRouter>
        </ProductProvider>
      </AgentProvider>
    </AppProvider>
  )
}
