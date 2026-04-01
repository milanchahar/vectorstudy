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
  const value = typeof difficulty === 'string' ? difficulty.trim().toUpperCase() : ''
  if (value === 'EASY') return 'EASY'
  if (value === 'MEDIUM') return 'MEDIUM'
  if (value === 'HARD') return 'HARD'
  return 'MEDIUM'
}

function normalizeImportance(importance) {
  const value = typeof importance === 'number' ? importance : Number(importance)
  if (!Number.isFinite(value)) return 50
  return Math.max(0, Math.min(100, value))
}

function inferDifficulty(name, index) {
  const normalized = name.toLowerCase()
  if (
    normalized.includes('advanced') ||
    normalized.includes('optimization') ||
    normalized.includes('theorem') ||
    normalized.includes('consensus') ||
    normalized.includes('proof')
  ) {
    return 'HARD'
  }
  if (name.split(' ').length <= 2 && index < 4) return 'EASY'
  return index % 3 === 0 ? 'HARD' : 'MEDIUM'
}

function extractTopicsWithoutGemini({ syllabusText }) {
  const rawParts = syllabusText
    .split(/\n|,|;|\./)
    .map(part => part.replace(/^[\s*\-0-9.)]+/, '').trim())
    .filter(Boolean)

  const unique = []
  const seen = new Set()

  for (const part of rawParts) {
    const key = part.toLowerCase()
    if (part.length < 3 || seen.has(key)) continue
    seen.add(key)
    unique.push(part)
    if (unique.length >= 20) break
  }

  if (!unique.length) {
    throw new Error('Please provide a more detailed syllabus to generate topics')
  }

  return {
    topics: unique.map((name, index) => ({
      name,
      difficulty: inferDifficulty(name, index),
      importance: Math.max(20, 100 - index * 4),
    })),
  }
}

export async function extractTopicsFromGemini({ subject, syllabusText }) {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return extractTopicsWithoutGemini({ subject, syllabusText })
  }

  try {
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
      model: 'gemini-2.0-flash',
      contents: prompt,
    })

    const data = safeExtractJson(response?.text)
    if (!data || !Array.isArray(data.topics)) {
      return extractTopicsWithoutGemini({ subject, syllabusText })
    }

    const topics = data.topics
      .map(topic => ({
        name: typeof topic?.name === 'string' ? topic.name.trim() : '',
        difficulty: normalizeTopicDifficulty(topic?.difficulty),
        importance: normalizeImportance(topic?.importance),
      }))
      .filter(topic => topic.name.length > 0)

    if (!topics.length) {
      return extractTopicsWithoutGemini({ subject, syllabusText })
    }

    return { topics }
  } catch (err) {
    console.warn('Falling back to local topic extraction:', err?.message || err)
    return extractTopicsWithoutGemini({ subject, syllabusText })
  }
}
