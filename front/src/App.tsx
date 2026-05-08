import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'

import { Layout } from './components/Layout/Layout'
import { ProtectedRoute } from './components/Auth/ProtectedRoute'

import { HomePage } from './pages/HomePage'
import { JobDetailPage } from './pages/JobDetailPage'
import { CalendarPage } from './pages/CalendarPage'
import { ProfilePage } from './pages/ProfilePage'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'

import { useAuthStore } from './store/useAuthStore'
import { useApplicationsStore } from './store/useApplicationsStore'

export default function App() {
  const { isAuthenticated, fetchMe } = useAuthStore()
  const { fetchApplications } = useApplicationsStore()

  useEffect(() => {
    // Restaura sesión si hay token, y con ello las aplicaciones del usuario
    fetchMe()
  }, [])

  useEffect(() => {
    if (isAuthenticated) {
      fetchApplications()
    }
  }, [isAuthenticated])

  // escucha evento global para cerrar sesión (ej. al expirar token)
  useEffect(() => {
    const handler = () => useAuthStore.getState().logout()
    window.addEventListener('auth:logout', handler)
    return () => window.removeEventListener('auth:logout', handler)
  }, [])

  return (
    <BrowserRouter>
      <Toaster
        position='top-right'
        toastOptions={{
          style: {
            background: '#1e2535',
            color: '#e2e8f0',
            border: '1px solid #2d3448',
            fontSize: '13px'
          }
        }}
      />
      <Routes>
        {/* Rutas públicas */}
        <Route path='/login' element={<LoginPage />} />
        <Route path='/register' element={<RegisterPage />} />

        {/* Rutas de la aplicación con layout */}
        <Route
          path='/'
          element={
            <Layout>
              <HomePage />
            </Layout>
          }
        />
        <Route
          path='/jobs/:id'
          element={
            <Layout>
              <JobDetailPage />
            </Layout>
          }
        />
        <Route
          path='/calendar'
          element={
            <Layout>
              <ProtectedRoute>
                <CalendarPage />
              </ProtectedRoute>
            </Layout>
          }
        />
        <Route
          path='/profile'
          element={
            <Layout>
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            </Layout>
          }
        />

        {/* Rutas no encontradas */}
        <Route path='*' element={<Navigate to='/' replace />} />
      </Routes>
    </BrowserRouter>
  )
}
