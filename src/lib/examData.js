import axios from 'axios'
import { API_BASE_URL } from './runtimeConfig'

export { API_BASE_URL }

export const DEMO_USER = {
  id: 'demo-user',
  firstName: 'John',
  fullName: 'John Doe',
  primaryEmailAddress: { emailAddress: 'john.doe@example.com' },
}

export const DEMO_USER_ID = DEMO_USER.id

function buildStats(topics, examDate) {
  const totalTopics = topics.length
  const completedTopics = topics.filter(topic => topic.isCompleted).length
  const progressPercent = totalTopics > 0
    ? Math.round((completedTopics / totalTopics) * 100)
    : 0

  const now = new Date()
  const safeExamDate = new Date(examDate)
  const diffTime = safeExamDate.getTime() - now.getTime()
  const daysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 3600 * 24)))

  const hoursRemaining = topics
    .filter(topic => !topic.isCompleted)
    .reduce((acc, topic) => acc + (topic.studyHours || 0), 0)

  return {
    totalTopics,
    completedTopics,
    progressPercent,
    daysRemaining,
    hoursRemaining: Math.round(hoursRemaining * 10) / 10,
  }
}

export function createDemoExam() {
  const examDate = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString()
  const topics = [
    {
      id: '1',
      name: 'MapReduce Architecture',
      difficulty: 'HARD',
      weightage: 30,
      dayAssigned: 1,
      studyHours: 2.5,
      isCompleted: true,
    },
    {
      id: '2',
      name: 'Raft Consensus Protocol',
      difficulty: 'HARD',
      weightage: 25,
      dayAssigned: 2,
      studyHours: 3.0,
      isCompleted: true,
    },
    {
      id: '3',
      name: 'Vector Clocks',
      difficulty: 'MEDIUM',
      weightage: 20,
      dayAssigned: 3,
      studyHours: 1.5,
      isCompleted: false,
    },
    {
      id: '4',
      name: 'CAP Theorem',
      difficulty: 'EASY',
      weightage: 15,
      dayAssigned: 4,
      studyHours: 1.0,
      isCompleted: false,
    },
    {
      id: '5',
      name: 'Consistency Models',
      difficulty: 'MEDIUM',
      weightage: 10,
      dayAssigned: 5,
      studyHours: 2.0,
      isCompleted: false,
    },
  ]

  return {
    subject: 'Distributed Systems',
    examDate,
    topics,
    stats: buildStats(topics, examDate),
  }
}

export async function fetchActiveExam({ fallbackMessage = null } = {}) {
  try {
    const res = await axios.get(`${API_BASE_URL}/exams/active`, {
      headers: { 'x-clerk-id': DEMO_USER_ID },
    })

    return {
      exam: res.data,
      error: null,
      source: 'api',
    }
  } catch (err) {
    console.error('Failed to load active exam:', err)

    return {
      exam: createDemoExam(),
      error: fallbackMessage,
      source: 'demo',
    }
  }
}
