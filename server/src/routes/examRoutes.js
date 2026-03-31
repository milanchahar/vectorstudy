import { Router } from 'express'
import { createExamHandler } from '../controllers/examController.js'

const router = Router()

router.post('/', createExamHandler)

export default router
