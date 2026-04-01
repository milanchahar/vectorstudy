import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import axios from 'axios'
import { Sparkles, ArrowLeft, Check, Loader2, Calendar, BookOpen, FileText, ImageUp, NotebookPen, Clock3, Target } from 'lucide-react'

import SubjectOnboarding from '../components/SubjectOnboarding'
import ExamTimingPicker from '../components/ExamTimingPicker'
import TextSyllabusInput from '../components/TextSyllabusInput'
import MediaSyllabusUploader from '../components/MediaSyllabusUploader'
import { API_BASE_URL, DEMO_USER } from '../lib/examData'
import { buildPlanPreview } from '../lib/planPreview'

const STORAGE_SUBJECT = 'vectorstudy_subject'
const STORAGE_EXAM_DATE = 'vectorstudy_exam_date'
const STORAGE_TEXT = 'vectorstudy_syllabus_text'
const STORAGE_MEDIA = 'vectorstudy_syllabus_media_names'

function readStoredValue(key, fallback) {
  try {
    const value = localStorage.getItem(key)
    return value ?? fallback
  } catch {
    return fallback
  }
}

function readStoredMediaNames() {
  try {
    const raw = localStorage.getItem(STORAGE_MEDIA)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed.filter(name => typeof name === 'string' && name.trim()) : []
  } catch {
    return []
  }
}

function buildAnalysisPayload({ subject, syllabusText, mediaNames }) {
  const safeText = syllabusText.trim()
  const safeMediaNames = mediaNames.filter(Boolean)

  if (safeText && safeMediaNames.length) {
    return `${safeText}\n\nUploaded study material references:\n${safeMediaNames.map(name => `- ${name}`).join('\n')}`
  }

  if (safeText) return safeText

  if (safeMediaNames.length) {
    return `Generate an exam topic list for ${subject} using these uploaded syllabus references:\n${safeMediaNames.map(name => `- ${name}`).join('\n')}`
  }

  return ''
}

