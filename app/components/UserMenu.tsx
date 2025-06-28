'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../lib/AuthContext'
import { User, LogOut, Settings, ChevronDown } from 'lucide-react'

export default function UserMenu() {
  const { user, signOut } = useAuth()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleLogout = async () => {
    await signOut()
    router.push('/auth')
    setIsOpen(false)
  }

  const getUserInitials = (email: string) => {
    return email.charAt(0).toUpperCase()
  }

  if (!user) return null

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 bg-[#2D2F45] hover:bg-[#3A3D5A] text-[#F5F5F5] px-3 py-2 rounded-lg transition-colors"
      >
        <div className="w-8 h-8 bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] rounded-full flex items-center justify-center text-white font-semibold text-sm">
          {getUserInitials(user.email || '')}
        </div>
        <span className="hidden sm:block text-sm font-medium truncate max-w-24">
          {user.email}
        </span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-[#1A1B2E] border border-[#2D2F45] rounded-lg shadow-xl z-50">
          <div className="py-1">
            <div className="px-4 py-2 border-b border-[#2D2F45]">
              <p className="text-sm text-[#F5F5F5] font-medium truncate">{user.email}</p>
              <p className="text-xs text-[#F5F5F5]/70">Signed in</p>
            </div>
            
            <button
              onClick={() => {
                router.push('/dashboard')
                setIsOpen(false)
              }}
              className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-[#F5F5F5] hover:bg-[#2D2F45] transition-colors"
            >
              <User className="w-4 h-4" />
              <span>Dashboard</span>
            </button>
            
            <button
              onClick={() => {
                router.push('/favorites')
                setIsOpen(false)
              }}
              className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-[#F5F5F5] hover:bg-[#2D2F45] transition-colors"
            >
              <Settings className="w-4 h-4" />
              <span>Favorites</span>
            </button>
            
            <div className="border-t border-[#2D2F45] mt-1">
              <button
                onClick={handleLogout}
                className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-red-400 hover:bg-[#2D2F45] hover:text-red-300 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 