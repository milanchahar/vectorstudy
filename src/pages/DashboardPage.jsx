import { useUser } from '@clerk/clerk-react'
import SubjectOnboarding from '../components/SubjectOnboarding'
import ExamTimingPicker from '../components/ExamTimingPicker'
import TextSyllabusInput from '../components/TextSyllabusInput'
import MediaSyllabusUploader from '../components/MediaSyllabusUploader'

import { useNavigate } from 'react-router-dom'
import { Sparkles } from 'lucide-react'

function DashboardPage() {
  const { user } = useUser()
  const navigate = useNavigate()

  return (
    <div className="app-container dashboard-page">
      <section className="dashboard-welcome">
        <div className="welcome-content">
          <h1 className="dashboard-welcome-title">
            Hey {user?.firstName}, ready to study?
          </h1>
          <p className="dashboard-welcome-subtitle">
            Let's build a smart roadmap for your next exam.
          </p>
        </div>
        <button className="btn btn-primary btn-lg welcome-cta" onClick={() => navigate('/syllabus')}>
          <Sparkles size={18} />
          <span>Create New Study Plan</span>
        </button>
      </section>

      <div className="dashboard-grid">
        <div className="card-elevated stats-placeholder">
          <p>Your active plans will appear here once generated.</p>
        </div>
      </div>

      <style>{`
        .dashboard-welcome {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 4rem;
          padding-bottom: 3rem;
          gap: 2rem;
        }
        .welcome-cta {
          flex-shrink: 0;
          height: fit-content;
        }
        .dashboard-grid {
          margin-top: 2rem;
        }
        .stats-placeholder {
          padding: 4rem;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--color-text-muted);
          text-align: center;
          border-style: dashed;
        }
        @media (max-width: 768px) {
          .dashboard-welcome {
            flex-direction: column;
            align-items: flex-start;
          }
        }
      `}</style>
    </div>
  )
}

export default DashboardPage
