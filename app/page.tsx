'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '../lib/AuthContext'

export default function HomePage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-lg">Loading...</div>
      </div>
    )
  }

  if (user) {
    return null // Will redirect to dashboard
  }

  return (
    <main className="p-4 sm:p-6 max-w-xl mx-auto space-y-6 pb-24">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-[#F5F5F5] mb-2">Daily Macros</h1>
        <p className="text-[#F5F5F5]/70">Track your daily calorie and protein intake</p>
      </div>
      
      <div className="grid grid-cols-1 gap-4">
        <Link 
          href="/auth"
          className="bg-gradient-to-r from-[#A100FF] to-[#00C2FF] text-white p-6 rounded-xl text-center hover:shadow-lg hover:shadow-[#A100FF]/25 shadow-xl transition-all"
        >
          <div className="text-2xl mb-2">🔐</div>
          <div className="font-semibold">Get Started</div>
          <div className="text-sm opacity-90 mt-1">Sign in or create an account</div>
        </Link>
      </div>

      <div className="bg-[#1A1C2C] rounded-xl p-6 border border-[#A100FF]/20">
        <h2 className="text-xl font-semibold text-[#F5F5F5] mb-4 text-center">Features</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl mb-2">📊</div>
            <div className="font-semibold text-[#F5F5F5]">Track Progress</div>
            <div className="text-sm text-[#F5F5F5]/70">Monitor calories & protein</div>
          </div>
          <div className="text-center">
            <div className="text-2xl mb-2">➕</div>
            <div className="font-semibold text-[#F5F5F5]">Log Food</div>
            <div className="text-sm text-[#F5F5F5]/70">Manual, search, or photo</div>
          </div>
          <div className="text-center">
            <div className="text-2xl mb-2">⭐</div>
            <div className="font-semibold text-[#F5F5F5]">Favorites</div>
            <div className="text-sm text-[#F5F5F5]/70">Quick access to common foods</div>
          </div>
          <div className="text-center">
            <div className="text-2xl mb-2">🎯</div>
            <div className="font-semibold text-[#F5F5F5]">Set Goals</div>
            <div className="text-sm text-[#F5F5F5]/70">Customize daily targets</div>
          </div>
        </div>
      </div>
    </main>
  )
}
