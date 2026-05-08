export interface User {
  id: string
  name: string
  email: string
  location?: string
  cvText?: string
  portfolioUrl?: string
  skills?: string[]
  createdAt?: string
}

export interface AuthResponse {
  accessToken: string
  user: User
}

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  name: string
  email: string
  password: string
  location?: string
}

export interface UpdateProfilePayload {
  name?: string
  location?: string
  cvText?: string
  portfolioUrl?: string
  skills?: string[]
}
