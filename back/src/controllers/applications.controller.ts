import { Request, Response, NextFunction } from 'express'
import * as appService from '../services/applications.service'
import { ApplicationStatus } from '../models/application.model'

export async function create(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const app = await appService.createApplication(req.user!.userId, req.body)
    res.status(201).json(app)
  } catch (err) {
    next(err)
  }
}

export async function getAll(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const status = req.query.status as ApplicationStatus | undefined
    const apps = await appService.getUserApplications(req.user!.userId, status)
    res.json(apps)
  } catch (err) {
    next(err)
  }
}

export async function getCalendar(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const year = Number(req.query.year ?? new Date().getFullYear())
    const month = Number(req.query.month ?? new Date().getMonth() + 1)

    if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
      res.status(400).json({ error: 'Año o mes inválido' })
      return
    }

    const apps = await appService.getCalendarApplications(
      req.user!.userId,
      year,
      month
    )
    res.json(apps)
  } catch (err) {
    next(err)
  }
}

export async function update(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const app = await appService.updateApplication(
      req.user!.userId,
      req.params.id,
      req.body
    )
    res.json(app)
  } catch (err) {
    next(err)
  }
}

export async function remove(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    await appService.deleteApplication(req.user!.userId, req.params.id)
    res.json({ message: 'Aplicación eliminada' })
  } catch (err) {
    next(err)
  }
}
