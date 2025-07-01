'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { clsx } from 'clsx'

interface NavItem {
  href: string
  label: string
  icon: string
  isActive?: boolean
}

const navItems: NavItem[] = [
  { href: '/', label: 'Inicio', icon: '🏠' },
  { href: '/game', label: 'Jugar', icon: '🎮' },
  { href: '/collection', label: 'Cartas', icon: '🃏' },
  { href: '/narrative-rpg', label: 'Aventuras', icon: '📚' },
  { href: '/profile', label: 'Perfil', icon: '👤' },
]

export function MobileNav() {
  const pathname = usePathname()

  return (
    <nav className="nav-mobile">
      <div className="flex justify-around items-center h-full px-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center justify-center touch-target"
            >
              <span className="text-2xl mb-1">{item.icon}</span>
              <span 
                className={clsx(
                  'text-xs font-medium',
                  isActive ? 'text-primary-500' : 'text-gray-500'
                )}
              >
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
} 