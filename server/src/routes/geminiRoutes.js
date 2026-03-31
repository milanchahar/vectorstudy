import { Router } from 'express'
import { classifyTopicsHandler } from '../controllers/geminiController.js'

const router = Router()

router.post('/topics', classifyTopicsHandler)

export default router

