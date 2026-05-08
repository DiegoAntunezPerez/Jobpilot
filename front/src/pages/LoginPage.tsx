import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/useAuthStore'
import { Input } from '../components/UI/Input'
import { Button } from '../components/UI/Button'
import { Mail, Lock, Zap } from 'lucide-react'
import toast from 'react-hot-toast'

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { login, isLoading } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      await login(email, password)
      navigate('/')
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data
          ?.error ?? 'Error al iniciar sesión'
      setError(msg)
      toast.error(msg)
    }
  }

  return (
    <div className='min-h-screen flex items-center justify-center px-4 bg-[#0f1117]'>
      <div className='w-full max-w-sm'>
        {/* Logo */}
        <div className='text-center mb-8'>
          <div className='size-14 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-indigo-500/40 mx-auto mb-4'>
            <Zap size={28} className='text-white' />
          </div>
          <h1 className='text-2xl font-bold text-white'>
            Bienvenido a JobPilot
          </h1>
          <p className='text-slate-400 text-sm mt-1'>
            Tu copiloto en la búsqueda de empleo tech
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className='bg-[#161b27] border border-[#2d3448] rounded-2xl p-6 space-y-4'
        >
          <Input
            label='Email'
            type='email'
            icon={Mail}
            placeholder='tu@email.com'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete='email'
          />
          <Input
            label='Contraseña'
            type='password'
            icon={Lock}
            placeholder='Tu contraseña'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete='current-password'
          />

          {error && <p className='text-xs text-red-400'>{error}</p>}

          <Button
            type='submit'
            isLoading={isLoading}
            className='w-full'
            size='lg'
          >
            Iniciar sesión
          </Button>
        </form>

        <p className='text-center text-sm text-slate-500 mt-4'>
          ¿No tienes cuenta?{' '}
          <Link
            to='/register'
            className='text-indigo-400 hover:text-indigo-300 transition-colors'
          >
            Regístrate gratis
          </Link>
        </p>
      </div>
    </div>
  )
}
