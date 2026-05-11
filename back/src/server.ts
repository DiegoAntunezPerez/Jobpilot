import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import cookieParser from 'cookie-parser'
import rateLimit from 'express-rate-limit'

import { env } from './config/env'
import { connectDB } from './config/database'
import { errorHandler } from './middlewares/error.middleware'

import authRoutes from './routes/auth.routes'
import jobsRoutes from './routes/jobs.routes'
import applicationsRoutes from './routes/applications.routes'
import aiRoutes from './routes/ai.routes'

const app = express()

// ── Seguridad ──────────────────────────────────────────────
app.use(helmet())

app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
)

// ── Health check (fuera del rate limiter) ──────────────────
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', env: env.NODE_ENV, ts: new Date().toISOString() })
})

const limiter = rateLimit({
  windowMs: Number(env.RATE_LIMIT_WINDOW_MS),
  max: Number(env.RATE_LIMIT_MAX),
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiadas peticiones. Inténtalo más tarde.' }
})

app.use('/api', limiter)

// ── Parsers ────────────────────────────────────────────────
app.use(express.json({ limit: '2mb' }))
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

// ── Rutas ──────────────────────────────────────────────────
app.use('/api/auth', authRoutes)
app.use('/api/jobs', jobsRoutes)
app.use('/api/applications', applicationsRoutes)
app.use('/api/ai', aiRoutes)

// ── Error handler global ───────────────────────────────────
app.use(errorHandler)

// ── Inicio ─────────────────────────────────────────────────
const PORT = Number(env.PORT)

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Servidor JobPilot corriendo en http://localhost:${PORT}`)
  })
})

export default app
