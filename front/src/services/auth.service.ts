import api from './api'
import type {
  LoginPayload,
  RegisterPayload,
  AuthResponse,
  User,
  UpdateProfilePayload
} from '../types/user.types'

export async function login(payload: LoginPayload): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>('/auth/login', payload)
  return data
}

export async function register(
  payload: RegisterPayload
): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>('/auth/register', payload)
  return data
}

export async function getMe(): Promise<User> {
  const { data } = await api.get<User>('/auth/me')
  return data
}

export async function updateMe(payload: UpdateProfilePayload): Promise<User> {
  const { data } = await api.put<User>('/auth/me', payload)
  return data
}

export async function logout(): Promise<void> {
  await api.post('/auth/logout')
}
