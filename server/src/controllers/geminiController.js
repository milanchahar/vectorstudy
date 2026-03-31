import { extractTopicsFromGemini } from '../services/geminiService.js'
import { classifyTopics } from '../services/topicClassification.js'

function getStringField(body, field) {
  const value = body?.[field]
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  if (!trimmed) return null
  return trimmed
}

export async function classifyTopicsHandler(req, res) {
  try {
    const subject = getStringField(req.body, 'subject')
    const syllabusText = getStringField(req.body, 'syllabusText')

    if (!subject || !syllabusText) {
      return res.status(400).json({ error: 'subject and syllabusText are required' })
    }

    const geminiResult = await extractTopicsFromGemini({ subject, syllabusText })
    const classified = classifyTopics(geminiResult.topics)

    return res.json({
      subject,
      topicCount: classified.length,
      topics: classified,
    })
  } catch (err) {
    return res.status(500).json({
      error: err?.message || 'Gemini classification failed',
    })
  }
}

