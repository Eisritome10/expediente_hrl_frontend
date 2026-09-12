import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppProviders } from '@/app/providers'
import { RequireAuth } from '@/app/RequireAuth'
import { AuthLayout } from '@/layouts/AuthLayout'
import { AdminLayout } from '@/layouts/AdminLayout'
import { LoginPage } from '@/pages/auth/LoginPage'
import { DashboardPage } from '@/pages/dashboard/DashboardPage'
import { ResearchersListPage } from '@/pages/researchers/ResearchersListPage'
import { InstitutionsListPage } from '@/pages/institutions/InstitutionsListPage'
import { FacultiesListPage } from '@/pages/faculties/FacultiesListPage'
import { DestinationsListPage } from '@/pages/destinations/DestinationsListPage'
import { ModalitiesListPage } from '@/pages/modalities/ModalitiesListPage'

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
              <RequireAuth>
                <AdminLayout />
              </RequireAuth>
            }
          >
            <Route path="/" element={<DashboardPage />} />
            <Route path="/investigadores" element={<ResearchersListPage />} />
            <Route path="/instituciones" element={<InstitutionsListPage />} />
            <Route path="/facultades" element={<FacultiesListPage />} />
            <Route path="/destinos" element={<DestinationsListPage />} />
            <Route path="/modalidades" element={<ModalitiesListPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AppProviders>
  )
}
