import { motion } from 'framer-motion'
import { CheckCircle2, Clock, Calendar, Zap } from 'lucide-react'

function DashboardStats({ stats }) {
  const items = [
    {
      label: 'Overall Progress',
      value: `${stats.progressPercent}%`,
      sub: `${stats.completedTopics} / ${stats.totalTopics} topics`,
      icon: CheckCircle2,
      color: 'var(--color-success)',
      bg: 'var(--color-success-light)',
    },
    {
      label: 'Hours to Go',
      value: stats.hoursRemaining,
      sub: 'Est. study time remaining',
      icon: Zap,
      color: 'var(--color-highlight)',
      bg: 'var(--color-highlight-light)',
    },
    {
      label: 'Countdown',
      value: `${stats.daysRemaining} days`,
      sub: 'Until exam date',
      icon: Calendar,
      color: 'var(--color-accent)',
      bg: 'var(--color-accent-light)',
    },
  ]

  return (
    <div className="dashboard-stats-grid">
      {items.map((item, idx) => (
        <motion.div
          key={item.label}
          className="stat-card card-elevated"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.1 }}
        >
          <div className="stat-card-header">
            <div className="stat-icon-wrapper" style={{ backgroundColor: item.bg, color: item.color }}>
              <item.icon size={20} />
            </div>
            <span className="stat-label">{item.label}</span>
          </div>
          <div className="stat-card-body">
            <h3 className="stat-value">{item.value}</h3>
            <p className="stat-sub">{item.sub}</p>
          </div>
        </motion.div>
      ))}

      <style>{`
        .dashboard-stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2.5rem;
        }
        .stat-card {
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }
        .stat-card-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .stat-icon-wrapper {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .stat-label {
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--color-text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.02em;
        }
        .stat-value {
          font-size: 2rem;
          font-weight: 700;
          margin-bottom: 0.25rem;
          color: var(--color-text-primary);
        }
        .stat-sub {
          font-size: 0.875rem;
          color: var(--color-text-muted);
        }
      `}</style>
    </div>
  )
}

export default DashboardStats
