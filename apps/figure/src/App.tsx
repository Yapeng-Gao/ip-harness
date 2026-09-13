import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Toast } from './components/ui'
import { FigureShell } from './layout/FigureShell'
import { HomePage } from './pages/HomePage'
import { NewPage } from './pages/NewPage'
import { GeneratePage } from './pages/GeneratePage'
import { EditPage } from './pages/EditPage'
import { VersionsPage } from './pages/VersionsPage'
import { AttachPage } from './pages/AttachPage'
import { useFigureStore } from './state/store'

function AppRoutes() {
  const { toast } = useFigureStore()
  return (
    <>
      <Routes>
        <Route element={<FigureShell />}>
          <Route index element={<HomePage />} />
          <Route path="new" element={<NewPage />} />
          <Route path="generate/:draftId" element={<GeneratePage />} />
          <Route path="edit/:assetId" element={<EditPage />} />
          <Route path="versions/:assetId" element={<VersionsPage />} />
          <Route path="attach/:assetId" element={<AttachPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {toast ? <Toast message={toast} /> : null}
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}
