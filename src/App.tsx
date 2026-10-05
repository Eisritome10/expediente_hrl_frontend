import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppProviders } from '@/app/providers'
import { RequireAuth } from '@/app/RequireAuth'
import { AuthLayout } from '@/layouts/AuthLayout'
import { AdminLayout } from '@/layouts/AdminLayout'
import { ResearcherLayout } from '@/layouts/ResearcherLayout'
import { LoginPage } from '@/pages/auth/LoginPage'
import { DashboardPage } from '@/pages/dashboard/DashboardPage'
import { ResearchersListPage } from '@/pages/researchers/ResearchersListPage'
import { InstitutionsListPage } from '@/pages/institutions/InstitutionsListPage'
import { DestinationsListPage } from '@/pages/destinations/DestinationsListPage'
import { ModalitiesListPage } from '@/pages/modalities/ModalitiesListPage'
import { StudyDesignsListPage } from '@/pages/study-designs/StudyDesignsListPage'
import { AgreementsListPage } from '@/pages/agreements/AgreementsListPage'
import { ProtocolsListPage } from '@/pages/protocols/ProtocolsListPage'
import { ProtocolWizardPage } from '@/pages/protocols/ProtocolWizardPage'
import { ProtocolDetailPage } from '@/pages/protocols/ProtocolDetailPage'
import { MyProtocolsPage } from '@/pages/protocols/MyProtocolsPage'
import { MyProtocolDetailPage } from '@/pages/protocols/MyProtocolDetailPage'
import { UsersListPage } from '@/pages/users/UsersListPage'
import { ResearchLinesListPage } from '@/pages/research-lines/ResearchLinesListPage'

export function App() {
  return (
    <AppProviders>
      <BrowserRouter>
        <Routes>
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
          </Route>

          <Route
            element={
              <RequireAuth roles={['ADMIN']}>
                <AdminLayout />
              </RequireAuth>
            }
          >
            <Route path="/" element={<DashboardPage />} />
            <Route path="/protocolos" element={<ProtocolsListPage />} />
            <Route path="/protocolos/nuevo" element={<ProtocolWizardPage />} />
            <Route path="/protocolos/:id" element={<ProtocolDetailPage />} />
            <Route path="/investigadores" element={<ResearchersListPage />} />
            <Route path="/instituciones" element={<InstitutionsListPage />} />
            <Route path="/destinos" element={<DestinationsListPage />} />
            <Route path="/modalidades" element={<ModalitiesListPage />} />
            <Route path="/disenos-estudio" element={<StudyDesignsListPage />} />
            <Route path="/convenios" element={<AgreementsListPage />} />
            <Route path="/lineas-investigacion" element={<ResearchLinesListPage />} />
            <Route path="/usuarios" element={<UsersListPage />} />
          </Route>

          <Route
            element={
              <RequireAuth roles={['RESEARCHER']}>
                <ResearcherLayout />
              </RequireAuth>
            }
          >
            <Route path="/mis-protocolos" element={<MyProtocolsPage />} />
            <Route path="/mis-protocolos/:id" element={<MyProtocolDetailPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AppProviders>
  )
}
