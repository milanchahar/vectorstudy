import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  AlertCircle,
  BookOpen,
  Calendar,
  CheckCircle2,
  Loader2,
  Sparkles,
  Target,
  Zap,
} from 'lucide-react'
import { fetchActiveExam } from '../lib/examData'

const DIFFICULTY_COLORS = {
  EASY: 'var(--color-success)',
  MEDIUM: 'var(--color-highlight)',
  HARD: 'var(--color-accent)',
}

function round(value) {
  return Math.round(value * 10) / 10
}

function AnalyticsPage() {
  const MotionDiv = motion.div
  const [exam, setExam] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadAnalytics() {
      setLoading(true)
      const { exam: activeExam, error: fallbackError } = await fetchActiveExam({
        fallbackMessage: 'Showing sample analytics because the server could not be reached.',
      })
      setExam(activeExam)
      setError(fallbackError)
      setLoading(false)
    }

    loadAnalytics()
  }, [])

  const analytics = useMemo(() => {
    if (!exam?.topics?.length) return null

    const topics = [...exam.topics].sort((a, b) => a.dayAssigned - b.dayAssigned)
    const totalWeightage = topics.reduce((sum, topic) => sum + topic.weightage, 0)
    const completedWeightage = topics
      .filter(topic => topic.isCompleted)
      .reduce((sum, topic) => sum + topic.weightage, 0)
    const totalHours = topics.reduce((sum, topic) => sum + topic.studyHours, 0)
    const completedHours = topics
      .filter(topic => topic.isCompleted)
      .reduce((sum, topic) => sum + topic.studyHours, 0)

    let idealWeightage = 0
    let actualWeightage = 0

    const topicsByDay = topics.reduce((acc, topic) => {
      const dayKey = topic.dayAssigned
      if (!acc[dayKey]) acc[dayKey] = []
      acc[dayKey].push(topic)
      return acc
    }, {})

    const masteryTimeline = Object.keys(topicsByDay)
      .sort((a, b) => Number(a) - Number(b))
      .map(dayKey => {
        const dayTopics = topicsByDay[dayKey]
        idealWeightage += dayTopics.reduce((sum, topic) => sum + topic.weightage, 0)
        actualWeightage += dayTopics
          .filter(topic => topic.isCompleted)
          .reduce((sum, topic) => sum + topic.weightage, 0)

        return {
          name: `Day ${dayKey}`,
          idealMastery: round((idealWeightage / totalWeightage) * 100),
          actualMastery: round((actualWeightage / totalWeightage) * 100),
        }
      })

    const nextPendingDay = topics.find(topic => !topic.isCompleted)?.dayAssigned ?? null
    const targetEntry = nextPendingDay
      ? masteryTimeline.find(entry => entry.name === `Day ${nextPendingDay}`)
      : masteryTimeline[masteryTimeline.length - 1]
    const weightedMastery = totalWeightage > 0
      ? round((completedWeightage / totalWeightage) * 100)
      : 0
    const paceGap = targetEntry
      ? round(targetEntry.idealMastery - weightedMastery)
      : 0

    const difficultyBreakdown = ['EASY', 'MEDIUM', 'HARD'].map(difficulty => {
      const group = topics.filter(topic => topic.difficulty === difficulty)
      const weightage = group.reduce((sum, topic) => sum + topic.weightage, 0)
      const completed = group.filter(topic => topic.isCompleted).length

      return {
        difficulty,
        count: group.length,
        completed,
        weightage,
      }
    })

    const upcomingTopics = topics.filter(topic => !topic.isCompleted).slice(0, 3)

    return {
      totalWeightage,
      completedWeightage,
      totalHours: round(totalHours),
      completedHours: round(completedHours),
      weightedMastery,
      paceGap,
      masteryTimeline,
      difficultyBreakdown,
      upcomingTopics,
    }
  }, [exam])

  if (loading) {
    return (
      <div className="analytics-loading">
        <Loader2 className="animate-spin text-accent" size={34} />
        <p>Mapping your mastery curve...</p>
      </div>
    )
  }

  if (!exam || !analytics) {
    return (
      <div className="analytics-empty app-container">
        <MotionDiv
          className="card-elevated analytics-empty-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="analytics-empty-icon">
            <BookOpen size={46} className="text-muted" />
          </div>
          <h2>No analytics yet</h2>
          <p>Create a study plan first to unlock your mastery timeline.</p>
          <Link to="/syllabus" className="btn btn-primary btn-lg">
            <Sparkles size={18} />
            Generate Study Plan
          </Link>
        </MotionDiv>
      </div>
    )
  }

  const summaryItems = [
    {
      label: 'Weighted Mastery',
      value: `${analytics.weightedMastery}%`,
      sub: `${analytics.completedWeightage}% of syllabus weight covered`,
      icon: Target,
    },
    {
      label: 'Topic Completion',
      value: `${exam.stats.progressPercent}%`,
      sub: `${exam.stats.completedTopics} of ${exam.stats.totalTopics} topics done`,
      icon: CheckCircle2,
    },
    {
      label: 'Study Hours Used',
      value: `${analytics.completedHours}h`,
      sub: `${analytics.totalHours}h total planned`,
      icon: Zap,
    },
    {
      label: 'Days Remaining',
      value: `${exam.stats.daysRemaining}`,
      sub: 'Until the exam window closes',
      icon: Calendar,
    },
  ]

  return (
    <div className="analytics-page app-container">
      <header className="analytics-header">
        <div>
          <p className="analytics-eyebrow">Section 18</p>
          <h1 className="analytics-title">Vector Analytics</h1>
          <p className="analytics-subtitle">
            Track how much of the syllabus you have truly mastered, not just how many tasks you checked off.
          </p>
        </div>
        <div className="analytics-header-meta">
          <span className="analytics-subject-pill">{exam.subject}</span>
          <span className="analytics-date-pill">
            Exam {new Date(exam.examDate).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </span>
        </div>
      </header>

      {error && (
        <div className="error-banner analytics-banner">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      <section className="analytics-summary-grid">
        {summaryItems.map((item, index) => (
          <MotionDiv
            key={item.label}
            className="card-elevated analytics-stat-card"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.07 }}
          >
            <div className="analytics-stat-header">
              <div className="analytics-stat-icon">
                <item.icon size={18} />
              </div>
              <span className="analytics-stat-label">{item.label}</span>
            </div>
            <div className="analytics-stat-value">{item.value}</div>
            <p className="analytics-stat-sub">{item.sub}</p>
          </MotionDiv>
        ))}
      </section>

      <section className="analytics-main-grid">
        <MotionDiv
          className="card-elevated analytics-chart-card"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="analytics-card-header">
            <div>
              <h2 className="analytics-card-title">Syllabus Mastery Over Time</h2>
              <p className="analytics-card-subtitle">
                Ideal mastery follows the plan. Actual mastery reflects completed weighted topics.
              </p>
            </div>
            <div className="analytics-pace-chip">
              {analytics.paceGap <= 0 ? 'On pace' : `${analytics.paceGap}% behind plan`}
            </div>
          </div>

          <div className="analytics-chart-shell">
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart
                data={analytics.masteryTimeline}
                margin={{ top: 10, right: 12, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="masteryActualFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-accent)" stopOpacity={0.18} />
                    <stop offset="95%" stopColor="var(--color-accent)" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--color-border)" vertical={false} strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: 'var(--color-text-muted)' }}
                  dy={8}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  domain={[0, 100]}
                  tick={{ fontSize: 12, fill: 'var(--color-text-muted)' }}
                  tickFormatter={value => `${value}%`}
                />
                <Tooltip
                  formatter={value => `${value}%`}
                  contentStyle={{
                    borderRadius: '14px',
                    border: '1px solid var(--color-border)',
                    boxShadow: 'var(--shadow-md)',
                    padding: '10px 14px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="idealMastery"
                  name="Planned mastery"
                  stroke="var(--color-border-strong)"
                  strokeWidth={2}
                  fillOpacity={0}
                />
                <Area
                  type="monotone"
                  dataKey="actualMastery"
                  name="Actual mastery"
                  stroke="var(--color-accent)"
                  strokeWidth={3}
                  fill="url(#masteryActualFill)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </MotionDiv>

        <MotionDiv
          className="analytics-side-column"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.28 }}
        >
          <div className="card-elevated analytics-panel">
            <div className="analytics-card-header">
              <div>
                <h2 className="analytics-card-title">Difficulty Mix</h2>
                <p className="analytics-card-subtitle">Where the syllabus weight is concentrated.</p>
              </div>
            </div>
            <div className="difficulty-list">
              {analytics.difficultyBreakdown.map(item => (
                <div key={item.difficulty} className="difficulty-row">
                  <div className="difficulty-row-top">
                    <span className="difficulty-name">{item.difficulty}</span>
                    <span className="difficulty-meta">{item.weightage}% weight</span>
                  </div>
                  <div className="difficulty-bar-track">
                    <div
                      className="difficulty-bar-fill"
                      style={{
                        width: `${item.weightage}%`,
                        backgroundColor: DIFFICULTY_COLORS[item.difficulty],
                      }}
                    />
                  </div>
                  <div className="difficulty-row-bottom">
                    <span>{item.count} topics</span>
                    <span>{item.completed} completed</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card-elevated analytics-panel">
            <div className="analytics-card-header">
              <div>
                <h2 className="analytics-card-title">Next Focus</h2>
                <p className="analytics-card-subtitle">The next topics that move mastery fastest.</p>
              </div>
            </div>
            <div className="upcoming-topic-list">
              {analytics.upcomingTopics.map(topic => (
                <div key={topic.id} className="upcoming-topic-card">
                  <div className="upcoming-topic-top">
                    <h3 className="upcoming-topic-name">{topic.name}</h3>
                    <span className="upcoming-topic-weight">{topic.weightage}%</span>
                  </div>
                  <div className="upcoming-topic-bottom">
                    <span className={`badge badge-${topic.difficulty.toLowerCase()}`}>
                      {topic.difficulty}
                    </span>
                    <span className="upcoming-topic-hours">{topic.studyHours}h planned</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </MotionDiv>
      </section>

      <style>{`
        .analytics-page {
          padding-top: 2.5rem;
          padding-bottom: 6rem;
        }
        .analytics-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 2rem;
          margin-bottom: 2rem;
        }
        .analytics-eyebrow {
          font-size: 0.8rem;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--color-accent);
          margin-bottom: 0.85rem;
        }
        .analytics-title {
          font-size: 2.75rem;
          letter-spacing: -0.03em;
          margin-bottom: 0.75rem;
        }
        .analytics-subtitle {
          max-width: 60ch;
          font-size: 1rem;
          color: var(--color-text-secondary);
        }
        .analytics-header-meta {
          display: flex;
          gap: 0.75rem;
          flex-wrap: wrap;
          justify-content: flex-end;
        }
        .analytics-subject-pill,
        .analytics-date-pill,
        .analytics-pace-chip {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 40px;
          padding: 0.65rem 1rem;
          border-radius: 999px;
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          color: var(--color-text-secondary);
          font-size: 0.875rem;
          font-weight: 600;
        }
        .analytics-pace-chip {
          background: var(--color-accent-light);
          border-color: transparent;
          color: var(--color-accent);
        }
        .analytics-banner {
          margin-bottom: 1.5rem;
        }
        .analytics-summary-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 1rem;
          margin-bottom: 1.5rem;
        }
        .analytics-stat-card {
          padding: 1.35rem;
        }
        .analytics-stat-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1.1rem;
        }
        .analytics-stat-icon {
          width: 2.25rem;
          height: 2.25rem;
          border-radius: 0.8rem;
          background: var(--color-surface-muted);
          color: var(--color-accent);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .analytics-stat-label {
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--color-text-secondary);
        }
        .analytics-stat-value {
          font-family: var(--font-display);
          font-size: 2rem;
          line-height: 1;
          margin-bottom: 0.55rem;
        }
        .analytics-stat-sub {
          font-size: 0.9rem;
          color: var(--color-text-muted);
        }
        .analytics-main-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.6fr) minmax(320px, 0.9fr);
          gap: 1.5rem;
          align-items: start;
        }
        .analytics-chart-card,
        .analytics-panel {
          padding: 1.5rem;
        }
        .analytics-side-column {
          display: grid;
          gap: 1.5rem;
        }
        .analytics-card-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }
        .analytics-card-title {
          font-size: 1.25rem;
          margin-bottom: 0.35rem;
        }
        .analytics-card-subtitle {
          font-size: 0.9rem;
          color: var(--color-text-secondary);
        }
        .analytics-chart-shell {
          width: 100%;
          min-height: 320px;
        }
        .difficulty-list,
        .upcoming-topic-list {
          display: grid;
          gap: 1rem;
        }
        .difficulty-row {
          display: grid;
          gap: 0.45rem;
        }
        .difficulty-row-top,
        .difficulty-row-bottom,
        .upcoming-topic-top,
        .upcoming-topic-bottom {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
        }
        .difficulty-name,
        .upcoming-topic-name {
          font-size: 0.95rem;
          font-weight: 600;
          color: var(--color-text-primary);
        }
        .difficulty-meta,
        .difficulty-row-bottom,
        .upcoming-topic-hours {
          font-size: 0.85rem;
          color: var(--color-text-muted);
        }
        .difficulty-bar-track {
          width: 100%;
          height: 0.5rem;
          border-radius: 999px;
          background: var(--color-surface-muted);
          overflow: hidden;
        }
        .difficulty-bar-fill {
          height: 100%;
          border-radius: 999px;
        }
        .upcoming-topic-card {
          padding: 1rem 1.1rem;
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
          background: var(--color-surface);
        }
        .upcoming-topic-weight {
          font-size: 0.95rem;
          font-weight: 600;
          color: var(--color-accent);
        }
        .analytics-loading,
        .analytics-empty {
          min-height: calc(100vh - 4rem);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          gap: 1.25rem;
          color: var(--color-text-secondary);
        }
        .analytics-empty-card {
          max-width: 520px;
          padding: 3.5rem;
          text-align: center;
        }
        .analytics-empty-card h2 {
          margin-bottom: 0.75rem;
        }
        .analytics-empty-card p {
          margin-bottom: 1.5rem;
        }
        .analytics-empty-icon {
          display: flex;
          justify-content: center;
          margin-bottom: 1.2rem;
        }
        @media (max-width: 1180px) {
          .analytics-summary-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
          .analytics-main-grid {
            grid-template-columns: 1fr;
          }
        }
        @media (max-width: 768px) {
          .analytics-page {
            padding-top: 1.5rem;
          }
          .analytics-header {
            flex-direction: column;
            align-items: flex-start;
          }
          .analytics-title {
            font-size: 2.2rem;
          }
          .analytics-summary-grid {
            grid-template-columns: 1fr;
          }
          .analytics-card-header,
          .upcoming-topic-top,
          .upcoming-topic-bottom {
            flex-direction: column;
            align-items: flex-start;
          }
        }
      `}</style>
    </div>
  )
}

export default AnalyticsPage
