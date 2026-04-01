import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import geminiRoutes from './routes/geminiRoutes.js'
import examRoutes from './routes/examRoutes.js'
import youtubeRoutes from './routes/youtubeRoutes.js'
import { serverConfig } from './config.js'

const app = express()

app.use(helmet())
app.use(cors({
  origin(origin, callback) {
    if (!origin || serverConfig.clientUrls.includes(origin)) {
      callback(null, true)
      return
    }

    callback(new Error(`Origin not allowed: ${origin}`))
  },
  credentials: true,
}))
app.use(morgan(serverConfig.logFormat))
app.use(express.json({ limit: serverConfig.jsonBodyLimit }))

if (serverConfig.isProduction) {
  app.set('trust proxy', 1)
}

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    env: serverConfig.nodeEnv,
    timestamp: new Date().toISOString(),
  })
})

app.use('/api/gemini', geminiRoutes)
app.use('/api/exams', examRoutes)
app.use('/api/youtube', youtubeRoutes)

app.listen(serverConfig.port, () => {
  console.log(`Server running on port ${serverConfig.port}`)
})
