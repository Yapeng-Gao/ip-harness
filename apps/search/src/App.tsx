import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Toast } from './components/ui'
import { SearchShell } from './layout/SearchShell'
import { SearchPage } from './pages/SearchPage'
import { FamilyPage } from './pages/FamilyPage'
import { SavedPage } from './pages/SavedPage'
import { CorpusPage } from './pages/CorpusPage'
import { useSearchStore } from './state/store'

function AppRoutes() {
  const { toast } = useSearchStore()
  return (
    <>
      <Routes>
        <Route element={<SearchShell />}>
          <Route index element={<SearchPage />} />
          <Route path="families/:familyId" element={<FamilyPage />} />
          <Route path="saved" element={<SavedPage />} />
          <Route path="corpus" element={<CorpusPage />} />
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
