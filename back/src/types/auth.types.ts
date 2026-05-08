export interface JwtPayload {
  userId: string
  email: string
  iat?: number
  exp?: number
}

export interface RefreshTokenPayload {
  userId: string
  version: number
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}
