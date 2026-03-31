import { createExamWithPlan } from '../services/examService.js'

export async function createExamHandler(req, res) {
  try {
    const { subject, examDate, topics } = req.body
    // Assuming userId is passed in headers or body for now (clerk integration)
    const userId = req.headers['x-clerk-id'] || req.body.userId

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized: Missing User ID' })
    }

    if (!subject || !examDate || !Array.isArray(topics)) {
      return res.status(400).json({ error: 'Missing required fields: subject, examDate, topics' })
    }

    const exam = await createExamWithPlan({
      userId,
      subject,
      examDate,
      topics,
    })

    return res.status(201).json({
      message: 'Exam and Study Plan created successfully',
      examId: exam.id,
      topicCount: exam.topics.length,
      exam,
    })
  } catch (err) {
    console.error('Create Exam Error:', err)
    return res.status(500).json({
      error: err?.message || 'Failed to create exam plan',
    })
  }
}
