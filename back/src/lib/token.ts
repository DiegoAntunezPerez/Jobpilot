import jwt from 'jsonwebtoken'
import { env } from '../config/env'
import {
  JwtPayload,
  RefreshTokenPayload,
  AuthTokens
} from '../types/auth.types'

export function generateAccessToken(
  payload: Omit<JwtPayload, 'iat' | 'exp'>
): string {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn']
  })
}

export function generateRefreshToken(payload: RefreshTokenPayload): string {
  return jwt.sign(payload, env.REFRESH_TOKEN_SECRET, {
    expiresIn: env.REFRESH_TOKEN_EXPIRES_IN as jwt.SignOptions['expiresIn']
  })
}

export function verifyAccessToken(token: string): JwtPayload {
  return jwt.verify(token, env.JWT_SECRET) as JwtPayload
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
  return jwt.verify(token, env.REFRESH_TOKEN_SECRET) as RefreshTokenPayload
}

export function generateTokenPair(
  userId: string,
  email: string,
  refreshTokenVersion: number
): AuthTokens {
  const accessToken = generateAccessToken({ userId, email })
  const refreshToken = generateRefreshToken({
    userId,
    version: refreshTokenVersion
  })
  return { accessToken, refreshToken }
}
