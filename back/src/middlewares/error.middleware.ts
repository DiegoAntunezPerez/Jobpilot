import { Request, Response, NextFunction } from 'express'

export interface AppError extends Error {
  statusCode?: number
  isOperational?: boolean
}

export function createError(message: string, statusCode: number): AppError {
  const err: AppError = new Error(message)
  err.statusCode = statusCode
  err.isOperational = true
  return err
}

export function errorHandler(
  err: AppError,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void {
  const statusCode = err.statusCode ?? 500
  const message =
    err.isOperational || process.env.NODE_ENV === 'development'
      ? err.message
      : 'Error interno del servidor'

  if (process.env.NODE_ENV !== 'test') {
    console.error(`[${statusCode}] ${err.message}`)
    if (!err.isOperational) console.error(err.stack)
  }

  res.status(statusCode).json({ error: message })
}
