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
