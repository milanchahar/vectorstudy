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
    let studyHours = 1.0
    if (topic.difficulty === 'HARD') studyHours += 0.5
    if (topic.difficulty === 'EASY') studyHours -= 0.25
    studyHours += (topic.weightage / 100) * 1.5

    return {
      ...topic,
      dayAssigned: Math.min(dayAssigned, daysDiff),
      studyHours: Math.round(studyHours * 10) / 10,
    }
  })
}

export function buildPlanPreview({ subject, examDate, topics }) {
  const safeTopics = (Array.isArray(topics) ? topics : []).map(normalizeTopic)
  const allocatedTopics = calculateDayAllocation(safeTopics, examDate)

  const daysMap = allocatedTopics.reduce((acc, topic) => {
    const key = topic.dayAssigned
    if (!acc[key]) acc[key] = []
    acc[key].push(topic)
    return acc
  }, {})

  const dailyPlan = Object.keys(daysMap)
    .sort((a, b) => Number(a) - Number(b))
    .map(day => {
      const dayTopics = daysMap[day]
      const totalHours = dayTopics.reduce((sum, topic) => sum + topic.studyHours, 0)

      return {
        day: Number(day),
        totalHours: Math.round(totalHours * 10) / 10,
        topics: dayTopics,
      }
    })

  const totalHours = allocatedTopics.reduce((sum, topic) => sum + topic.studyHours, 0)
  const highestWeightTopic = allocatedTopics[0] || null
  const hardestTopics = allocatedTopics.filter(topic => topic.difficulty === 'HARD').length

  return {
    subject,
    examDate,
    topics: allocatedTopics,
    dailyPlan,
    stats: {
      totalTopics: allocatedTopics.length,
      totalHours: Math.round(totalHours * 10) / 10,
      totalDays: dailyPlan.length,
      hardestTopics,
      highestWeightTopic,
    },
  }
}
