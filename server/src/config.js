import dotenv from 'dotenv'

dotenv.config()

function normalizeList(value) {
  if (typeof value !== 'string') return []

  return value
    .split(',')
    .map(item => item.trim())
    .filter(Boolean)
}

function unique(values) {
  return [...new Set(values)]
}

const nodeEnv = process.env.NODE_ENV || 'development'
const port = Number(process.env.PORT) || 4000
const clientUrls = unique([
  process.env.CLIENT_URL,
  ...normalizeList(process.env.CLIENT_URLS),
].filter(Boolean))

export const serverConfig = {
  nodeEnv,
  port,
  clientUrls: clientUrls.length ? clientUrls : ['http://localhost:5173'],
  jsonBodyLimit: process.env.JSON_BODY_LIMIT || '1mb',
  logFormat: nodeEnv === 'production' ? 'combined' : 'dev',
  isProduction: nodeEnv === 'production',
}
