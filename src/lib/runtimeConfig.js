function trimTrailingSlash(value) {
  return value.replace(/\/+$/, '')
}

function getDefaultApiBaseUrl() {
  if (import.meta.env.DEV) {
    return 'http://localhost:4000/api'
  }

  if (typeof window !== 'undefined' && window.location?.origin) {
    return `${window.location.origin}/api`
  }

  return '/api'
}

const rawApiBaseUrl = typeof import.meta.env.VITE_API_BASE_URL === 'string'
  ? import.meta.env.VITE_API_BASE_URL.trim()
  : ''

export const API_BASE_URL = trimTrailingSlash(rawApiBaseUrl || getDefaultApiBaseUrl())
