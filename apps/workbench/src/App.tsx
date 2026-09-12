import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppProvider } from '@shared/context/AppContext'
import { AgentProvider } from '@shared/context/AgentContext'
import { ProductProvider } from '@shared/context/ProductContext'
import { Layout } from '@shared/components/Layout'
import { AppSurfaceLinks } from '@shared/components/AppSurfaceLinks'
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
import { APP_DEV_URLS } from '@ip/contracts'

export default function App() {
  return (
    <AppProvider>
      <AgentProvider>
        <ProductProvider>
          <BrowserRouter>
            <AppSurfaceLinks current="workbench" />
            <Routes>
              <Route element={<Layout />}>
                <Route index element={<Navigate to="/workbench" replace />} />
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
                <Route path="inventor" element={<InventorPortal />} />
                <Route path="portal/inventor" element={<InventorPortal />} />
                <Route
                  path="*"
                  element={
                    <div className="p-8 text-sm text-slate-600">
                      办理台未匹配路由 ·{' '}
                      <a className="underline" href={APP_DEV_URLS.mid}>回作业中台</a>
                    </div>
                  }
                />
              </Route>
            </Routes>
          </BrowserRouter>
        </ProductProvider>
      </AgentProvider>
    </AppProvider>
  )
}
