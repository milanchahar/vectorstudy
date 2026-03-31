import { useEffect, useMemo, useState } from 'react'

const STORAGE_KEY = 'vectorstudy_subject'

const SUBJECTS = [
  { id: 'dsa', label: 'DSA', description: 'Algorithms & problem solving' },
  { id: 'dbms', label: 'DBMS', description: 'Schemas, queries, normalization' },
  { id: 'os', label: 'OS', description: 'Processes, memory, scheduling' },
  { id: 'cn', label: 'Computer Networks', description: 'Routing, protocols, TCP/IP' },
  { id: 'coa', label: 'COA', description: 'Datapath, pipelining, performance' },
  { id: 'oop', label: 'OOP', description: 'Abstraction, classes, design' },
]

function SubjectOnboarding() {
  const subjects = useMemo(() => SUBJECTS, [])
  const [selectedId, setSelectedId] = useState(null)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored && subjects.some(s => s.id === stored)) {
        setSelectedId(stored)
      }
    } catch {
      setSelectedId(null)
    }
  }, [subjects])

  function handleSelect(id) {
    setSelectedId(id)
    try {
      localStorage.setItem(STORAGE_KEY, id)
    } catch {}
  }

  return (
    <section className="subject-onboarding">
      <div className="card-elevated subject-onboarding-card">
        <div className="subject-onboarding-header">
          <h1 className="subject-onboarding-title">Choose your subject</h1>
          <p className="subject-onboarding-subtitle">
            Select one to tailor your study plan.
          </p>
        </div>

        <div className="subject-grid" role="list">
          {subjects.map(subject => {
            const isSelected = selectedId === subject.id
            return (
              <button
                key={subject.id}
                type="button"
                className={`subject-button ${isSelected ? 'subject-button--selected' : ''}`}
                onClick={() => handleSelect(subject.id)}
                aria-pressed={isSelected}
              >
                <div className="subject-button-top">
                  <span className="subject-label">{subject.label}</span>
                  {isSelected && <span className="subject-selected-chip">Selected</span>}
                </div>
                <span className="subject-description">{subject.description}</span>
              </button>
            )
          })}
        </div>

        <div className="subject-onboarding-footer">
          <div className="subject-status">
            {selectedId ? `Current focus: ${subjects.find(s => s.id === selectedId)?.label}` : 'No subject selected yet'}
          </div>
        </div>
      </div>
    </section>
  )
}

export default SubjectOnboarding

