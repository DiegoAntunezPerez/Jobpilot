import { Link, useNavigate, useLocation } from 'react-router-dom'
import {
  Search,
  Calendar,
  User,
  LogOut,
  Menu,
  X,
  Zap
} from 'lucide-react'
import { useState } from 'react'
import { useAuthStore } from '../../store/useAuthStore'
import clsx from 'clsx'

const NAV_ITEMS = [
  { to: '/', label: 'Ofertas', icon: Search },
  { to: '/calendar', label: 'Calendario', icon: Calendar },
  { to: '/profile', label: 'Perfil', icon: User }
]

export function Header() {
  const { user, isAuthenticated, logout } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <header className='sticky top-0 z-40 glass border-b border-[#2d3448]/80'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4'>
        {/* Logo */}
        <Link to='/' className='flex items-center gap-2 flex-shrink-0'>
          <div className='size-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/30'>
            <Zap size={16} className='text-white' />
          </div>
          <span className='text-lg font-bold gradient-text hidden sm:block'>
            JobPilot
          </span>
        </Link>

        {/* Desktop nav */}
        {isAuthenticated && (
          <nav className='hidden md:flex items-center gap-1'>
            {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className={clsx(
                  'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  location.pathname === to
                    ? 'bg-indigo-600/20 text-indigo-400'
                    : 'text-slate-400 hover:text-white hover:bg-[#1e2535]'
                )}
              >
                <Icon size={15} />
                {label}
              </Link>
            ))}
          </nav>
        )}

        {/* Right side */}
        <div className='flex items-center gap-2'>
          {isAuthenticated ? (
            <>
              <span className='hidden sm:block text-sm text-slate-400 truncate max-w-[150px]'>
                {user?.name}
              </span>
              <button
                onClick={handleLogout}
                className='flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors'
                title='Cerrar sesión'
              >
                <LogOut size={15} />
                <span className='hidden sm:block'>Salir</span>
              </button>
            </>
          ) : (
            <div className='flex items-center gap-2'>
              <Link
                to='/login'
                className='px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-white transition-colors'
              >
                Entrar
              </Link>
              <Link
                to='/register'
                className='px-3 py-2 rounded-lg text-sm bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition-colors'
              >
                Registrarse
              </Link>
            </div>
          )}

          {/* Mobile menu toggle */}
          {isAuthenticated && (
            <button
              className='md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-[#1e2535]'
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          )}
        </div>
      </div>

      {/* Mobile nav */}
      {isAuthenticated && menuOpen && (
        <div className='md:hidden border-t border-[#2d3448] bg-[#161b27] px-4 py-2'>
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              onClick={() => setMenuOpen(false)}
              className={clsx(
                'flex items-center gap-2 px-3 py-3 rounded-lg text-sm font-medium transition-colors',
                location.pathname === to
                  ? 'text-indigo-400'
                  : 'text-slate-400 hover:text-white'
              )}
            >
              <Icon size={16} />
              {label}
            </Link>
          ))}
          <button
            onClick={handleLogout}
            className='flex items-center gap-2 px-3 py-3 w-full text-left text-sm text-red-400'
          >
            <LogOut size={16} />
            Cerrar sesión
          </button>
        </div>
      )}
    </header>
  )
}
