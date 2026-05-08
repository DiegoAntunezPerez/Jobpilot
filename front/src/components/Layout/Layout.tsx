import type { ReactNode } from 'react'
import { Header } from './Header'

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className='min-h-screen flex flex-col bg-[#0f1117]'>
      <Header />
      <main className='flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6'>
        {children}
      </main>

      <footer className='border-t border-[#1e2535] py-4 text-center text-xs text-slate-600'>
        © 2026 Diego Antunez Perez · Todos los derechos reservados
      </footer>
    </div>
  )
}
