import { Router } from 'express'
import { createExamHandler, getActiveExamHandler, updateTopicHandler } from '../controllers/examController.js'

const router = Router()

router.get('/active', getActiveExamHandler)
router.post('/', createExamHandler)
router.patch('/topics/:id', updateTopicHandler)

export default router
