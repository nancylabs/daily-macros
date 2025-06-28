'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/AuthContext'

export default function TestDBPage() {
  const { user } = useAuth()
  const [status, setStatus] = useState<string>('Testing...')
  const [error, setError] = useState<string>('')

  useEffect(() => {
    async function testDatabase() {
      try {
        setStatus('Testing database connection...')
        
        if (!user) {
          setStatus('No user authenticated')
          return
        }

        // Test 1: Check if tables exist
        setStatus('Checking if tables exist...')
        const { data: tables, error: tablesError } = await supabase
          .from('information_schema.tables')
          .select('table_name')
          .eq('table_schema', 'public')
          .in('table_name', ['food_log', 'goals'])

        if (tablesError) {
          throw new Error(`Error checking tables: ${tablesError.message}`)
        }

        console.log('Available tables:', tables)
        setStatus(`Found tables: ${tables?.map(t => t.table_name).join(', ')}`)

        // Test 2: Try to insert a test goal
        setStatus('Testing goals table...')
        const { data: goalData, error: goalError } = await supabase
          .from('goals')
          .upsert({
            user_id: user.id,
            daily_calories_goal: 1800,
            daily_protein_goal: 75
          })
          .select()

        if (goalError) {
          throw new Error(`Error with goals table: ${goalError.message}`)
        }

        console.log('Goals test result:', goalData)
        setStatus('Goals table working')

        // Test 3: Try to insert a test food log entry
        setStatus('Testing food_log table...')
        const { data: foodData, error: foodError } = await supabase
          .from('food_log')
          .insert({
            user_id: user.id,
            name: 'Test Food',
            calories: 100,
            protein: 10
          })
          .select()

        if (foodError) {
          throw new Error(`Error with food_log table: ${foodError.message}`)
        }

        console.log('Food log test result:', foodData)
        setStatus('Food log table working')

        // Test 4: Clean up test data
        setStatus('Cleaning up test data...')
        if (foodData && foodData[0]) {
          await supabase
            .from('food_log')
            .delete()
            .eq('id', foodData[0].id)
        }

        setStatus('All database tests passed! ✅')

      } catch (err: unknown) {
        console.error('Database test error:', err)
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
        setError(errorMessage)
        setStatus('Database test failed ❌')
      }
    }

    testDatabase()
  }, [user])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-md mx-auto pt-16">
        <h1 className="text-2xl font-bold text-white mb-6">Database Test</h1>
        
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <h2 className="text-lg font-semibold text-white mb-4">Status</h2>
          <p className="text-gray-300 mb-4">{status}</p>
          
          {error && (
            <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4">
              <h3 className="text-red-400 font-semibold mb-2">Error:</h3>
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          {user && (
            <div className="mt-4 p-4 bg-blue-500/20 border border-blue-500/30 rounded-lg">
              <h3 className="text-blue-400 font-semibold mb-2">User Info:</h3>
              <p className="text-blue-300 text-sm">ID: {user.id}</p>
              <p className="text-blue-300 text-sm">Email: {user.email}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 