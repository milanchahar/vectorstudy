import { useMemo } from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

function ProgressChart({ topics }) {
  const chartData = useMemo(() => {
    if (!topics || topics.length === 0) return []

    const maxDay = Math.max(...topics.map(t => t.dayAssigned))
    const data = []

    let cumulativeTotal = 0
    let cumulativeCompleted = 0

    for (let day = 1; day <= maxDay; day++) {
      const dayTopics = topics.filter(t => t.dayAssigned === day)
      const dayCompleted = dayTopics.filter(t => t.isCompleted).length

      cumulativeTotal += dayTopics.length
      cumulativeCompleted += dayCompleted

      data.push({
        name: `Day ${day}`,
        completed: cumulativeCompleted,
        total: cumulativeTotal,
        percent: Math.round((cumulativeCompleted / cumulativeTotal) * 100),
      })
    }

    return data
  }, [topics])

  return (
    <div className="card-elevated progress-chart-card">
      <div className="chart-header">
        <h3 className="chart-title">Study Velocity</h3>
        <p className="chart-subtitle">Cumulative progress across your study plan</p>
      </div>

      <div className="chart-container" style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorProgress" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-accent)" stopOpacity={0.1} />
                <stop offset="95%" stopColor="var(--color-accent)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: 'var(--color-text-muted)' }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: 'var(--color-text-muted)' }}
            />
            <Tooltip
              contentStyle={{
                borderRadius: '12px',
                border: '1px solid var(--color-border)',
                boxShadow: 'var(--shadow-md)',
                padding: '10px 14px',
              }}
            />
            <Area
              type="monotone"
              dataKey="percent"
              name="Progress %"
              stroke="var(--color-accent)"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorProgress)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <style>{`
        .progress-chart-card {
          padding: 2rem;
          margin-bottom: 2.5rem;
        }
        .chart-header {
          margin-bottom: 2rem;
        }
        .chart-title {
          font-size: 1.25rem;
          margin-bottom: 0.35rem;
        }
        .chart-subtitle {
          font-size: 0.875rem;
          color: var(--color-text-secondary);
        }
      `}</style>
    </div>
  )
}

export default ProgressChart
