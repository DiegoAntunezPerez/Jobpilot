import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import { requireAuth } from '../middlewares/auth.middleware'
import * as aiCtrl from '../controllers/ai.controller'

// Limitar llamadas IA para proteger costes
const aiLimiter = rateLimit({
  windowMs: 60_000,
  max: 10,
  message: { error: 'Demasiadas peticiones a la IA. Espera un minuto.' }
})

const router = Router()

router.use(requireAuth)
router.use(aiLimiter)

router.post('/summarize-job', aiCtrl.summarizeJob)
router.post('/match-profile', aiCtrl.matchProfile)
router.post('/message-for-hr', aiCtrl.generateHrMessage)
router.post('/extract-profile', aiCtrl.extractProfile)

export default router
