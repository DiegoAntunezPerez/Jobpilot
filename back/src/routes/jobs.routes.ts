import { Router } from 'express'
import * as jobsCtrl from '../controllers/jobs.controller'

const router = Router()

router.get('/portals', jobsCtrl.getPortals)
router.get('/search', jobsCtrl.searchJobs)
router.get('/:id', jobsCtrl.getJobById)

export default router
