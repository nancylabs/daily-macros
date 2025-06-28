'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '../../lib/AuthContext'

export default function SignUp() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const { signUp } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      setLoading(false)
      return
    }

    const { error } = await signUp(email, password)
    
    if (error) {
      const errorMessage = error && typeof error === 'object' && 'message' in error 
        ? (error as { message: string }).message 
        : 'An error occurred during sign up'
      setError(errorMessage)
    } else {
      setMessage('Check your email for a confirmation link!')
    }
    
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-[#1A1B2E] rounded-2xl p-8 shadow-2xl border border-[#2D2F45]">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
            <p className="text-gray-400">Join Daily Macros to track your nutrition</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-[#2D2F45] border border-[#3A3D5A] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:border-transparent"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 bg-[#2D2F45] border border-[#3A3D5A] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:border-transparent"
                placeholder="Enter your password"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full px-4 py-3 bg-[#2D2F45] border border-[#3A3D5A] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:border-transparent"
                placeholder="Confirm your password"
              />
            </div>

            {error && (
              <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-3">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {message && (
              <div className="bg-green-900/20 border border-green-500/50 rounded-lg p-3">
                <p className="text-green-400 text-sm">{message}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white font-semibold py-3 px-6 rounded-lg hover:from-[#5B5BD6] hover:to-[#7C3AED] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {loading ? 'Creating Account...' : 'Sign Up'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-400">
              Already have an account?{' '}
              <Link href="/login" className="text-[#6366F1] hover:text-[#8B5CF6] font-medium">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 