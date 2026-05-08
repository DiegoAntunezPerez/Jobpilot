import { z } from 'zod'
import { User } from '../models/user.model'
import { generateTokenPair, verifyRefreshToken } from '../lib/token'
import { createError } from '../middlewares/error.middleware'
import { AuthTokens } from '../types/auth.types'

export const registerSchema = z.object({
  name: z.string().min(2, 'El nombre es demasiado corto').max(100),
  email: z.string().email('Email inválido'),
  password: z
    .string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .regex(/[A-Z]/, 'Debe contener al menos una mayúscula')
    .regex(/[0-9]/, 'Debe contener al menos un número'),
  location: z.string().max(100).optional()
})

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'La contraseña es obligatoria')
})

export const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  location: z.string().max(100).optional(),
  cvText: z.string().max(20000).optional(),
  portfolioUrl: z
    .string()
    .url('URL inválida')
    .max(500)
    .optional()
    .or(z.literal('')),
  skills: z.array(z.string()).optional()
})

// ── Registro ──────────────────────────────────────────────

export async function registerUser(
  data: z.infer<typeof registerSchema>
): Promise<AuthTokens & { user: object }> {
  const existing = await User.findOne({ email: data.email })
  if (existing) throw createError('Ya existe una cuenta con ese email', 409)

  const user = await User.create(data)
  const tokens = generateTokenPair(
    user._id.toString(),
    user.email,
    user.refreshTokenVersion
  )
  return {
    ...tokens,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      location: user.location
    }
  }
}

// ── Login ─────────────────────────────────────────────────

export async function loginUser(
  data: z.infer<typeof loginSchema>
): Promise<AuthTokens & { user: object }> {
  const user = await User.findOne({ email: data.email }).select('+password')
  if (!user) throw createError('Credenciales inválidas', 401)

  const valid = await user.comparePassword(data.password)
  if (!valid) throw createError('Credenciales inválidas', 401)

  const tokens = generateTokenPair(
    user._id.toString(),
    user.email,
    user.refreshTokenVersion
  )
  return {
    ...tokens,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      location: user.location
    }
  }
}

// ── Refresh Token ─────────────────────────────────────────

export async function refreshAccessToken(token: string): Promise<AuthTokens> {
  let payload: ReturnType<typeof verifyRefreshToken>
  try {
    payload = verifyRefreshToken(token)
  } catch {
    throw createError('Refresh token inválido o expirado', 401)
  }

  const user = await User.findById(payload.userId)
  if (!user) throw createError('Usuario no encontrado', 401)
  if (user.refreshTokenVersion !== payload.version) {
    throw createError('Sesión revocada. Por favor inicia sesión de nuevo.', 401)
  }

  return generateTokenPair(
    user._id.toString(),
    user.email,
    user.refreshTokenVersion
  )
}

// ── Obtener perfil ────────────────────────────────────────

export async function getProfile(userId: string): Promise<object> {
  const user = await User.findById(userId).select(
    '-password -refreshTokenVersion'
  )
  if (!user) throw createError('Usuario no encontrado', 404)
  return user
}

// ── Actualizar perfil ─────────────────────────────────────

export async function updateProfile(
  userId: string,
  data: z.infer<typeof updateProfileSchema>
): Promise<object> {
  const user = await User.findByIdAndUpdate(userId, data, {
    new: true,
    runValidators: true
  }).select('-password -refreshTokenVersion')
  if (!user) throw createError('Usuario no encontrado', 404)
  return user
}

// ── Cerrar sesión (invalida refresh tokens) ─────────────────────

export async function logoutUser(userId: string): Promise<void> {
  await User.findByIdAndUpdate(userId, { $inc: { refreshTokenVersion: 1 } })
}
