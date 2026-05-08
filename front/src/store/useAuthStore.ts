import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '../types/user.types'
import * as authService from '../services/auth.service'

interface AuthState {
  user: User | null
  accessToken: string | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (
    name: string,
    email: string,
    password: string,
    location?: string
  ) => Promise<void>
  logout: () => Promise<void>
  fetchMe: () => Promise<void>
  updateUser: (user: User) => void
  setToken: (token: string) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      isLoading: false,
      isAuthenticated: false,

      login: async (email, password) => {
        set({ isLoading: true })
        try {
          const { accessToken, user } = await authService.login({
            email,
            password
          })
          localStorage.setItem('accessToken', accessToken)
          set({ accessToken, user, isAuthenticated: true })
        } finally {
          set({ isLoading: false })
        }
      },

      register: async (name, email, password, location) => {
        set({ isLoading: true })
        try {
          const { accessToken, user } = await authService.register({
            name,
            email,
            password,
            location
          })
          localStorage.setItem('accessToken', accessToken)
          set({ accessToken, user, isAuthenticated: true })
        } finally {
          set({ isLoading: false })
        }
      },

      logout: async () => {
        try {
          await authService.logout()
        } catch {
          // ignorar
        }
        localStorage.removeItem('accessToken')
        set({ user: null, accessToken: null, isAuthenticated: false })
      },

      fetchMe: async () => {
        const { accessToken } = get()
        if (!accessToken) return
        try {
          const user = await authService.getMe()
          set({ user, isAuthenticated: true })
        } catch {
          set({ user: null, accessToken: null, isAuthenticated: false })
          localStorage.removeItem('accessToken')
        }
      },

      updateUser: (user) => set({ user }),
      setToken: (token) => {
        localStorage.setItem('accessToken', token)
        set({ accessToken: token })
      }
    }),
    {
      name: 'jobpilot-auth',
      partialize: (state) => ({
        accessToken: state.accessToken,
        user: state.user,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
)
