import { BrowserRouter, Routes, Route, Navigate, useLocation, useParams, Link } from 'react-router-dom'
import { useEffect } from 'react'
import { AppProvider } from './context/AppContext'
import { AgentProvider } from './context/AgentContext'
import { ProductProvider, useProduct } from './context/ProductContext'
import { Layout } from './components/Layout'
import { AgentShell } from './components/agent/AgentShell'
import { Dashboard } from './pages/Dashboard'
import { Pipeline } from './pages/Pipeline'
import { CaseDetail } from './pages/CaseDetail'
import { CaseLibrary } from './pages/CaseLibrary'
import { STAGES } from './data/stages'
import type { StageId } from './types'
import { workbenchPathForStage } from './data/workbenchMap'
import { Settings } from './pages/Settings'
import { WorkbenchHome } from './pages/workbench/WorkbenchHome'
import { ResearchFlow } from './pages/workbench/ResearchFlow'
import { IntakeFlow } from './pages/workbench/IntakeFlow'
import { DraftFlow } from './pages/workbench/DraftFlow'
import { ProsecutionFlow } from './pages/workbench/ProsecutionFlow'
import { MaintainFlow } from './pages/workbench/MaintainFlow'
import { MonetizeFlow } from './pages/workbench/MonetizeFlow'
import { WatchFlow } from './pages/workbench/WatchFlow'
import { LayoutFlow } from './pages/workbench/LayoutFlow'
import { Agencies } from './pages/Agencies'
import { InsightTracks } from './pages/InsightTracks'
import { InsightInnovate } from './pages/InsightInnovate'
import { InsightLayout } from './pages/InsightLayout'
import { InsightChain } from './pages/InsightChain'
import { DataStrategy } from './pages/DataStrategy'
import { Billing } from './pages/Billing'
import { OrgSettings } from './pages/OrgSettings'
import { InventorPortal } from './pages/InventorPortal'
import { Login } from './pages/Login'
import { Docket } from './pages/Docket'
import { AgentHome } from './pages/agent/AgentHome'
import { AgentSessionWorkspace } from './pages/agent/AgentSessionWorkspace'
import { AgentSessionsList } from './pages/agent/AgentSessionsList'
import { AgentCatalogPage } from './pages/agent/AgentCatalogPage'
import { AgentHarnessOverview } from './pages/agent/AgentHarnessOverview'

function ProductRouteSync() {
  const loc = useLocation()
  const { setActiveProduct } = useProduct()
  useEffect(() => {
    if (
      loc.pathname.startsWith('/agent') ||
      loc.pathname.startsWith('/ip-agent') ||
      loc.pathname.startsWith('/agents')
    ) {
      setActiveProduct('agent')
    } else if (
      loc.pathname !== '/login' &&
      !loc.pathname.startsWith('/agent')
    ) {
      // form saas routes
      if (
        loc.pathname === '/' ||
        loc.pathname.startsWith('/hub') ||
        loc.pathname.startsWith('/cases') ||
        loc.pathname.startsWith('/workbench') ||
        loc.pathname.startsWith('/docket') ||
        loc.pathname.startsWith('/pipeline') ||
        loc.pathname.startsWith('/insight') ||
        loc.pathname.startsWith('/billing') ||
        loc.pathname.startsWith('/settings') ||
        loc.pathname.startsWith('/monitor') ||
        loc.pathname.startsWith('/agencies') ||
        loc.pathname.startsWith('/inventor') ||
        loc.pathname.startsWith('/portal') ||
        loc.pathname.startsWith('/stage')
      ) {
        setActiveProduct('saas')
      }
    }
  }, [loc.pathname, setActiveProduct])
  return null
}

function AppRoutes() {
  return (
    <>
      <ProductRouteSync />
      <Routes>
        <Route path="/login" element={<Login />} />

        {/* Product B: IP Agent Harness (Cursor-like) */}
        <Route path="/agent" element={<AgentShell />}>
          <Route index element={<AgentHome />} />
          <Route path="sessions" element={<AgentSessionsList />} />
          <Route path="sessions/:id" element={<AgentSessionWorkspace />} />
          <Route path="agents" element={<AgentCatalogPage />} />
          <Route path="harness" element={<AgentHarnessOverview />} />
          <Route path="skills" element={<Navigate to="/agent/agents" replace />} />
          <Route path="tools" element={<Navigate to="/agent/agents" replace />} />
        </Route>
        <Route path="/ip-agent/*" element={<Navigate to="/agent" replace />} />

        {/* Legacy /agents → new harness */}
        <Route path="/agents" element={<Navigate to="/agent" replace />} />
        <Route path="/agents/runs" element={<Navigate to="/agent/sessions" replace />} />
        <Route path="/agents/catalog" element={<Navigate to="/agent/agents" replace />} />
        <Route path="/agents/runs/:runId" element={<LegacyRunRedirect />} />
        <Route path="/agents/:agentId/new" element={<Navigate to="/agent" replace />} />

        {/* Product A: Form SaaS */}
        <Route element={<Layout />}>
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
          <Route path="inventor" element={<InventorPortal />} />
          <Route path="portal/inventor" element={<InventorPortal />} />

          <Route path="workbench" element={<WorkbenchHome />} />
          <Route path="workbench/research" element={<ResearchFlow />} />
          <Route path="workbench/research/:caseId" element={<ResearchFlow />} />
          <Route path="workbench/intake" element={<IntakeFlow />} />
          <Route path="workbench/intake/:caseId" element={<IntakeFlow />} />
          <Route path="workbench/draft" element={<DraftFlow />} />
          <Route path="workbench/draft/:caseId" element={<DraftFlow />} />
          <Route path="workbench/prosecution" element={<ProsecutionFlow />} />
          <Route path="workbench/prosecution/:caseId" element={<ProsecutionFlow />} />
          <Route path="workbench/maintain" element={<MaintainFlow />} />
          <Route path="workbench/maintain/:caseId" element={<MaintainFlow />} />
          <Route path="workbench/monetize" element={<MonetizeFlow />} />
          <Route path="workbench/monetize/:caseId" element={<MonetizeFlow />} />
          <Route path="workbench/watch" element={<WatchFlow />} />
          <Route path="workbench/watch/:caseId" element={<WatchFlow />} />
          <Route path="workbench/layout" element={<LayoutFlow />} />
          <Route path="workbench/layout/:caseId" element={<LayoutFlow />} />

          {/* Legacy agent UI redirected to IP Agent harness */}
          <Route path="legacy/agents" element={<Navigate to="/agent" replace />} />
          <Route path="legacy/agents/runs" element={<Navigate to="/agent/sessions" replace />} />
          <Route path="legacy/agents/runs/:runId" element={<Navigate to="/agent/sessions" replace />} />
          <Route path="legacy/agents/catalog" element={<Navigate to="/agent/agents" replace />} />
          <Route path="legacy/agents/:agentId/new" element={<Navigate to="/agent" replace />} />
        </Route>
      </Routes>
    </>
  )
}

function LegacyRunRedirect() {
  return <Navigate to="/agent/sessions" replace />
}

/** Bookmark-compatible /stage/:stageId → workbench (hub UI removed). */
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
  return <Navigate to={workbenchPathForStage(stageId as StageId)} replace />
}

export default function App() {
  return (
    <AppProvider>
      <AgentProvider>
        <ProductProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </ProductProvider>
      </AgentProvider>
    </AppProvider>
  )
}
