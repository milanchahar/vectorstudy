import { getTutorials } from '../services/youtubeService.js'

function readField(source, key) {
  const value = source?.[key]
  return typeof value === 'string' ? value.trim() : ''
}

export async function getTutorialsHandler(req, res) {
  try {
    const subject = readField(req.query, 'subject') || readField(req.body, 'subject')
    const topic = readField(req.query, 'topic') || readField(req.body, 'topic')
    const maxResults = req.query.maxResults || req.body?.maxResults

    if (!subject && !topic) {
      return res.status(400).json({ error: 'subject or topic is required' })
    }

    const result = await getTutorials({ subject, topic, maxResults })
    return res.json(result)
  } catch (err) {
    return res.status(500).json({
      error: err?.message || 'Failed to fetch tutorials',
    })
  }
}