function SyllabusPage() {
  const MotionDiv = motion.div
  const user = DEMO_USER
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [topics, setTopics] = useState([])
  const [error, setError] = useState(null)
  const [subject, setSubject] = useState(() => readStoredValue(STORAGE_SUBJECT, ''))
  const [examDate, setExamDate] = useState(() => readStoredValue(STORAGE_EXAM_DATE, ''))
  const [syllabusText, setSyllabusText] = useState(() => readStoredValue(STORAGE_TEXT, ''))
  const [mediaNames, setMediaNames] = useState(() => readStoredMediaNames())

  const steps = [
    { title: 'Subject', icon: BookOpen },
    { title: 'Timeline', icon: Calendar },
    { title: 'Topics', icon: FileText },
    { title: 'Plan', icon: Sparkles },
  ]

  const nextStep = () => setStep(s => Math.min(s + 1, steps.length - 1))
  const prevStep = () => setStep(s => Math.max(s - 1, 0))
  const planPreview = topics.length && examDate
    ? buildPlanPreview({ subject, examDate, topics })
    : null

  const handleAnalyze = async () => {
    setIsAnalyzing(true)
    setError(null)
    try {
      const payloadText = buildAnalysisPayload({ subject, syllabusText, mediaNames })

      if (!subject || !payloadText) {
        throw new Error('Select your subject and add exam topics using text, uploads, or both')
      }

      const res = await axios.post(`${API_BASE_URL}/gemini/topics`, {
        subject,
        syllabusText: payloadText
      })

      setTopics(res.data.topics)
      nextStep()
    } catch (err) {
      setError(err.response?.data?.error || err.message)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleCreatePlan = async () => {
    setIsSaving(true)
    setError(null)
    try {
      if (!subject || !examDate || !topics.length) {
        throw new Error('Missing plan data')
      }

      await axios.post(`${API_BASE_URL}/exams`, {
        subject,
        examDate,
        topics,
        userId: user.id,
        userName: user.fullName,
        userEmail: user.primaryEmailAddress.emailAddress,
      }, {
        headers: { 'x-clerk-id': user.id }
      })

      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.error || err.message)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="syllabus-page app-container">
      <div className="syllabus-header">
        <h1 className="syllabus-title">Build your exam plan</h1>
        <p className="syllabus-subtitle">
          Start with your subject, lock the exam date, tell us what topics are coming, and get a full study roadmap.
        </p>
        <div className="syllabus-stepper">
          {steps.map((s, idx) => (
            <div key={idx} className={`step-item ${idx <= step ? 'step-item--active' : ''}`}>
              <div className="step-icon-wrapper">
                <s.icon size={18} />
              </div>
              <span className="step-label">{s.title}</span>
              {idx < steps.length - 1 && <div className="step-line" />}
            </div>
          ))}
        </div>
      </div>

      <div className="syllabus-content">
        <AnimatePresence mode="wait">
          <MotionDiv
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {step === 0 && (
              <SubjectOnboarding
                onSelect={nextSubject => {
                  setSubject(nextSubject)
                  setError(null)
                  setStep(1)
                }}
              />
            )}
            {step === 1 && (
              <div className="calendar-step-shell">
                <ExamTimingPicker
                  onPick={nextDate => {
                    setExamDate(nextDate)
                    setError(null)
                    setStep(2)
                  }}
                />
                <div className="syllabus-inline-actions">
                  <button className="btn btn-ghost" onClick={prevStep}>
                    <ArrowLeft size={18} /> Back
                  </button>
                </div>
              </div>
            )}
            {step === 2 && (
              <div className="syllabus-intake-shell">
                <div className="card-elevated intake-intro-card">
                  <div className="intake-intro-copy">
                    <h2 className="intake-title">What topics are coming in the exam?</h2>
                    <p className="intake-subtitle">
                      You can paste a topic list, upload photos or PDFs of your syllabus, or combine both for a stronger plan.
                    </p>
                  </div>
                  <div className="intake-method-grid">
                    <div className="intake-method-card">
                      <NotebookPen size={18} />
                      <span>Write or paste topics</span>
                    </div>
                    <div className="intake-method-card">
                      <ImageUp size={18} />
                      <span>Upload images or PDFs</span>
                    </div>
                  </div>
                </div>

                <TextSyllabusInput onChangeText={setSyllabusText} />
                <MediaSyllabusUploader onFilesChange={setMediaNames} />
                {error && <p className="error-text">{error}</p>}
                <div className="syllabus-actions">
                  <button className="btn btn-ghost" onClick={prevStep}>
                    <ArrowLeft size={18} /> Back
                  </button>
                  <button
                    className="btn btn-primary btn-lg"
                    onClick={handleAnalyze}
                    disabled={isAnalyzing || !buildAnalysisPayload({ subject, syllabusText, mediaNames })}
                  >
                    {isAnalyzing ? <Loader2 className="animate-spin" /> : <Sparkles size={20} />}
                    {isAnalyzing ? 'Building your plan...' : 'Generate Exam Plan'}
                  </button>
                </div>
              </div>
            )}
            {step === 3 && planPreview && (
              <div className="syllabus-preview">
                <div className="card-elevated preview-card">
                  <div className="preview-header">
                    <div>
                      <h2 className="preview-title">{subject} Exam Plan</h2>
                      <p className="preview-subtitle">
                        Your exam is on {new Date(examDate).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}.
                      </p>
                    </div>
                    <div className="preview-badges">
                      <span className="badge badge-accent">{planPreview.stats.totalTopics} topics</span>
                      <span className="badge badge-warning">{planPreview.stats.totalHours} study hours</span>
                    </div>
                  </div>

                  <div className="plan-summary-grid">
                    <div className="card summary-stat-card">
                      <div className="summary-stat-top">
                        <Target size={18} />
                        <span>Highest Priority</span>
                      </div>
                      <h3>{planPreview.stats.highestWeightTopic?.name || 'No topic found'}</h3>
                      <p>{planPreview.stats.highestWeightTopic?.weightage || 0}% weightage</p>
                    </div>
                    <div className="card summary-stat-card">
                      <div className="summary-stat-top">
                        <Clock3 size={18} />
                        <span>Plan Length</span>
                      </div>
                      <h3>{planPreview.stats.totalDays} study days</h3>
                      <p>{planPreview.stats.totalHours} total hours across the schedule</p>
                    </div>
                    <div className="card summary-stat-card">
                      <div className="summary-stat-top">
                        <Sparkles size={18} />
                        <span>Challenging Units</span>
                      </div>
                      <h3>{planPreview.stats.hardestTopics} hard topics</h3>
                      <p>Balanced with lighter modules to keep the workload realistic</p>
                    </div>
                  </div>

                  <div className="plan-overview-card">
                    <div className="plan-overview-header">
                      <h3 className="plan-overview-title">Topics we extracted</h3>
                      <p className="plan-overview-subtitle">
                        These will be saved as your working exam roadmap.
                      </p>
                    </div>
                    <div className="topics-list compact">
                      {topics.map((topic, i) => (
                        <div key={i} className="topic-item">
                          <div className="topic-info">
                            <span className="topic-name">{topic.name}</span>
                            <span className={`topic-badge badge-${topic.difficulty.toLowerCase()}`}>
                              {topic.difficulty}
                            </span>
                          </div>
                          <div className="topic-weight">
                            <div className="weight-label">Exam Weightage</div>
                            <div className="weight-bar-bg">
                              <div className="weight-bar-fill" style={{ width: `${topic.weightage}%` }} />
                            </div>
                            <span className="weight-value">{topic.weightage}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="generated-plan-section">
                    <div className="plan-overview-header">
                      <h3 className="plan-overview-title">Full generated study plan</h3>
                      <p className="plan-overview-subtitle">
                        High-weight topics are pulled earlier, while the daily workload stays balanced.
                      </p>
                    </div>

                    <div className="generated-plan-list">
                      {planPreview.dailyPlan.map(day => (
                        <div key={day.day} className="generated-day-card card-elevated">
                          <div className="generated-day-header">
                            <div>
                              <h4 className="generated-day-title">Day {day.day}</h4>
                              <p className="generated-day-meta">{day.totalHours} focused hours</p>
                            </div>
                            <span className="generated-day-count">{day.topics.length} topic{day.topics.length > 1 ? 's' : ''}</span>
                          </div>

                          <div className="generated-topic-stack">
                            {day.topics.map(topic => (
                              <div key={`${day.day}-${topic.name}`} className="generated-topic-row">
                                <div>
                                  <div className="generated-topic-name">{topic.name}</div>
                                  <div className="generated-topic-meta">{topic.studyHours}h deep work block</div>
                                </div>
                                <div className="generated-topic-right">
                                  <span className={`badge badge-${topic.difficulty.toLowerCase()}`}>{topic.difficulty}</span>
                                  <span className="generated-topic-weight">{topic.weightage}%</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {error && <p className="error-text">{error}</p>}
                  <div className="preview-footer">
                    <button className="btn btn-ghost" onClick={prevStep}>
                      <ArrowLeft size={18} /> Back
                    </button>
                    <button className="btn btn-primary btn-lg" onClick={handleCreatePlan} disabled={isSaving}>
                      {isSaving ? <Loader2 className="animate-spin" /> : <Check size={20} />}
                      {isSaving ? 'Generating Roadmap...' : 'Confirm & Generate Plan'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </MotionDiv>
        </AnimatePresence>
      </div>

      <style>{`
        .syllabus-page {
          padding-top: 4rem;
          padding-bottom: 6rem;
          min-height: calc(100vh - 4rem);
        }
        .syllabus-header {
          text-align: center;
          margin-bottom: 3rem;
        }
        .syllabus-title {
          font-size: 2.5rem;
          margin-bottom: 2rem;
          background: linear-gradient(135deg, var(--color-text-primary) 0%, var(--color-accent) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .syllabus-subtitle {
          max-width: 52rem;
          margin: 0 auto 2rem;
          font-size: 1rem;
        }
        .syllabus-stepper {
          display: flex;
          justify-content: center;
          gap: 0;
          max-width: 600px;
          margin: 0 auto;
        }
        .step-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          flex: 1;
          position: relative;
          color: var(--color-text-muted);
        }
        .step-item--active {
          color: var(--color-accent);
        }
        .step-icon-wrapper {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: var(--color-surface-muted);
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid var(--color-border);
          z-index: 2;
          transition: all 0.3s ease;
        }
        .step-item--active .step-icon-wrapper {
          background: var(--color-accent-light);
          border-color: var(--color-accent);
          color: var(--color-accent);
          box-shadow: 0 0 0 4px var(--color-accent-light);
        }
        .step-label {
          margin-top: 0.75rem;
          font-size: 0.8125rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .step-line {
          position: absolute;
          top: 20px;
          left: calc(50% + 20px);
          width: calc(100% - 40px);
          height: 2px;
          background: var(--color-border);
          z-index: 1;
        }
        .step-item--active .step-line {
          background: var(--color-accent-light);
        }

        .syllabus-actions {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 1rem;
          margin-top: 2rem;
        }
        .syllabus-inline-actions {
          display: flex;
          justify-content: center;
          margin-top: 1.5rem;
        }

        .syllabus-preview {
          max-width: 980px;
          margin: 0 auto;
        }
        .preview-card {
          padding: 2.5rem;
        }
        .preview-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 1rem;
          margin-bottom: 2rem;
        }
        .preview-badges {
          display: flex;
          gap: 0.75rem;
          flex-wrap: wrap;
        }
        .preview-title {
          font-size: 1.75rem;
          margin-bottom: 0.5rem;
        }
        .preview-subtitle {
          color: var(--color-text-secondary);
        }
        .plan-summary-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 1rem;
          margin-bottom: 1.5rem;
        }
        .summary-stat-card {
          padding: 1.25rem;
          background: var(--color-bg);
        }
        .summary-stat-top {
          display: flex;
          align-items: center;
          gap: 0.625rem;
          margin-bottom: 0.85rem;
          color: var(--color-text-secondary);
          font-size: 0.85rem;
          font-weight: 600;
        }
        .summary-stat-card h3 {
          font-size: 1.125rem;
          margin-bottom: 0.3rem;
        }
        .plan-overview-card {
          margin-bottom: 2rem;
        }
        .plan-overview-header {
          margin-bottom: 1rem;
        }
        .plan-overview-title {
          font-size: 1.25rem;
          margin-bottom: 0.3rem;
        }
        .plan-overview-subtitle {
          font-size: 0.92rem;
          color: var(--color-text-secondary);
        }
        .topics-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-bottom: 2.5rem;
        }
        .topics-list.compact {
          margin-bottom: 0;
        }
        .topic-item {
          padding: 1.25rem;
          background: var(--color-bg);
          border-radius: var(--radius-lg);
          border: 1px solid var(--color-border);
        }
        .topic-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }
        .topic-name {
          font-weight: 600;
          font-size: 1.05rem;
        }
        .topic-weight {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .weight-label {
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--color-text-muted);
          text-transform: uppercase;
          width: 100px;
        }
        .weight-bar-bg {
          flex: 1;
          height: 6px;
          background: var(--color-border);
          border-radius: 3px;
          overflow: hidden;
        }
        .weight-bar-fill {
          height: 100%;
          background: var(--color-accent);
          border-radius: 3px;
        }
        .weight-value {
          font-size: 0.875rem;
          font-weight: 700;
          color: var(--color-accent);
          width: 45px;
          text-align: right;
        }
        .generated-plan-section {
          margin-bottom: 2rem;
        }
        .generated-plan-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .generated-day-card {
          padding: 1.5rem;
        }
        .generated-day-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 1rem;
          margin-bottom: 1rem;
        }
        .generated-day-title {
          font-size: 1.2rem;
          margin-bottom: 0.2rem;
        }
        .generated-day-meta,
        .generated-day-count {
          font-size: 0.9rem;
          color: var(--color-text-secondary);
        }
        .generated-topic-stack {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .generated-topic-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1rem;
          padding: 1rem 1.1rem;
          background: var(--color-bg);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
        }
        .generated-topic-name {
          font-weight: 600;
          margin-bottom: 0.2rem;
        }
        .generated-topic-meta {
          font-size: 0.85rem;
          color: var(--color-text-secondary);
        }
        .generated-topic-right {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .generated-topic-weight {
          min-width: 3rem;
          text-align: right;
          font-weight: 700;
          color: var(--color-accent);
        }
        .preview-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .error-text {
          color: var(--color-danger);
          text-align: center;
          margin: 1rem 0;
          font-size: 0.9rem;
        }
        .syllabus-intake-shell {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        .intake-intro-card {
          padding: 1.5rem;
          display: flex;
          justify-content: space-between;
          gap: 1.5rem;
          align-items: center;
        }
        .intake-title {
          font-size: 1.5rem;
          margin-bottom: 0.4rem;
        }
        .intake-method-grid {
          display: flex;
          gap: 0.75rem;
          flex-wrap: wrap;
        }
        .intake-method-card {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.9rem 1rem;
          border-radius: var(--radius-lg);
          background: var(--color-bg);
          border: 1px solid var(--color-border);
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--color-text-secondary);
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @media (max-width: 1024px) {
          .plan-summary-grid {
            grid-template-columns: 1fr;
          }
          .intake-intro-card {
            flex-direction: column;
            align-items: flex-start;
          }
        }
        @media (max-width: 768px) {
          .preview-header,
          .topic-info,
          .topic-weight,
          .preview-footer,
          .generated-day-header,
          .generated-topic-row,
          .syllabus-actions {
            flex-direction: column;
            align-items: flex-start;
          }
          .weight-label {
            width: auto;
          }
        }
      `}</style>
    </div>
  )
}

export default SyllabusPage
