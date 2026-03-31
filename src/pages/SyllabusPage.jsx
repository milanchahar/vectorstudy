import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useUser } from '@clerk/clerk-react'
import axios from 'axios'
import { Sparkles, ArrowRight, ArrowLeft, Check, Loader2, Calendar, BookOpen, FileText } from 'lucide-react'

import SubjectOnboarding from '../components/SubjectOnboarding'
import ExamTimingPicker from '../components/ExamTimingPicker'
import TextSyllabusInput from '../components/TextSyllabusInput'

const API_BASE_URL = 'http://localhost:4000/api'

function SyllabusPage() {
  const { user } = useUser()
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [topics, setTopics] = useState([])
  const [error, setError] = useState(null)

  const steps = [
    { title: 'Subject', icon: BookOpen },
    { title: 'Timeline', icon: Calendar },
    { title: 'Syllabus', icon: FileText },
    { title: 'Review', icon: Sparkles },
  ]

  const nextStep = () => setStep(s => Math.min(s + 1, steps.length - 1))
  const prevStep = () => setStep(s => Math.max(s - 1, 0))

  const handleAnalyze = async () => {
    setIsAnalyzing(true)
    setError(null)
    try {
      const subject = localStorage.getItem('vectorstudy_subject')
      const syllabusText = localStorage.getItem('vectorstudy_syllabus_text')

      if (!subject || !syllabusText) {
        throw new Error('Please complete previous steps first')
      }

      const res = await axios.post(`${API_BASE_URL}/gemini/topics`, {
        subject,
        syllabusText
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
      const subject = localStorage.getItem('vectorstudy_subject')
      const examDate = localStorage.getItem('vectorstudy_exam_date')

      if (!subject || !examDate || !topics.length) {
        throw new Error('Missing plan data')
      }

      await axios.post(`${API_BASE_URL}/exams`, {
        subject,
        examDate,
        topics,
        userId: user.id // Clerk ID
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
        <h1 className="syllabus-title">Crafting your study plan</h1>
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
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {step === 0 && <SubjectOnboarding />}
            {step === 1 && <ExamTimingPicker />}
            {step === 2 && (
              <div className="syllabus-input-wrapper">
                <TextSyllabusInput />
                {error && <p className="error-text">{error}</p>}
                <div className="syllabus-actions">
                  <button className="btn btn-primary btn-lg" onClick={handleAnalyze} disabled={isAnalyzing}>
                    {isAnalyzing ? <Loader2 className="animate-spin" /> : <Sparkles size={20} />}
                    {isAnalyzing ? 'Analyzing with AI...' : 'Analyze Syllabus'}
                  </button>
                </div>
              </div>
            )}
            {step === 3 && (
              <div className="syllabus-preview">
                <div className="card-elevated preview-card">
                  <div className="preview-header">
                    <h2 className="preview-title">Generated Topics</h2>
                    <p className="preview-subtitle">We found {topics.length} key areas for your study plan.</p>
                  </div>
                  <div className="topics-list">
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
          </motion.div>
        </AnimatePresence>
      </div>

      {step < 2 && (
        <div className="syllabus-footer-nav">
          <button className="btn btn-ghost" onClick={prevStep} disabled={step === 0}>
            <ArrowLeft size={18} /> Previous
          </button>
          <button className="btn btn-primary" onClick={nextStep}>
            Next <ArrowRight size={18} />
          </button>
        </div>
      )}

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
          margin-top: 2rem;
        }
        .syllabus-footer-nav {
          position: fixed;
          bottom: 2rem;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 1rem;
          padding: 1rem;
          background: rgba(255,255,255,0.8);
          backdrop-filter: blur(12px);
          border-radius: var(--radius-full);
          border: 1px solid var(--color-border);
          box-shadow: var(--shadow-lg);
          z-index: 50;
        }

        .syllabus-preview {
          max-width: 800px;
          margin: 0 auto;
        }
        .preview-card {
          padding: 2.5rem;
        }
        .preview-header {
          margin-bottom: 2rem;
        }
        .preview-title {
          font-size: 1.75rem;
          margin-bottom: 0.5rem;
        }
        .preview-subtitle {
          color: var(--color-text-secondary);
        }
        .topics-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-bottom: 2.5rem;
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
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

export default SyllabusPage
