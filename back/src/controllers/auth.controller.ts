import { Request, Response, NextFunction } from 'express'
import * as authService from '../services/auth.service'

export async function register(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const result = await authService.registerUser(req.body)
    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    })
    res.status(201).json({ accessToken: result.accessToken, user: result.user })
  } catch (err) {
    next(err)
  }
}

export async function login(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const result = await authService.loginUser(req.body)
    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    })
    res.json({ accessToken: result.accessToken, user: result.user })
  } catch (err) {
    next(err)
  }
}

export async function refresh(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const token = req.cookies?.refreshToken as string | undefined
    if (!token) {
      res.status(401).json({ error: 'Refresh token no encontrado' })
      return
    }
    const tokens = await authService.refreshAccessToken(token)
    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    })
    res.json({ accessToken: tokens.accessToken })
  } catch (err) {
    next(err)
  }
}

export async function getMe(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const user = await authService.getProfile(req.user!.userId)
    res.json(user)
  } catch (err) {
    next(err)
  }
}

export async function updateMe(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const user = await authService.updateProfile(req.user!.userId, req.body)
    res.json(user)
  } catch (err) {
    next(err)
  }
}

export async function logout(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    await authService.logoutUser(req.user!.userId)
    res.clearCookie('refreshToken')
    res.json({ message: 'Sesión cerrada correctamente' })
  } catch (err) {
    next(err)
  }
}
