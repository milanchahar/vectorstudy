import { BrowserRouter, Routes, Route } from 'react-router-dom'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', flexDirection: 'column', gap: '1rem' }}>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '3rem', color: 'var(--color-text-primary)' }}>
              VectorStudy
            </h1>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '1.125rem' }}>
              Adaptive AI Exam Architect — Design system initialized.
            </p>
            <span className="badge badge-accent">Section 1 Complete</span>
          </div>
        } />
      </Routes>
    </BrowserRouter>
  )
}

export default App
