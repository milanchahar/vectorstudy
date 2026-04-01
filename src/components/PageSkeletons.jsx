import LoadingBlock from './LoadingBlock'

export function DashboardSkeleton() {
  return (
    <div className="app-container dashboard-page-skeleton">
      <section className="dashboard-skeleton-header">
        <div className="dashboard-skeleton-copy">
          <LoadingBlock className="skeleton-line skeleton-line-title" />
          <LoadingBlock className="skeleton-line skeleton-line-body" />
        </div>
        <LoadingBlock className="skeleton-button" />
      </section>

      <section className="dashboard-skeleton-stats">
        {[1, 2, 3].map(item => (
          <div key={item} className="card-elevated skeleton-card stat-skeleton-card">
            <div className="skeleton-card-row">
              <LoadingBlock className="skeleton-avatar" />
              <LoadingBlock className="skeleton-line skeleton-line-label" />
            </div>
            <LoadingBlock className="skeleton-line skeleton-line-metric" />
            <LoadingBlock className="skeleton-line skeleton-line-caption" />
          </div>
        ))}
      </section>

      <section className="dashboard-skeleton-main">
        <div className="card-elevated skeleton-card skeleton-chart-card">
          <LoadingBlock className="skeleton-line skeleton-line-heading" />
          <LoadingBlock className="skeleton-line skeleton-line-body short" />
          <LoadingBlock className="skeleton-chart" />
        </div>
        <div className="card-elevated skeleton-card skeleton-side-card">
          <LoadingBlock className="skeleton-line skeleton-line-heading" />
          <LoadingBlock className="skeleton-line skeleton-line-body short" />
          <LoadingBlock className="skeleton-line skeleton-line-body" />
          <LoadingBlock className="skeleton-button small" />
        </div>
      </section>
    </div>
  )
}

export function RoadmapSkeleton() {
  return (
    <div className="roadmap-page app-container roadmap-page-skeleton">
      <section className="roadmap-skeleton-header">
        <div className="roadmap-skeleton-copy">
          <LoadingBlock className="skeleton-line skeleton-line-title" />
          <LoadingBlock className="skeleton-line skeleton-line-body" />
        </div>
        <LoadingBlock className="skeleton-button small" />
      </section>

      <div className="timeline-skeleton">
        {[1, 2, 3].map(day => (
          <div key={day} className="timeline-skeleton-day">
            <div className="timeline-skeleton-sidebar">
              <LoadingBlock className="skeleton-line skeleton-line-label narrow" />
              <LoadingBlock className="timeline-skeleton-line" />
            </div>
            <div className="timeline-skeleton-cards">
              {[1, 2].map(card => (
                <div key={card} className="card skeleton-card timeline-skeleton-card">
                  <div className="skeleton-card-row">
                    <LoadingBlock className="skeleton-line skeleton-line-heading" />
                    <LoadingBlock className="skeleton-avatar small" />
                  </div>
                  <div className="skeleton-card-row">
                    <LoadingBlock className="skeleton-pill" />
                    <LoadingBlock className="skeleton-line skeleton-line-caption short" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function AnalyticsSkeleton() {
  return (
    <div className="analytics-page app-container analytics-page-skeleton">
      <section className="analytics-skeleton-header">
        <div className="analytics-skeleton-copy">
          <LoadingBlock className="skeleton-line skeleton-line-label narrow" />
          <LoadingBlock className="skeleton-line skeleton-line-title" />
          <LoadingBlock className="skeleton-line skeleton-line-body" />
        </div>
        <div className="analytics-skeleton-meta">
          <LoadingBlock className="skeleton-pill wide" />
          <LoadingBlock className="skeleton-pill wide" />
        </div>
      </section>

      <section className="analytics-skeleton-stats">
        {[1, 2, 3, 4].map(item => (
          <div key={item} className="card-elevated skeleton-card analytics-skeleton-card">
            <div className="skeleton-card-row">
              <LoadingBlock className="skeleton-avatar" />
              <LoadingBlock className="skeleton-line skeleton-line-label" />
            </div>
            <LoadingBlock className="skeleton-line skeleton-line-metric" />
            <LoadingBlock className="skeleton-line skeleton-line-caption" />
          </div>
        ))}
      </section>

      <section className="analytics-skeleton-main">
        <div className="card-elevated skeleton-card analytics-skeleton-chart">
          <LoadingBlock className="skeleton-line skeleton-line-heading" />
          <LoadingBlock className="skeleton-line skeleton-line-body short" />
          <LoadingBlock className="skeleton-chart tall" />
        </div>
        <div className="analytics-skeleton-side">
          {[1, 2].map(panel => (
            <div key={panel} className="card-elevated skeleton-card analytics-skeleton-panel">
              <LoadingBlock className="skeleton-line skeleton-line-heading" />
              <LoadingBlock className="skeleton-line skeleton-line-body short" />
              <LoadingBlock className="skeleton-line skeleton-line-body" />
              <LoadingBlock className="skeleton-line skeleton-line-body" />
              <LoadingBlock className="skeleton-line skeleton-line-body short" />
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
