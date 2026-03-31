import { useUser } from '@clerk/clerk-react'
import SubjectOnboarding from '../components/SubjectOnboarding'
import ExamTimingPicker from '../components/ExamTimingPicker'
import TextSyllabusInput from '../components/TextSyllabusInput'
import MediaSyllabusUploader from '../components/MediaSyllabusUploader'

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

      <div className="onboarding-stack">
        <SubjectOnboarding />
        <ExamTimingPicker />
        <TextSyllabusInput />
        <MediaSyllabusUploader />
      </div>
    </div>
  )
}

export default DashboardPage
