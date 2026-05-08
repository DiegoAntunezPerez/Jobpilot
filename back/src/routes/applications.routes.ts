import { Router } from 'express'
import { requireAuth } from '../middlewares/auth.middleware'
import { validate } from '../middlewares/validate.middleware'
import {
  createApplicationSchema,
  updateApplicationSchema
} from '../services/applications.service'
import * as appsCtrl from '../controllers/applications.controller'

const router = Router()

router.use(requireAuth)

router.post('/', validate(createApplicationSchema), appsCtrl.create)
router.get('/', appsCtrl.getAll)
router.get('/calendar', appsCtrl.getCalendar)
router.put('/:id', validate(updateApplicationSchema), appsCtrl.update)
router.delete('/:id', appsCtrl.remove)

export default router
