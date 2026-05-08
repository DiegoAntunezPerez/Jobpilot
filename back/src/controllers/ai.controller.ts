import { Request, Response, NextFunction } from 'express'
import * as aiService from '../services/ai.service'

export async function summarizeJob(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const data = aiService.summarizeJobSchema.parse(req.body)
    const result = await aiService.summarizeJob(data)
    res.json({ result })
  } catch (err) {
    next(err)
  }
}

export async function matchProfile(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const data = aiService.matchProfileSchema.parse(req.body)
    const result = await aiService.matchProfile(data)
    res.json({ result })
  } catch (err) {
    next(err)
  }
}

export async function generateHrMessage(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const data = aiService.hrMessageSchema.parse(req.body)
    const result = await aiService.generateHrMessage(data)
    res.json({ result })
  } catch (err) {
    next(err)
  }
}

export async function extractProfile(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const data = aiService.extractProfileSchema.parse(req.body)
    const result = await aiService.extractProfile(data)
    res.json(result)
  } catch (err) {
    next(err)
  }
}
