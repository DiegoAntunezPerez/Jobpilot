import { Router } from 'express'
import { validate } from '../middlewares/validate.middleware'
import { requireAuth } from '../middlewares/auth.middleware'
import {
  registerSchema,
  loginSchema,
  updateProfileSchema
} from '../services/auth.service'
import * as authCtrl from '../controllers/auth.controller'

const router = Router()

router.post('/register', validate(registerSchema), authCtrl.register)
router.post('/login', validate(loginSchema), authCtrl.login)
router.post('/refresh', authCtrl.refresh)
router.post('/logout', requireAuth, authCtrl.logout)
router.get('/me', requireAuth, authCtrl.getMe)
router.put('/me', requireAuth, validate(updateProfileSchema), authCtrl.updateMe)

export default router
