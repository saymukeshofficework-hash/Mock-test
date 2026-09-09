import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import TemplatesPage from './pages/TemplatesPage'
import MyDocumentsPage from './pages/MyDocumentsPage'
import SettingsPage from './pages/SettingsPage'
import EditorPage from './pages/EditorPage'
import PreviewPage from './pages/PreviewPage'

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/templates" element={<TemplatesPage />} />
        <Route path="/documents" element={<MyDocumentsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/editor/:id" element={<EditorPage />} />
        <Route path="/preview/:id" element={<PreviewPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  )
}
