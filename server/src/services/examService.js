import prisma from '../lib/prisma.js'

function calculateDayAllocation(topics, examDate) {
  const startDate = new Date()
  const endDate = new Date(examDate)

  // Difference in days (inclusive)
  const timeDiff = endDate.getTime() - startDate.getTime()
  let daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24))

  // Minimum 1 day study
  if (daysDiff < 1) daysDiff = 1

  // Distribute topics (simplified: split count of topics by days)
  const sortedTopics = [...topics].sort((a, b) => b.weightage - a.weightage)
  const topicsPerDay = Math.ceil(sortedTopics.length / daysDiff)

  return sortedTopics.map((topic, index) => {
    const dayAssigned = Math.floor(index / topicsPerDay) + 1
    // studyHours based on difficulty and weightage (0.5 to 3.0)
    let hours = 1.0
    if (topic.difficulty === 'HARD') hours += 0.5
    if (topic.difficulty === 'EASY') hours -= 0.25
    hours += (topic.weightage / 100) * 1.5 // boost based on weightage

    return {
      ...topic,
      dayAssigned: Math.min(dayAssigned, daysDiff),
      studyHours: Math.round(hours * 10) / 10,
    }
  })
}

export async function createExamWithPlan({ userId, subject, examDate, topics }) {
  const allocatedTopics = calculateDayAllocation(topics, examDate)

  return await prisma.exam.create({
    data: {
      userId,
      subject,
      examDate: new Date(examDate),
      topics: {
        create: allocatedTopics.map(t => ({
          name: t.name,
          difficulty: t.difficulty,
          weightage: t.weightage,
          dayAssigned: t.dayAssigned,
          studyHours: t.studyHours,
        })),
      },
    },
    include: {
      topics: true,
    },
  })
}

export async function getActiveExam(userId) {
  const result = await prisma.exam.findFirst({
    where: {
      userId,
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

  if (!result) return null

  // Calculate stats
  const totalTopics = result.topics.length
  const completedTopics = result.topics.filter(t => t.isCompleted).length
  const progressPercent = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0

  const now = new Date()
  const examDate = new Date(result.examDate)
  const diffTime = examDate.getTime() - now.getTime()
  const daysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 3600 * 24)))

  const hoursRemaining = result.topics
    .filter(t => !t.isCompleted)
    .reduce((acc, t) => acc + (t.studyHours || 0), 0)

  return {
    ...result,
    stats: {
      totalTopics,
      completedTopics,
      progressPercent,
      daysRemaining,
      hoursRemaining: Math.round(hoursRemaining * 10) / 10,
    },
  }
}

export async function updateTopic(id, data) {
  return await prisma.topic.update({
    where: { id },
    data,
  })
}
