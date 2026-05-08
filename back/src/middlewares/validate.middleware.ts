import { Request, Response, NextFunction } from 'express'
import { ZodSchema, ZodError } from 'zod'

export function validate(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      schema.parse(req.body)
      next()
    } catch (err) {
      if (err instanceof ZodError) {
        const errors = err.errors.map((e) => ({
          campo: e.path.join('.'),
          mensaje: e.message
        }))
        res.status(400).json({ error: 'Datos inválidos', detalles: errors })
        return
      }
      next(err)
    }
  }
}

export function validateQuery(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      schema.parse(req.query)
      next()
    } catch (err) {
      if (err instanceof ZodError) {
        const errors = err.errors.map((e) => ({
          campo: e.path.join('.'),
          mensaje: e.message
        }))
        res
          .status(400)
          .json({ error: 'Parámetros de consulta inválidos', detalles: errors })
        return
      }
      next(err)
    }
  }
}
