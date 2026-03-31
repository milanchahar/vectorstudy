import { GoogleGenAI } from '@google/genai'

function safeExtractJson(text) {
  const raw = typeof text === 'string' ? text.trim() : ''
  if (!raw) return null

  const firstBrace = raw.indexOf('{')
  const lastBrace = raw.lastIndexOf('}')
  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) return null

  const jsonCandidate = raw.slice(firstBrace, lastBrace + 1)
  try {
    return JSON.parse(jsonCandidate)
  } catch {
    return null
  }
}

function normalizeTopicDifficulty(difficulty) {
  const v = typeof difficulty === 'string' ? difficulty.trim().toUpperCase() : ''
  if (v === 'EASY') return 'EASY'
  if (v === 'MEDIUM') return 'MEDIUM'
  if (v === 'HARD') return 'HARD'
  return 'MEDIUM'
}

function normalizeImportance(importance) {
  const n = typeof importance === 'number' ? importance : Number(importance)
  if (!Number.isFinite(n)) return 50
  return Math.max(0, Math.min(100, n))
}

export async function extractTopicsFromGemini({ subject, syllabusText }) {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    throw new Error('Missing GEMINI_API_KEY')
  }

  const ai = new GoogleGenAI({ apiKey })

  const prompt = `
You are an expert exam architect. Extract study topics from the syllabus for the given subject.

Return ONLY valid JSON with this exact shape:
{
  "topics": [
    { "name": string, "difficulty": "EASY" | "MEDIUM" | "HARD", "importance": number }
  ]
}

Rules:
- topic names must be short phrases (2-6 words)
- importance must be a number from 0 to 100 (higher means more exam-relevant)
- difficulty must be one of EASY, MEDIUM, HARD
- output no markdown and no extra keys
- limit topics to 25-40

Subject: ${subject}
Syllabus:
${syllabusText}
`.trim()

  const response = await ai.models.generateContent({
    model: 'gemini-1.5-flash',
    contents: prompt,
  })

  const data = safeExtractJson(response?.text)
  if (!data || !Array.isArray(data.topics)) {
    throw new Error('Gemini returned invalid JSON')
  }

  const topics = data.topics
    .map(t => ({
      name: typeof t?.name === 'string' ? t.name.trim() : '',
      difficulty: normalizeTopicDifficulty(t?.difficulty),
      importance: normalizeImportance(t?.importance),
    }))
    .filter(t => t.name.length > 0)

  if (!topics.length) {
    throw new Error('Gemini returned no topics')
  }

  return { topics }
}

