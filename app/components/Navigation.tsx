'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Plus, Star } from 'lucide-react'

export default function Navigation() {
  const pathname = usePathname()

  const isActive = (path: string) => {
    if (path === '/') return pathname === '/'
    return pathname.startsWith(path)
  }

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 z-50 backdrop-blur-sm"
      style={{
        background: 'linear-gradient(135deg, rgba(125, 45, 185, 0.9), rgba(65, 30, 140, 0.9), rgba(28, 28, 48, 0.95))',
        borderTop: '1px solid rgba(161, 0, 255, 0.3)',
        boxShadow: '0 -4px 20px rgba(161, 0, 255, 0.25)'
      }}
    >
      <div className="flex justify-around items-center py-3 px-4">
        <Link
          href="/dashboard"
          className={`flex flex-col items-center py-2 px-4 rounded-xl transition-all duration-300 ${
            isActive('/dashboard') 
              ? 'text-[#F5F5F5]' 
              : 'text-[#F5F5F5]/70 hover:text-[#F5F5F5]'
          }`}
          style={{
            background: isActive('/dashboard') 
              ? 'linear-gradient(135deg, rgba(255, 98, 173, 0.2), rgba(161, 0, 255, 0.2))'
              : 'transparent',
            border: isActive('/dashboard') 
              ? '1px solid rgba(255, 98, 173, 0.3)'
              : '1px solid transparent'
          }}
        >
          <Home className={`w-6 h-6 ${isActive('/dashboard') ? 'drop-shadow-[0_0_8px_rgba(255,98,173,0.6)]' : ''}`} />
          <span className="text-xs font-medium mt-1">Dashboard</span>
        </Link>
        
        <Link
          href="/log"
          className={`flex flex-col items-center py-2 px-4 rounded-xl transition-all duration-300 ${
            isActive('/log') 
              ? 'text-[#F5F5F5]' 
              : 'text-[#F5F5F5]/70 hover:text-[#F5F5F5]'
          }`}
          style={{
            background: isActive('/log') 
              ? 'linear-gradient(135deg, rgba(255, 98, 173, 0.2), rgba(161, 0, 255, 0.2))'
              : 'transparent',
            border: isActive('/log') 
              ? '1px solid rgba(255, 98, 173, 0.3)'
              : '1px solid transparent'
          }}
        >
          <Plus className={`w-6 h-6 ${isActive('/log') ? 'drop-shadow-[0_0_8px_rgba(255,98,173,0.6)]' : ''}`} />
          <span className="text-xs font-medium mt-1">Log Food</span>
        </Link>
        
        <Link
          href="/favorites"
          className={`flex flex-col items-center py-2 px-4 rounded-xl transition-all duration-300 ${
            isActive('/favorites') 
              ? 'text-[#F5F5F5]' 
              : 'text-[#F5F5F5]/70 hover:text-[#F5F5F5]'
          }`}
          style={{
            background: isActive('/favorites') 
              ? 'linear-gradient(135deg, rgba(255, 98, 173, 0.2), rgba(161, 0, 255, 0.2))'
              : 'transparent',
            border: isActive('/favorites') 
              ? '1px solid rgba(255, 98, 173, 0.3)'
              : '1px solid transparent'
          }}
        >
          <Star className={`w-6 h-6 ${isActive('/favorites') ? 'drop-shadow-[0_0_8px_rgba(255,98,173,0.6)]' : ''}`} />
          <span className="text-xs font-medium mt-1">Favorites</span>
        </Link>
      </div>
    </nav>
  )
} 