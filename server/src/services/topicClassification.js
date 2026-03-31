function difficultyMultiplier(difficulty) {
  if (difficulty === 'EASY') return 0.85
  if (difficulty === 'HARD') return 1.15
  return 1.0
}

function clamp01to100(n) {
  const v = typeof n === 'number' ? n : Number(n)
  if (!Number.isFinite(v)) return 50
  return Math.max(0, Math.min(100, v))
}

export function classifyTopics(topics) {
  const safe = Array.isArray(topics) ? topics : []
  const cleaned = safe
    .map(t => {
      const difficulty = typeof t?.difficulty === 'string' ? t.difficulty.trim().toUpperCase() : 'MEDIUM'
      const normalizedDifficulty = ['EASY', 'MEDIUM', 'HARD'].includes(difficulty) ? difficulty : 'MEDIUM'
      const importance = clamp01to100(t?.importance)
      return { name: typeof t?.name === 'string' ? t.name.trim() : '', difficulty: normalizedDifficulty, importance }
    })
    .filter(t => t.name.length > 0)

  if (!cleaned.length) return []

  const scored = cleaned.map(t => {
    const importance = t.importance
    const raw = importance * difficultyMultiplier(t.difficulty)
    return { name: t.name, difficulty: t.difficulty, rawWeightage: raw }
  })

  const sumRaw = scored.reduce((acc, x) => acc + x.rawWeightage, 0)
  const total = sumRaw > 0 ? sumRaw : 1
  const count = scored.length

  const classified = scored
    .map(x => {
      const weightage = sumRaw > 0 ? (x.rawWeightage / total) * 100 : 100 / count
      const fixed = Math.round(weightage * 100) / 100
      return { name: x.name, difficulty: x.difficulty, weightage: fixed }
    })
    .sort((a, b) => b.weightage - a.weightage)

  return classified
}

