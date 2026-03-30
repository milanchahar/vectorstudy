import { useUser } from '@clerk/clerk-react'

function DashboardPage() {
  const { user } = useUser()

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', flexDirection: 'column', gap: '1rem' }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', color: 'var(--color-text-primary)' }}>
        Welcome, {user?.firstName}
      </h1>
      <p style={{ color: 'var(--color-text-secondary)' }}>Dashboard coming in Section 13.</p>
      <span className="badge badge-success">Authenticated</span>
    </div>
  )
}

export default DashboardPage
