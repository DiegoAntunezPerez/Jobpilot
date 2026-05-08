import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { env } from '../config/env'
import { JwtPayload } from '../types/auth.types'

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload
    }
  }
}

export function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Token de acceso no proporcionado' })
    return
  }

  const token = authHeader.split(' ')[1]
  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as JwtPayload
    req.user = payload
    next()
  } catch {
    res.status(401).json({ error: 'Token inválido o expirado' })
  }
}

export function optionalAuth(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1]
    try {
      const payload = jwt.verify(token, env.JWT_SECRET) as JwtPayload
      req.user = payload
    } catch {
      // ignorar
    }
  }
  next()
}
