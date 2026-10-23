import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppProvider } from '@shared/context/AppContext'
import { AgentProvider } from '@shared/context/AgentContext'
import { ProductProvider } from '@shared/context/ProductContext'
import { AgentHome } from './pages/AgentHome'
import { DepartmentsPage } from './pages/DepartmentsPage'
import { AssetsPage } from './pages/AssetsPage'
import { AgentL1Shell } from './pages/AgentL1Shell'
import { GeneralGrokShell } from './pages/GeneralGrokShell'
import { AgentSessionWorkspace } from './pages/AgentSessionWorkspace'
import { AgentSessionsList } from './pages/AgentSessionsList'
import { AgentCatalogPage } from './pages/AgentCatalogPage'
import { AgentHarnessOverview } from './pages/AgentHarnessOverview'
import { ProjectFolderProvider } from './projects/ProjectFolderContext'
import { GeneralBotsProvider } from './projects/GeneralBotsContext'
import { BusinessCaseProvider } from './business/BusinessCaseContext'
import { OrgConfigProvider } from './departments/OrgConfigContext'
import { AssetLibraryProvider } from './assets/AssetLibraryContext'
import { GeneralBotNewPage } from './pages/GeneralBotNewPage'
import { ProjectListPage } from './pages/projects/ProjectListPage'
import { ProjectWorkspacePage } from './pages/projects/ProjectWorkspacePage'
import { AgentLabGallery } from './pages/AgentLabGallery'
import { RedirectToAgentLab } from './pages/RedirectToAgentLab'
import { PatentSeatPage } from './pages/patent/PatentSeatPage'
import { PatentRoomPage } from './pages/patent/PatentRoomPage'
import { BusinessCasesPage } from './pages/business/BusinessCasesPage'
import { BusinessCaseNewPage } from './pages/business/BusinessCaseNewPage'
import { BusinessCasePage } from './pages/business/BusinessCasePage'
import { BusinessCaseDeptPage } from './pages/business/BusinessCaseDeptPage'
import { BusinessCaseRoomPage } from './pages/business/BusinessCaseRoomPage'
import {
  PendingConfirmDetailPage,
  PendingConfirmInboxPage,
} from './pages/business/PendingConfirmPage'
import { CaseDocketPage } from './pages/business/CaseDocketPage'
import { CaseBillingPage } from './pages/business/CaseBillingPage'
import { CaseMembersPage } from './pages/business/CaseMembersPage'
import { HomePage } from './pages/HomePage'
import { AgentLoginPage } from './pages/business/AgentLoginPage'
import { RequireAuth } from './pages/business/RequireAuth'
import { EntryRoleProvider } from './business/EntryRoleContext'
import { AuthSessionProvider } from './business/AuthSessionContext'

/**
 * IA（2026-10-23）：
 * /agent/login        登录壳（角色二选一 + 样机会话；§4.0）
 * /agent              产品首页总览（§4.0a；登录后落点；主 CTA 按角色分流）
 * /agent/cases        多案流水（案表 → 公司首页）
 * /agent/departments  组织编制（全库配置旁路；作业以案→公司首页七部为主）
 * /agent/assets       资产（全局库 + 文件树）
 */
export default function App() {
  return (
    <AppProvider>
      <AgentProvider>
        <ProductProvider>
          <ProjectFolderProvider>
          <GeneralBotsProvider>
          <BusinessCaseProvider>
          <OrgConfigProvider>
          <AssetLibraryProvider>
          <EntryRoleProvider>
          <AuthSessionProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Navigate to="/agent" replace />} />
              <Route path="/agent/login" element={<AgentLoginPage />} />
              <Route path="/agent" element={<RequireAuth />}>
                <Route index element={<HomePage />} />
                <Route path="cases" element={<BusinessCasesPage />} />
                <Route path="cases/new" element={<BusinessCaseNewPage />} />
                <Route path="cases/:caseId" element={<BusinessCasePage />} />
                <Route path="cases/:caseId/depts/:deptSlug" element={<BusinessCaseDeptPage />} />
                <Route path="cases/:caseId/docket" element={<CaseDocketPage />} />
                <Route path="cases/:caseId/billing" element={<CaseBillingPage />} />
                <Route path="cases/:caseId/members" element={<CaseMembersPage />} />
                <Route path="cases/:caseId/room" element={<BusinessCaseRoomPage />} />
                <Route path="pending" element={<PendingConfirmInboxPage />} />
                <Route path="pending/:confirmId" element={<PendingConfirmDetailPage />} />
                <Route path="departments" element={<DepartmentsPage />} />
                <Route path="assets" element={<AssetsPage />} />
                {/* 2026-10-21：catalog 并入部门页 */}
                <Route path="catalog" element={<Navigate to="/agent/departments" replace />} />
                <Route path="experts" element={<Navigate to="/agent/departments" replace />} />
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
          </AuthSessionProvider>
          </EntryRoleProvider>
          </AssetLibraryProvider>
          </OrgConfigProvider>
          </BusinessCaseProvider>
          </GeneralBotsProvider>
          </ProjectFolderProvider>
        </ProductProvider>
      </AgentProvider>
    </AppProvider>
  )
}
