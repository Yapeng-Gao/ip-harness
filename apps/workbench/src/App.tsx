import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppProvider } from '@shared/context/AppContext'
import { AgentProvider } from '@shared/context/AgentContext'
import { ProductProvider } from '@shared/context/ProductContext'
import { Layout } from '@shared/components/Layout'
import { AppSurfaceLinks } from '@shared/components/AppSurfaceLinks'
import { AppLink } from '@shared/components/AppLink'
import { StageSkuProvider } from './context/StageSkuContext'
import { StageSkuGate } from './components/StageSkuGate'
import {
  WorkbenchHome,
  ResearchFlow,
  IntakeFlow,
  DraftFlow,
  ProsecutionFlow,
  MaintainFlow,
  MonetizeFlow,
  WatchFlow,
  LayoutFlow,
  InventorPortal,
} from './stages'

export default function App() {
  return (
    <AppProvider>
      <AgentProvider>
        <ProductProvider>
          <StageSkuProvider>
            <BrowserRouter>
              <AppSurfaceLinks current="workbench" />
              <Routes>
                <Route element={<Layout />}>
                  <Route index element={<Navigate to="/workbench" replace />} />
                  <Route path="workbench" element={<WorkbenchHome />} />
                  <Route
                    path="workbench/research"
                    element={
                      <StageSkuGate moduleId="research">
                        <ResearchFlow />
                      </StageSkuGate>
                    }
                  />
                  <Route
                    path="workbench/research/:caseId"
                    element={
                      <StageSkuGate moduleId="research">
                        <ResearchFlow />
                      </StageSkuGate>
                    }
                  />
                  <Route
                    path="workbench/intake"
                    element={
                      <StageSkuGate moduleId="intake">
                        <IntakeFlow />
                      </StageSkuGate>
                    }
                  />
                  <Route
                    path="workbench/intake/:caseId"
                    element={
                      <StageSkuGate moduleId="intake">
                        <IntakeFlow />
                      </StageSkuGate>
                    }
                  />
                  <Route
                    path="workbench/draft"
                    element={
                      <StageSkuGate moduleId="draft">
                        <DraftFlow />
                      </StageSkuGate>
                    }
                  />
                  <Route
                    path="workbench/draft/:caseId"
                    element={
                      <StageSkuGate moduleId="draft">
                        <DraftFlow />
                      </StageSkuGate>
                    }
                  />
                  <Route
                    path="workbench/prosecution"
                    element={
                      <StageSkuGate moduleId="prosecution">
                        <ProsecutionFlow />
                      </StageSkuGate>
                    }
                  />
                  <Route
                    path="workbench/prosecution/:caseId"
                    element={
                      <StageSkuGate moduleId="prosecution">
                        <ProsecutionFlow />
                      </StageSkuGate>
                    }
                  />
                  <Route
                    path="workbench/maintain"
                    element={
                      <StageSkuGate moduleId="maintain">
                        <MaintainFlow />
                      </StageSkuGate>
                    }
                  />
                  <Route
                    path="workbench/maintain/:caseId"
                    element={
                      <StageSkuGate moduleId="maintain">
                        <MaintainFlow />
                      </StageSkuGate>
                    }
                  />
                  <Route
                    path="workbench/monetize"
                    element={
                      <StageSkuGate moduleId="monetize">
                        <MonetizeFlow />
                      </StageSkuGate>
                    }
                  />
                  <Route
                    path="workbench/monetize/:caseId"
                    element={
                      <StageSkuGate moduleId="monetize">
                        <MonetizeFlow />
                      </StageSkuGate>
                    }
                  />
                  <Route
                    path="workbench/watch"
                    element={
                      <StageSkuGate moduleId="watch">
                        <WatchFlow />
                      </StageSkuGate>
                    }
                  />
                  <Route
                    path="workbench/watch/:caseId"
                    element={
                      <StageSkuGate moduleId="watch">
                        <WatchFlow />
                      </StageSkuGate>
                    }
                  />
                  <Route
                    path="workbench/layout"
                    element={
                      <StageSkuGate moduleId="layout">
                        <LayoutFlow />
                      </StageSkuGate>
                    }
                  />
                  <Route
                    path="workbench/layout/:caseId"
                    element={
                      <StageSkuGate moduleId="layout">
                        <LayoutFlow />
                      </StageSkuGate>
                    }
                  />
                  <Route
                    path="inventor"
                    element={
                      <StageSkuGate moduleId="inventor">
                        <InventorPortal />
                      </StageSkuGate>
                    }
                  />
                  <Route
                    path="portal/inventor"
                    element={
                      <StageSkuGate moduleId="inventor">
                        <InventorPortal />
                      </StageSkuGate>
                    }
                  />
                  <Route
                    path="*"
                    element={
                      <div className="p-8 text-sm text-slate-600">
                        办理台未匹配路由 ·{' '}
                        <AppLink className="underline" to="/">
                          回作业中台
                        </AppLink>
                      </div>
                    }
                  />
                </Route>
              </Routes>
            </BrowserRouter>
          </StageSkuProvider>
        </ProductProvider>
      </AgentProvider>
    </AppProvider>
  )
}
