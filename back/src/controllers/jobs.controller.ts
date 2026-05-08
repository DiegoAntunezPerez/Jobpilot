import { Request, Response, NextFunction } from 'express'
import * as jobsService from '../services/jobs.service'

export async function searchJobs(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const params = jobsService.jobSearchQuerySchema.parse(req.query)
    const result = await jobsService.searchJobs(params)
    res.json(result)
  } catch (err) {
    next(err)
  }
}

export async function getJobById(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const job = await jobsService.getJobById(req.params.id)
    res.json(job)
  } catch (err) {
    next(err)
  }
}

export function getPortals(_req: Request, res: Response): void {
  res.json({ portals: jobsService.getPortals() })
}
