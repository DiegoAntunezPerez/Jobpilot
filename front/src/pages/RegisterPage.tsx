import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/useAuthStore'
import { Input } from '../components/UI/Input'
import { Button } from '../components/UI/Button'
import { Mail, Lock, User, MapPin, Zap } from 'lucide-react'
import toast from 'react-hot-toast'

export function RegisterPage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    location: ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const { register, isLoading } = useAuthStore()
  const navigate = useNavigate()

  const validate = () => {
    const e: Record<string, string> = {}
    if (form.name.length < 2) e.name = 'El nombre es demasiado corto'
    if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Email inválido'
    if (form.password.length < 8) e.password = 'Mínimo 8 caracteres'
    if (!/[A-Z]/.test(form.password)) e.password = 'Debe contener una mayúscula'
    if (!/[0-9]/.test(form.password)) e.password = 'Debe contener un número'
    if (form.password !== form.confirmPassword)
      e.confirmPassword = 'Las contraseñas no coinciden'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleChange =
    (key: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }))

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    try {
      await register(form.name, form.email, form.password, form.location)
      toast.success('¡Cuenta creada! Bienvenido a JobPilot')
      navigate('/')
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data
          ?.error ?? 'Error al crear la cuenta'
      toast.error(msg)
    }
  }

  return (
    <div className='min-h-screen flex items-center justify-center px-4 py-8 bg-[#0f1117]'>
      <div className='w-full max-w-sm'>
        <div className='text-center mb-8'>
          <div className='size-14 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-indigo-500/40 mx-auto mb-4'>
            <Zap size={28} className='text-white' />
          </div>
          <h1 className='text-2xl font-bold text-white'>Crear cuenta</h1>
          <p className='text-slate-400 text-sm mt-1'>
            Empieza a gestionar tu búsqueda de empleo
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className='bg-[#161b27] border border-[#2d3448] rounded-2xl p-6 space-y-4'
        >
          <Input
            label='Nombre completo'
            icon={User}
            placeholder='Tu nombre'
            value={form.name}
            onChange={handleChange('name')}
            error={errors.name}
            required
          />
          <Input
            label='Email'
            type='email'
            icon={Mail}
            placeholder='tu@email.com'
            value={form.email}
            onChange={handleChange('email')}
            error={errors.email}
            required
            autoComplete='email'
          />
          <Input
            label='Contraseña'
            type='password'
            icon={Lock}
            placeholder='Mínimo 8 caracteres'
            value={form.password}
            onChange={handleChange('password')}
            error={errors.password}
            required
            autoComplete='new-password'
          />
          <Input
            label='Confirmar contraseña'
            type='password'
            icon={Lock}
            placeholder='Repite tu contraseña'
            value={form.confirmPassword}
            onChange={handleChange('confirmPassword')}
            error={errors.confirmPassword}
            required
          />
          <Input
            label='Ubicación (opcional)'
            icon={MapPin}
            placeholder='Madrid, Barcelona...'
            value={form.location}
            onChange={handleChange('location')}
          />

          <Button
            type='submit'
            isLoading={isLoading}
            className='w-full'
            size='lg'
          >
            Crear cuenta
          </Button>
        </form>

        <p className='text-center text-sm text-slate-500 mt-4'>
          ¿Ya tienes cuenta?{' '}
          <Link
            to='/login'
            className='text-indigo-400 hover:text-indigo-300 transition-colors'
          >
            Iniciar sesión
          </Link>
        </p>
      </div>
    </div>
  )
}
