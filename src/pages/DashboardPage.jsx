import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sparkles, ArrowRight, Loader2, BookOpen } from 'lucide-react'
import axios from 'axios'
import DashboardStats from '../components/DashboardStats'
import ProgressChart from '../components/ProgressChart'

const API_BASE_URL = 'http://localhost:4000/api'
const DEMO_USER = { id: 'demo-user', firstName: 'John' }
const DEMO_USER_ID = DEMO_USER.id

function DashboardPage() {
  const user = DEMO_USER
  const isLoaded = true
  const navigate = useNavigate()
  const [exam, setExam] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isLoaded) return

    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        const res = await axios.get(`${API_BASE_URL}/exams/active`, {
          headers: { 'x-clerk-id': DEMO_USER_ID }
        })
        setExam(res.data)
      } catch (err) {
        console.error('Failed to load dashboard:', err)
        // DEMO MOCK DATA
        setExam({
          subject: 'Distributed Systems',
          examDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
          topics: [
            { id: '1', name: 'MapReduce Architecture', difficulty: 'HARD', weightage: 30, dayAssigned: 1, studyHours: 2.5, isCompleted: true },
            { id: '2', name: 'Raft Consensus Protocol', difficulty: 'HARD', weightage: 25, dayAssigned: 2, studyHours: 3.0, isCompleted: true },
            { id: '3', name: 'Vector Clocks', difficulty: 'MEDIUM', weightage: 20, dayAssigned: 3, studyHours: 1.5, isCompleted: false },
            { id: '4', name: 'CAP Theorem', difficulty: 'EASY', weightage: 15, dayAssigned: 4, studyHours: 1.0, isCompleted: false },
            { id: '5', name: 'Consistency Models', difficulty: 'MEDIUM', weightage: 10, dayAssigned: 5, studyHours: 2.0, isCompleted: false },
          ],
          stats: {
            totalTopics: 5,
            completedTopics: 2,
            progressPercent: 40,
            daysRemaining: 10,
            hoursRemaining: 4.5,
          }
        })
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [isLoaded])

  const nextTopic = exam?.topics.find(topic => !topic.isCompleted) || null

  if (loading) {
    return (
      <div className="dashboard-loading">
        <Loader2 className="animate-spin text-accent" size={32} />
        <p>Loading your study stats...</p>
      </div>
    )
  }

  return (
    <div className="app-container dashboard-page">
      {!exam ? (
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
      ) : (
        <>
          <section className="dashboard-welcome">
            <div className="welcome-content">
              <h1 className="dashboard-welcome-title">
                {exam.subject} Progress
              </h1>
              <p className="dashboard-welcome-subtitle">
                You've completed {exam.stats.completedTopics} out of {exam.stats.totalTopics} topics. Keep going!
              </p>
            </div>
            <button className="btn btn-ghost" onClick={() => navigate('/roadmap')}>
              View Roadmap <ArrowRight size={16} />
            </button>
          </section>

          <DashboardStats stats={exam.stats} />
          
          <div className="dashboard-main-grid">
            <div className="chart-wrapper">
              <ProgressChart topics={exam.topics} />
            </div>
            <div className="recent-card-wrapper">
              <div className="card-elevated recent-card">
                <div className="recent-header">
                  <BookOpen size={18} className="text-secondary" />
                  <h3 className="section-title">Up Next</h3>
                </div>
                <div className="next-topic-info">
                  {nextTopic ? (
                    <>
                      <h4 className="next-topic-name">{nextTopic.name}</h4>
                      <p className="next-topic-meta">
                        Day {nextTopic.dayAssigned} • {nextTopic.studyHours} hours
                      </p>
                      <button className="btn btn-primary btn-sm mt-4" onClick={() => navigate('/roadmap')}>
                        Go to Timeline
                      </button>
                    </>
                  ) : (
                    <p className="success-text">All topics completed! 🎉</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

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
        .dashboard-loading {
          height: calc(100vh - 8rem);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 1.5rem;
          color: var(--color-text-secondary);
        }
        .dashboard-main-grid {
          display: grid;
          grid-template-columns: 1fr 320px;
          gap: 1.5rem;
          margin-bottom: 4rem;
        }
        .recent-card {
          padding: 1.5rem;
          height: 100%;
        }
        .recent-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1.5rem;
        }
        .section-title {
          font-size: 1.125rem;
          font-weight: 600;
        }
        .next-topic-name {
          font-size: 1rem;
          font-weight: 600;
          margin-bottom: 0.25rem;
        }
        .next-topic-meta {
          font-size: 0.875rem;
          color: var(--color-text-muted);
        }
        .mt-4 { margin-top: 1.25rem; }
        .success-text {
          color: var(--color-success);
          font-weight: 600;
        }
        @media (max-width: 1024px) {
          .dashboard-main-grid {
            grid-template-columns: 1fr;
          }
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
