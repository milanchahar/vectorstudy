const YOUTUBE_SEARCH_URL = 'https://www.googleapis.com/youtube/v3/search'
const YOUTUBE_VIDEOS_URL = 'https://www.googleapis.com/youtube/v3/videos'

const fallbackTutorials = {
  dsa: [
    { title: 'Algorithms and Data Structures Search', channelTitle: 'YouTube Search', url: 'https://www.youtube.com/results?search_query=data+structures+and+algorithms+tutorial', viewCount: null, duration: null, thumbnailUrl: null, source: 'fallback' },
  ],
  dbms: [
    { title: 'DBMS Concepts Search', channelTitle: 'YouTube Search', url: 'https://www.youtube.com/results?search_query=dbms+tutorial', viewCount: null, duration: null, thumbnailUrl: null, source: 'fallback' },
  ],
  os: [
    { title: 'Operating Systems Search', channelTitle: 'YouTube Search', url: 'https://www.youtube.com/results?search_query=operating+systems+tutorial', viewCount: null, duration: null, thumbnailUrl: null, source: 'fallback' },
  ],
  cn: [
    { title: 'Computer Networks Search', channelTitle: 'YouTube Search', url: 'https://www.youtube.com/results?search_query=computer+networks+tutorial', viewCount: null, duration: null, thumbnailUrl: null, source: 'fallback' },
  ],
}

function normalizeText(value) {
  return typeof value === 'string' ? value.trim() : ''
}

function buildQuery(subject, topic) {
  return [normalizeText(subject), normalizeText(topic), 'tutorial']
    .filter(Boolean)
    .join(' ')
}

function parseIsoDuration(duration) {
  const match = /^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/.exec(duration || '')
  if (!match) return null

  const hours = Number(match[1] || 0)
  const minutes = Number(match[2] || 0)
  const seconds = Number(match[3] || 0)
  return hours * 3600 + minutes * 60 + seconds
}

function formatDuration(totalSeconds) {
  if (!Number.isFinite(totalSeconds)) return null

  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
  }

  return `${minutes}:${String(seconds).padStart(2, '0')}`
}

function pickThumbnail(thumbnails) {
  return thumbnails?.high?.url || thumbnails?.medium?.url || thumbnails?.default?.url || null
}

function scoreVideo(video) {
  const viewCount = Number(video.statistics?.viewCount || 0)
  const durationSeconds = parseIsoDuration(video.contentDetails?.duration)
  const hdBoost = video.contentDetails?.definition === 'hd' ? 50000 : 0
  const durationBoost = durationSeconds && durationSeconds >= 300 && durationSeconds <= 5400 ? 25000 : 0
  return viewCount + hdBoost + durationBoost
}

function filterQualityVideos(videos) {
  return videos.filter(video => {
    const status = video.status
    const snippet = video.snippet
    const viewCount = Number(video.statistics?.viewCount || 0)
    const durationSeconds = parseIsoDuration(video.contentDetails?.duration)

    if (!status?.embeddable) return false
    if (snippet?.liveBroadcastContent && snippet.liveBroadcastContent !== 'none') return false
    if (!durationSeconds || durationSeconds < 240 || durationSeconds > 7200) return false
    if (viewCount < 5000) return false

    return true
  })
}

function mapTutorial(video) {
  const durationSeconds = parseIsoDuration(video.contentDetails?.duration)

  return {
    id: video.id,
    title: video.snippet?.title || 'Untitled tutorial',
    channelTitle: video.snippet?.channelTitle || 'Unknown channel',
    url: `https://www.youtube.com/watch?v=${video.id}`,
    viewCount: Number(video.statistics?.viewCount || 0),
    duration: formatDuration(durationSeconds),
    thumbnailUrl: pickThumbnail(video.snippet?.thumbnails),
    publishedAt: video.snippet?.publishedAt || null,
    source: 'youtube',
  }
}

function buildFallbackTutorials(subject, topic, maxResults) {
  const normalizedSubject = normalizeText(subject).toLowerCase()
  const items = fallbackTutorials[normalizedSubject] || []
  const query = encodeURIComponent(buildQuery(subject, topic))
  const genericFallback = {
    title: `${normalizeText(topic) || normalizeText(subject) || 'Study'} tutorial search`,
    channelTitle: 'YouTube Search',
    url: `https://www.youtube.com/results?search_query=${query}`,
    viewCount: null,
    duration: null,
    thumbnailUrl: null,
    source: 'fallback',
  }

  return [...items, genericFallback].slice(0, maxResults)
}

async function fetchJson(url, params) {
  const searchParams = new URLSearchParams(params)
  const response = await fetch(`${url}?${searchParams.toString()}`)

  if (!response.ok) {
    const body = await response.text()
    throw new Error(`YouTube API error ${response.status}: ${body}`)
  }

  return response.json()
}

export async function getTutorials({ subject, topic, maxResults = 5 }) {
  const apiKey = process.env.YOUTUBE_API_KEY
  const safeMaxResults = Math.min(Math.max(Number(maxResults) || 5, 1), 8)
  const query = buildQuery(subject, topic)

  if (!query) {
    throw new Error('subject or topic is required')
  }

  if (!apiKey) {
    return {
      query,
      tutorials: buildFallbackTutorials(subject, topic, safeMaxResults),
      source: 'fallback',
    }
  }

  const searchData = await fetchJson(YOUTUBE_SEARCH_URL, {
    part: 'snippet',
    type: 'video',
    maxResults: '12',
    order: 'relevance',
    q: query,
    videoEmbeddable: 'true',
    safeSearch: 'strict',
    key: apiKey,
  })

  const videoIds = (searchData.items || [])
    .map(item => item.id?.videoId)
    .filter(Boolean)

  if (!videoIds.length) {
    return {
      query,
      tutorials: buildFallbackTutorials(subject, topic, safeMaxResults),
      source: 'fallback',
    }
  }

  const videoData = await fetchJson(YOUTUBE_VIDEOS_URL, {
    part: 'snippet,contentDetails,statistics,status',
    id: videoIds.join(','),
    key: apiKey,
  })

  const tutorials = filterQualityVideos(videoData.items || [])
    .sort((a, b) => scoreVideo(b) - scoreVideo(a))
    .slice(0, safeMaxResults)
    .map(mapTutorial)

  if (!tutorials.length) {
    return {
      query,
      tutorials: buildFallbackTutorials(subject, topic, safeMaxResults),
      source: 'fallback',
    }
  }

  return {
    query,
    tutorials,
    source: 'youtube',
  }
}
