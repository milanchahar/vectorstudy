import { createExamWithPlan, getActiveExam, updateTopic } from '../services/examService.js'

export async function updateTopicHandler(req, res) {
  try {
    const { id } = req.params
    const { isCompleted } = req.body

    const updated = await updateTopic(id, { isCompleted })
    return res.json(updated)
  } catch (err) {
    console.error('Update Topic Error:', err)
    return res.status(500).json({ error: 'Failed to update topic' })
  }
}

export async function getActiveExamHandler(req, res) {
  try {
    const userId = req.headers['x-clerk-id'] || req.query.userId

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized: Missing User ID' })
    }

    const exam = await getActiveExam(userId)

    if (!exam) {
      return res.status(404).json({ error: 'No active study plan found' })
    }

    return res.json(exam)
  } catch (err) {
    console.error('Get Active Exam Error:', err)
    return res.status(500).json({
      error: err?.message || 'Failed to fetch active exam',
    })
  }
}

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
