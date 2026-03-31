import { Router } from 'express'
import { getTutorialsHandler } from '../controllers/youtubeController.js'

const router = Router()

router.get('/tutorials', getTutorialsHandler)

export default router
