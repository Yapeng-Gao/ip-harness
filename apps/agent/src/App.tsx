import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppProvider } from '@shared/context/AppContext'
import { AgentProvider } from '@shared/context/AgentContext'
import { ProductProvider } from '@shared/context/ProductContext'
import { AgentShell } from './components/AgentShell'
import { AgentHome } from './pages/AgentHome'
import { AgentL1Shell } from './pages/AgentL1Shell'
import { GeneralGrokShell } from './pages/GeneralGrokShell'
import { AgentSessionWorkspace } from './pages/AgentSessionWorkspace'
import { AgentSessionsList } from './pages/AgentSessionsList'
import { AgentCatalogPage } from './pages/AgentCatalogPage'
import { AgentHarnessOverview } from './pages/AgentHarnessOverview'
import { ProjectFolderProvider } from './projects/ProjectFolderContext'
import { GeneralBotsProvider } from './projects/GeneralBotsContext'
import { BusinessCaseProvider } from './business/BusinessCaseContext'
import { GeneralBotNewPage } from './pages/GeneralBotNewPage'
import { ProjectListPage } from './pages/projects/ProjectListPage'
import { ProjectWorkspacePage } from './pages/projects/ProjectWorkspacePage'
import { AgentLabGallery } from './pages/AgentLabGallery'
import { RedirectToAgentLab } from './pages/RedirectToAgentLab'
import { PatentCatalogPage } from './pages/patent/PatentCatalogPage'
import { PatentSeatPage } from './pages/patent/PatentSeatPage'
import { PatentRoomPage } from './pages/patent/PatentRoomPage'
import { BusinessCasesPage } from './pages/business/BusinessCasesPage'
import { BusinessCaseNewPage } from './pages/business/BusinessCaseNewPage'
import { BusinessCasePage } from './pages/business/BusinessCasePage'
import {
  PendingConfirmDetailPage,
  PendingConfirmInboxPage,
} from './pages/business/PendingConfirmPage'

/**
 * Business mode:
 * /agent = chat home (empty center + case rail); Catalog = expert bypass.
 * Solo/Team bypass kept.
 */
export default function App() {
  return (
    <AppProvider>
      <AgentProvider>
        <ProductProvider>
          <ProjectFolderProvider>
          <GeneralBotsProvider>
          <BusinessCaseProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Navigate to="/agent" replace />} />
              <Route path="/agent" element={<AgentShell />}>
                <Route index element={<BusinessCasesPage />} />
                <Route path="cases/new" element={<BusinessCaseNewPage />} />
                <Route path="cases/:caseId" element={<BusinessCasePage />} />
                <Route path="pending" element={<PendingConfirmInboxPage />} />
                <Route path="pending/:confirmId" element={<PendingConfirmDetailPage />} />
                <Route path="catalog" element={<PatentCatalogPage />} />
                {/* 旧深链：冷启动曾是 Catalog */}
                <Route path="experts" element={<Navigate to="/agent/catalog" replace />} />
                <Route path="seats/:seatId" element={<PatentSeatPage />} />
                <Route path="sandbox" element={<AgentL1Shell />} />
                <Route path="team" element={<GeneralGrokShell />} />
                <Route path="bots/new" element={<GeneralBotNewPage />} />
                <Route path="bots/:botId" element={<GeneralGrokShell />} />
                <Route path="compose" element={<AgentHome />} />
                <Route path="sessions" element={<AgentSessionsList />} />
                <Route path="sessions/:id" element={<AgentSessionWorkspace />} />
                <Route path="agents" element={<AgentCatalogPage />} />
                <Route path="harness" element={<AgentHarnessOverview />} />
                <Route path="lab" element={<AgentLabGallery />} />
                <Route path="gallery" element={<RedirectToAgentLab />} />
                <Route path="projects" element={<ProjectListPage />} />
                <Route path="projects/:projectId" element={<ProjectWorkspacePage />} />
                <Route path="projects/:projectId/bots/:botId" element={<ProjectWorkspacePage />} />
                <Route path="projects/:projectId/room" element={<PatentRoomPage />} />
                <Route path="projects/:projectId/experts/:expertId" element={<ProjectWorkspacePage />} />
                <Route path="skills" element={<Navigate to="/agent" replace />} />
                <Route path="tools" element={<Navigate to="/agent" replace />} />
              </Route>
              <Route path="/ip-agent/*" element={<Navigate to="/agent" replace />} />
              <Route path="/agents" element={<Navigate to="/agent" replace />} />
              <Route path="/agents/*" element={<Navigate to="/agent" replace />} />
            </Routes>
          </BrowserRouter>
          </BusinessCaseProvider>
          </GeneralBotsProvider>
          </ProjectFolderProvider>
        </ProductProvider>
      </AgentProvider>
    </AppProvider>
  )
}
