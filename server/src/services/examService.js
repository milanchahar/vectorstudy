import prisma from '../lib/prisma.js'

const memoryExamStore = new Map()

function calculateDayAllocation(topics, examDate) {
  const startDate = new Date()
  const endDate = new Date(examDate)

  const timeDiff = endDate.getTime() - startDate.getTime()
  let daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24))

  if (daysDiff < 1) daysDiff = 1

  const sortedTopics = [...topics].sort((a, b) => b.weightage - a.weightage)
  const topicsPerDay = Math.ceil(sortedTopics.length / daysDiff)

  return sortedTopics.map((topic, index) => {
    const dayAssigned = Math.floor(index / topicsPerDay) + 1
    let hours = 1.0
    if (topic.difficulty === 'HARD') hours += 0.5
    if (topic.difficulty === 'EASY') hours -= 0.25
    hours += (topic.weightage / 100) * 1.5

    return {
      ...topic,
      dayAssigned: Math.min(dayAssigned, daysDiff),
      studyHours: Math.round(hours * 10) / 10,
    }
  })
}

function normalizeTopic(topic) {
  const difficulty = typeof topic?.difficulty === 'string' ? topic.difficulty.toUpperCase() : 'MEDIUM'
  const safeDifficulty = ['EASY', 'MEDIUM', 'HARD'].includes(difficulty) ? difficulty : 'MEDIUM'
  const weightage = Number(topic?.weightage)

  return {
    name: typeof topic?.name === 'string' && topic.name.trim() ? topic.name.trim() : 'Untitled Topic',
    difficulty: safeDifficulty,
    weightage: Number.isFinite(weightage) ? Math.max(0, Math.min(100, weightage)) : 0,
  }
}

function buildStats(topics, examDate) {
  const totalTopics = topics.length
  const completedTopics = topics.filter(topic => topic.isCompleted).length
  const progressPercent = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0

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

function formatExamResult(exam) {
  if (!exam) return null

  const topics = [...(exam.topics || [])].sort((a, b) => a.dayAssigned - b.dayAssigned)

  return {
    ...exam,
    topics,
    stats: buildStats(topics, exam.examDate),
  }
}

function createMemoryExam({ userId, subject, examDate, topics }) {
  const allocatedTopics = calculateDayAllocation(topics, examDate)
  const nowIso = new Date().toISOString()

  const exam = {
    id: crypto.randomUUID(),
    userId,
    subject,
    examDate: new Date(examDate).toISOString(),
    status: 'ACTIVE',
    createdAt: nowIso,
    updatedAt: nowIso,
    topics: allocatedTopics.map(topic => ({
      id: crypto.randomUUID(),
      name: topic.name,
      difficulty: topic.difficulty,
      weightage: topic.weightage,
      dayAssigned: topic.dayAssigned,
      studyHours: topic.studyHours,
      isCompleted: false,
      createdAt: nowIso,
      updatedAt: nowIso,
    })),
  }

  memoryExamStore.set(userId, exam)
  return formatExamResult(exam)
}

function getMemoryExam(userId) {
  return formatExamResult(memoryExamStore.get(userId) || null)
}

function updateMemoryTopic(id, data) {
  for (const [userId, exam] of memoryExamStore.entries()) {
    const updatedTopics = exam.topics.map(topic => {
      if (topic.id !== id) return topic

      return {
        ...topic,
        ...data,
        updatedAt: new Date().toISOString(),
      }
    })

    const updatedTopic = updatedTopics.find(topic => topic.id === id)
    if (updatedTopic) {
      memoryExamStore.set(userId, {
        ...exam,
        updatedAt: new Date().toISOString(),
        topics: updatedTopics,
      })
      return updatedTopic
    }
  }

  return null
}

async function upsertUserByClerkId(userId, userName, userEmail) {
  const email = typeof userEmail === 'string' && userEmail.trim()
    ? userEmail.trim()
    : `${userId}@vectorstudy.local`
  const name = typeof userName === 'string' && userName.trim()
    ? userName.trim()
    : 'VectorStudy User'

  return prisma.user.upsert({
    where: { clerkId: userId },
    update: { email, name },
    create: {
      clerkId: userId,
      email,
      name,
    },
  })
}

export async function createExamWithPlan({ userId, userName, userEmail, subject, examDate, topics }) {
  const safeTopics = (Array.isArray(topics) ? topics : []).map(normalizeTopic)

  if (!safeTopics.length) {
    throw new Error('At least one valid topic is required')
  }

  const allocatedTopics = calculateDayAllocation(safeTopics, examDate)

  try {
    const user = await upsertUserByClerkId(userId, userName, userEmail)

    const exam = await prisma.exam.create({
      data: {
        userId: user.id,
        subject,
        examDate: new Date(examDate),
        topics: {
          create: allocatedTopics.map(topic => ({
            name: topic.name,
            difficulty: topic.difficulty,
            weightage: topic.weightage,
            dayAssigned: topic.dayAssigned,
            studyHours: topic.studyHours,
          })),
        },
      },
      include: {
        topics: true,
      },
    })

    return formatExamResult(exam)
  } catch (err) {
    console.warn('Persisting exam in memory instead of Prisma:', err?.message || err)
    return createMemoryExam({ userId, subject, examDate, topics: safeTopics })
  }
}

export async function getActiveExam(userId) {
  try {
    const user = await prisma.user.findUnique({
      where: {
        clerkId: userId,
      },
    })

    if (!user) return getMemoryExam(userId)

    const exam = await prisma.exam.findFirst({
      where: {
        userId: user.id,
        status: 'ACTIVE',
      },
      include: {
        topics: {
          orderBy: {
            dayAssigned: 'asc',
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return formatExamResult(exam) || getMemoryExam(userId)
  } catch (err) {
    console.warn('Reading exam from memory instead of Prisma:', err?.message || err)
    return getMemoryExam(userId)
  }
}

export async function updateTopic(id, data) {
  try {
    return await prisma.topic.update({
      where: { id },
      data,
    })
  } catch (err) {
    console.warn('Updating topic in memory instead of Prisma:', err?.message || err)
    const updated = updateMemoryTopic(id, data)
    if (!updated) throw err
    return updated
  }
}
