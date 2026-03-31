import { useUser } from '@clerk/clerk-react'
import SubjectOnboarding from '../components/SubjectOnboarding'

function DashboardPage() {
  const { user } = useUser()

  return (
    <div className="app-container">
      <section className="dashboard-welcome">
        <h1 className="dashboard-welcome-title">
          Welcome, {user?.firstName}
        </h1>
        <p className="dashboard-welcome-subtitle">
          Start by picking the subject you want to master.
        </p>
      </section>

      <SubjectOnboarding />
    </div>
  )
}

export default DashboardPage
