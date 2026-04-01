import { useEffect, useMemo, useRef, useState } from 'react'
import { Mic, MicOff } from 'lucide-react'

const STORAGE_KEY = 'vectorstudy_syllabus_text'
const SpeechRecognitionCtor = typeof window !== 'undefined'
  ? window.SpeechRecognition || window.webkitSpeechRecognition
  : null

function readStoredText() {
  try {
    return localStorage.getItem(STORAGE_KEY) || ''
  } catch {
    return ''
  }
}

function writeStoredText(value) {
  try {
    localStorage.setItem(STORAGE_KEY, value)
  } catch (err) {
    console.warn('Unable to persist syllabus text:', err)
  }
}

function TextSyllabusInput({ onChangeText }) {
  const [text, setText] = useState(readStoredText)
  const [isSupported] = useState(Boolean(SpeechRecognitionCtor))
  const [isListening, setIsListening] = useState(false)
  const recognitionRef = useRef(null)
  const onChangeTextRef = useRef(onChangeText)

  useEffect(() => {
    onChangeTextRef.current = onChangeText
  }, [onChangeText])

  useEffect(() => {
    if (!SpeechRecognitionCtor) return undefined

    const recognition = new SpeechRecognitionCtor()
    recognition.lang = 'en-US'
    recognition.interimResults = true
    recognition.continuous = false

    recognition.onstart = () => setIsListening(true)
    recognition.onend = () => setIsListening(false)

    recognition.onresult = event => {
      let finalTranscript = ''
      for (let i = 0; i < event.results.length; i += 1) {
        const result = event.results[i]
        if (result.isFinal && result[0]) finalTranscript += result[0].transcript
      }

      const normalized = finalTranscript.trim()
      if (!normalized) return

      setText(prev => {
        const next = prev.trim().length === 0 ? normalized : `${prev.trim()} ${normalized}`
        writeStoredText(next)
        onChangeTextRef.current?.(next)
        return next
      })
    }

    recognitionRef.current = recognition

    return () => {
      recognitionRef.current = null
      recognition.stop()
    }
  }, [])

  const charCount = useMemo(() => text.length, [text])

  function handleChange(e) {
    const next = e.target.value
    setText(next)
    writeStoredText(next)
    onChangeTextRef.current?.(next)
  }

  function toggleListening() {
    if (!isSupported) return
    const recognition = recognitionRef.current
    if (!recognition) return

    if (isListening) {
      recognition.stop()
      return
    }

    try {
      recognition.start()
    } catch (err) {
      console.warn('Unable to start voice recognition:', err)
      setIsListening(false)
    }
  }

  return (
    <section className="syllabus-text">
      <div className="card-elevated syllabus-text-card">
        <div className="onboarding-section-header">
          <h2 className="onboarding-section-title">Paste or write your syllabus</h2>
          <p className="onboarding-section-subtitle">Turn your syllabus notes into structured study topics.</p>
        </div>

        <div className="syllabus-editor">
          <label className="syllabus-label" htmlFor="syllabus-textarea">
            Syllabus text
          </label>

          <textarea
            id="syllabus-textarea"
            className="syllabus-textarea"
            value={text}
            onChange={handleChange}
            placeholder="Write here… Paste your syllabus, headings, bullet points, or notes."
            rows={11}
          />

          <div className="syllabus-editor-footer">
            <div className="syllabus-charcount" aria-live="polite">
              {charCount} characters
            </div>

            <button
              type="button"
              className={`voice-toggle-btn ${isListening ? 'voice-toggle-btn--active' : ''}`}
              onClick={toggleListening}
              disabled={!isSupported}
              aria-pressed={isListening}
            >
              {isListening ? <MicOff size={16} /> : <Mic size={16} />}
              {isListening ? 'Listening…' : 'Voice to text'}
            </button>
          </div>

          {!isSupported && (
            <div className="syllabus-voice-hint">
              Voice input isn’t supported in this browser. You can still type or paste the syllabus.
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

export default TextSyllabusInput
