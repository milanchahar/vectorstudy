import { ClerkProvider } from '@clerk/clerk-react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import ProtectedRoute from './components/ProtectedRoute'
import AppLayout from './components/AppLayout'
import SubjectOnboarding from './components/SubjectOnboarding'
import ExamTimingPicker from './components/ExamTimingPicker'
import TextSyllabusInput from './components/TextSyllabusInput'

const clerkPublishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

function App() {
  if (!clerkPublishableKey) {
    return (
      <div className="app-layout">
        <header className="app-header">
          <div className="nav-container">
            <div className="nav-brand" role="banner" aria-label="VectorStudy">
              <div className="nav-brand-icon">
                <svg width="20" height="20" viewBox="0 0 32 32" fill="none">
                  <rect width="32" height="32" rx="10" fill="var(--color-accent)" />
                  <path d="M8 22L16 10L24 22" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M11 18H21" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
              </div>
              <span className="nav-brand-name">VectorStudy</span>
            </div>
          </div>
        </header>

        <main className="app-main">
          <div className="app-container">
            <div className="card-elevated" style={{ marginBottom: '1.5rem', padding: '1rem 1.25rem' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: '0.35rem' }}>
                Preview mode
              </div>
              <div style={{ color: 'var(--color-text-secondary)', lineHeight: 1.7 }}>
                Add `VITE_CLERK_PUBLISHABLE_KEY` in `.env.local` to enable Google auth. Section UI is visible below.
              </div>
            </div>

            <div className="onboarding-stack">
              <SubjectOnboarding />
              <ExamTimingPicker />
              <TextSyllabusInput />
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <ClerkProvider publishableKey={clerkPublishableKey}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <DashboardPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/roadmap"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <div className="page-placeholder">Roadmap — Section 14</div>
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/analytics"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <div className="page-placeholder">Analytics — Section 18</div>
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </ClerkProvider>
  )
}

export default App
