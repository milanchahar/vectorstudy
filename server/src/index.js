import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import dotenv from 'dotenv'
import geminiRoutes from './routes/geminiRoutes.js'
import examRoutes from './routes/examRoutes.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 4000

app.use(helmet())
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }))
app.use(morgan('dev'))
app.use(express.json())

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.use('/api/gemini', geminiRoutes)
app.use('/api/exams', examRoutes)

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
