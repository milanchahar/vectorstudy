import { useEffect, useMemo, useState } from 'react'

const STORAGE_KEY = 'vectorstudy_exam_date'

function toISODate(d) {
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function fromISODate(iso) {
  const [y, m, d] = iso.split('-').map(n => Number(n))
  if (!y || !m || !d) return null
  const date = new Date(y, m - 1, d)
  if (Number.isNaN(date.getTime())) return null
  return date
}

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

function addMonths(date, delta) {
  return new Date(date.getFullYear(), date.getMonth() + delta, 1)
}

function daysInMonth(date) {
  const year = date.getFullYear()
  const month = date.getMonth()
  return new Date(year, month + 1, 0).getDate()
}

function MondayIndex(day0Sunday) {
  return (day0Sunday + 6) % 7
}

function ExamTimingPicker() {
  const subjectsReady = true
  const [selectedIso, setSelectedIso] = useState(null)
  const [monthCursor, setMonthCursor] = useState(() => new Date())

  const monthLabel = useMemo(() => {
    const month = monthCursor.toLocaleString(undefined, { month: 'long' })
    const year = monthCursor.getFullYear()
    return `${month} ${year}`
  }, [monthCursor])

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) setSelectedIso(stored)
    } catch {}
  }, [])

  function handlePick(date) {
    const iso = toISODate(date)
    setSelectedIso(iso)
    try {
      localStorage.setItem(STORAGE_KEY, iso)
    } catch {}
  }

  const grid = useMemo(() => {
    const start = startOfMonth(monthCursor)
    const totalDays = daysInMonth(monthCursor)
    const leadingBlanks = MondayIndex(start.getDay())

    const cells = []
    for (let i = 0; i < leadingBlanks; i += 1) cells.push(null)
    for (let day = 1; day <= totalDays; day += 1) {
      const d = new Date(start.getFullYear(), start.getMonth(), day)
      cells.push(d)
    }

    while (cells.length % 7 !== 0) cells.push(null)
    return cells
  }, [monthCursor])

  const selectedDate = selectedIso ? fromISODate(selectedIso) : null

  return (
    <section className="exam-timing">
      <div className="card-elevated exam-timing-card">
        <div className="onboarding-section-header">
          <h2 className="onboarding-section-title">Select your exam date</h2>
          <p className="onboarding-section-subtitle">A simple timeline to anchor your plan.</p>
        </div>

        <div className="exam-calendar">
          <div className="exam-calendar-header">
            <button
              type="button"
              className="exam-nav-btn"
              onClick={() => setMonthCursor(prev => addMonths(prev, -1))}
              aria-label="Previous month"
            >
              <span aria-hidden="true">‹</span>
            </button>
            <div className="exam-month-label" aria-live="polite">{monthLabel}</div>
            <button
              type="button"
              className="exam-nav-btn"
              onClick={() => setMonthCursor(prev => addMonths(prev, 1))}
              aria-label="Next month"
            >
              <span aria-hidden="true">›</span>
            </button>
          </div>

          <div className="exam-weekdays" role="row">
            {WEEKDAYS.map(day => (
              <div key={day} className="exam-weekday" role="columnheader">
                {day}
              </div>
            ))}
          </div>

          <div className="exam-grid" role="grid" aria-label="Exam date calendar">
            {grid.map((d, idx) => {
              const iso = d ? toISODate(d) : null
              const isSelected = iso && selectedIso === iso
              const isDisabled = !d
              const label = d ? d.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' }) : ''

              return (
                <button
                  key={idx}
                  type="button"
                  className={`exam-day ${isSelected ? 'exam-day--selected' : ''}`}
                  onClick={() => d && handlePick(d)}
                  disabled={isDisabled}
                  aria-selected={isSelected}
                  aria-label={label || 'Empty'}
                >
                  {d ? d.getDate() : ''}
                </button>
              )
            })}
          </div>

          <div className="exam-selected-row">
            {selectedDate ? (
              <div className="exam-selected-text">
                Selected: <span className="exam-selected-strong">{selectedDate.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
            ) : (
              <div className="exam-selected-text">No date selected yet.</div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

export default ExamTimingPicker

