import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import axios from 'axios'
import { 
  Calendar, 
  Map as MapIcon, 
  CheckCircle2, 
  Circle, 
  Clock, 
  AlertCircle, 
  Sparkles
} from 'lucide-react'
import { API_BASE_URL, fetchActiveExam } from '../lib/examData'
import { RoadmapSkeleton } from '../components/PageSkeletons'

function RoadmapPage() {
  const MotionDiv = motion.div
  const isLoaded = true
  const [exam, setExam] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!isLoaded) return

    const loadRoadmap = async () => {
      try {
        setLoading(true)
        setError(null)
        const { exam: activeExam, error: fallbackError } = await fetchActiveExam({
          fallbackMessage: 'Showing sample roadmap because the server could not be reached.',
        })
        setExam(activeExam)
        setError(fallbackError)
      } finally {
        setLoading(false)
      }
    }

    loadRoadmap()
  }, [isLoaded])

  const handleToggleComplete = async (topicId, currentStatus) => {
    try {
      const nextStatus = !currentStatus
      // Optimistic UI update
      setExam(prev => ({
        ...prev,
        topics: prev.topics.map(t => t.id === topicId ? { ...t, isCompleted: nextStatus } : t)
      }))

      await axios.patch(`${API_BASE_URL}/exams/topics/${topicId}`, {
        isCompleted: nextStatus
      })
    } catch (err) {
      console.error('Failed to update topic status:', err)
      // Revert if failed
      setExam(prev => ({
        ...prev,
        topics: prev.topics.map(t => t.id === topicId ? { ...t, isCompleted: currentStatus } : t)
      }))
    }
  }

  const groupedTopics = useMemo(() => {
    if (!exam?.topics) return {}
    return exam.topics.reduce((acc, topic) => {
      const day = topic.dayAssigned
      if (!acc[day]) acc[day] = []
      acc[day].push(topic)
      return acc
    }, {})
  }, [exam])

  const days = useMemo(() => {
    return Object.keys(groupedTopics).sort((a, b) => Number(a) - Number(b))
  }, [groupedTopics])

  if (loading) {
    return <RoadmapSkeleton />
  }

  if (!exam) {
    return (
      <div className="roadmap-empty app-container">
        <MotionDiv 
          className="card-elevated empty-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="empty-icon-wrapper">
            <MapIcon size={48} className="text-muted" />
          </div>
          <h2>No active roadmap found</h2>
          <p>You haven't generated a study plan yet. Upload your syllabus to get started.</p>
          <Link to="/syllabus" className="btn btn-primary btn-lg">
            <Sparkles size={18} />
            Generate Study Plan
          </Link>
        </MotionDiv>
      </div>
    )
  }

  return (
    <div className="roadmap-page app-container">
      <header className="roadmap-header">
        <div className="header-content">
          <h1 className="roadmap-title">{exam.subject} Roadmap</h1>
          <div className="header-meta">
            <div className="meta-item">
              <Calendar size={16} />
              <span>Exam: {new Date(exam.examDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            </div>
            <div className="meta-item">
              <Clock size={16} />
              <span>{exam.topics.length} Topics total</span>
            </div>
          </div>
        </div>
        <div className="header-actions">
          <button className="btn btn-ghost btn-sm">Edit Plan</button>
        </div>
      </header>

      {error && (
        <div className="error-banner">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      <div className="timeline-container">
        {days.map((dayNum, idx) => (
          <MotionDiv 
            key={dayNum} 
            className="timeline-day"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <div className="day-sidebar">
              <div className="day-number">Day {dayNum}</div>
              <div className="day-line" />
            </div>
            <div className="day-content">
              <div className="topics-grid">
                {groupedTopics[dayNum].map((topic) => (
                  <div key={topic.id} className="topic-card card">
                    <div className="topic-card-header">
                      <h3 className="topic-name">{topic.name}</h3>
                      <button 
                        className="complete-toggle" 
                        aria-label="Mark as complete"
                        onClick={() => handleToggleComplete(topic.id, topic.isCompleted)}
                      >
                        {topic.isCompleted ? (
                          <CheckCircle2 size={22} className="text-success" />
                        ) : (
                          <Circle size={22} className="text-muted" />
                        )}
                      </button>
                    </div>
                    <div className="topic-card-body">
                      <div className="topic-meta">
                        <span className={`difficulty-badge badge-${topic.difficulty.toLowerCase()}`}>
                          {topic.difficulty}
                        </span>
                        <div className="study-hours">
                          <Clock size={14} />
                          <span>{topic.studyHours}h</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </MotionDiv>
        ))}
      </div>

      <style>{`
        .roadmap-page {
          padding-top: 2rem;
          padding-bottom: 6rem;
        }
        .roadmap-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: 3rem;
          padding-bottom: 2rem;
          border-bottom: 1px solid var(--color-border);
        }
        .roadmap-title {
          font-size: 2.25rem;
          margin-bottom: 0.75rem;
        }
        .header-meta {
          display: flex;
          gap: 1.5rem;
          color: var(--color-text-secondary);
        }
        .meta-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.9375rem;
        }

        .roadmap-loading {
          height: calc(100vh - 4rem);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 1.5rem;
          color: var(--color-text-secondary);
        }

        .roadmap-empty {
          height: calc(100vh - 8rem);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .empty-card {
          padding: 4rem;
          text-align: center;
          max-width: 500px;
        }
        .empty-icon-wrapper {
          margin-bottom: 1.5rem;
        }
        .empty-card h2 {
          margin-bottom: 1rem;
        }
        .empty-card p {
          margin-bottom: 2rem;
        }

        .timeline-container {
          display: flex;
          flex-direction: column;
          gap: 0;
          max-width: 1000px;
        }
        .timeline-day {
          display: flex;
          gap: 2rem;
        }
        .day-sidebar {
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 80px;
          flex-shrink: 0;
        }
        .day-number {
          padding: 0.5rem 1rem;
          background: var(--color-surface-muted);
          border-radius: var(--radius-md);
          font-weight: 700;
          font-size: 0.875rem;
          color: var(--color-text-primary);
          border: 1px solid var(--color-border);
          white-space: nowrap;
        }
        .day-line {
          flex: 1;
          width: 2px;
          background: var(--color-border);
          margin: 0.5rem 0;
        }
        .timeline-day:last-child .day-line {
          display: none;
        }

        .day-content {
          flex: 1;
          padding-bottom: 3rem;
        }
        .topics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1.25rem;
        }
        .topic-card {
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .topic-card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 1rem;
        }
        .topic-name {
          font-size: 1.0625rem;
          font-weight: 600;
          line-height: 1.4;
        }
        .complete-toggle {
          background: none;
          border: none;
          padding: 0;
          cursor: pointer;
          transition: transform 0.2s ease;
        }
        .complete-toggle:hover {
          transform: scale(1.1);
        }
        .topic-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .study-hours {
          display: flex;
          align-items: center;
          gap: 0.375rem;
          font-size: 0.8125rem;
          color: var(--color-text-muted);
          font-weight: 500;
        }

        .error-banner {
          background: var(--color-danger-light);
          color: var(--color-danger);
          padding: 1rem 1.5rem;
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 2rem;
        }

        .animate-spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @media (max-width: 640px) {
          .roadmap-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 1.5rem;
          }
          .timeline-day {
            gap: 1rem;
          }
          .day-sidebar {
            width: 60px;
          }
          .day-number {
            font-size: 0.75rem;
            padding: 0.375rem 0.75rem;
          }
        }
      `}</style>
    </div>
  )
}

export default RoadmapPage
