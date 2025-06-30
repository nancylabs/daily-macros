'use client'

import { Suspense } from 'react'
import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '../../../lib/supabase'

export default function AuthCallbackPageWrapper() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-white">Loading...</div>}>
      <AuthCallbackPage />
    </Suspense>
  )
}

function AuthCallbackPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log('Auth callback triggered with params:', Object.fromEntries(searchParams.entries()))
        
        // Get all relevant parameters
        const accessToken = searchParams.get('access_token')
        const refreshToken = searchParams.get('refresh_token')
        const type = searchParams.get('type')
        const error = searchParams.get('error')
        const errorDescription = searchParams.get('error_description')

        console.log('Parsed params:', { accessToken: !!accessToken, refreshToken: !!refreshToken, type, error, errorDescription })

        if (error) {
          console.error('Auth error:', error, errorDescription)
          setStatus('error')
          setMessage(errorDescription || 'Authentication failed')
          setTimeout(() => router.push('/auth'), 3000)
          return
        }

        // Handle different types of callbacks
        if (type === 'signup' || type === 'recovery') {
          // For signup confirmation, we might not have tokens yet
          // Try to get the session from the current URL
          const { data, error: sessionError } = await supabase.auth.getSession()
          
          if (sessionError) {
            console.error('Session error:', sessionError)
            setStatus('error')
            setMessage('Failed to get session')
            setTimeout(() => router.push('/auth'), 3000)
            return
          }

          if (data.session) {
            // Success - user is now authenticated
            setStatus('success')
            setMessage('Email confirmed! Redirecting to dashboard...')
            setTimeout(() => router.push('/dashboard'), 2000)
          } else {
            // No session found, but this might be normal for email confirmation
            setStatus('success')
            setMessage('Email confirmed! You can now sign in.')
            setTimeout(() => router.push('/auth'), 3000)
          }
        } else if (accessToken && refreshToken) {
          // Handle token-based callback
          const { error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          })

          if (sessionError) {
            console.error('Session error:', sessionError)
            setStatus('error')
            setMessage('Failed to set session')
            setTimeout(() => router.push('/auth'), 3000)
            return
          }

          // Success - redirect to dashboard
          setStatus('success')
          setMessage('Email confirmed! Redirecting to dashboard...')
          setTimeout(() => router.push('/dashboard'), 2000)
        } else {
          // Try to handle the callback using Supabase's built-in handler
          const { data, error: callbackError } = await supabase.auth.getSession()
          
          if (callbackError) {
            console.error('Callback error:', callbackError)
            setStatus('error')
            setMessage('Failed to process callback')
            setTimeout(() => router.push('/auth'), 3000)
            return
          }

          if (data.session) {
            setStatus('success')
            setMessage('Email confirmed! Redirecting to dashboard...')
            setTimeout(() => router.push('/dashboard'), 2000)
          } else {
            setStatus('success')
            setMessage('Email confirmed! You can now sign in.')
            setTimeout(() => router.push('/auth'), 3000)
          }
        }
      } catch (error) {
        console.error('Callback error:', error)
        setStatus('error')
        setMessage('An unexpected error occurred')
        setTimeout(() => router.push('/auth'), 3000)
      }
    }

    handleAuthCallback()
  }, [searchParams, router])

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-[#1A1B2E] rounded-2xl p-8 shadow-2xl border border-[#2D2F45] text-center">
          {status === 'loading' && (
            <>
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6366F1] mx-auto mb-4"></div>
              <h1 className="text-2xl font-bold text-[#F5F5F5] mb-2">Confirming Email...</h1>
              <p className="text-[#F5F5F5]/70">Please wait while we verify your email address.</p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-[#F5F5F5] mb-2">Email Confirmed!</h1>
              <p className="text-[#F5F5F5]/70">{message}</p>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-[#F5F5F5] mb-2">Confirmation Failed</h1>
              <p className="text-[#F5F5F5]/70 mb-4">{message}</p>
              <button
                onClick={() => router.push('/auth')}
                className="bg-[#6366F1] text-white px-4 py-2 rounded-lg hover:bg-[#5B5BD6] transition-colors"
              >
                Back to Sign In
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
} 