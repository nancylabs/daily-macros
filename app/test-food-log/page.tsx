'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/AuthContext'
import { useFoodLog } from '@/lib/FoodLogContext'

interface TestResult {
  test: string
  status: string
  details?: string
}

export default function TestFoodLogPage() {
  const { user } = useAuth()
  const { addEntry, log, loading } = useFoodLog()
  const [status, setStatus] = useState<string>('Ready to test...')
  const [error, setError] = useState<string>('')
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [isRunning, setIsRunning] = useState(false)

  const runTests = async () => {
    setIsRunning(true)
    setTestResults([])
    setError('')
    
    try {
      setStatus('Starting food_log table tests...')
      
      if (!user) {
        setStatus('No user authenticated - please log in first')
        return
      }

      // Test 1: Check if food_log table exists
      setStatus('Step 1: Checking if food_log table exists...')
      const { data: tables, error: tablesError } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public')
        .eq('table_name', 'food_log')

      if (tablesError) {
        throw new Error(`Error checking tables: ${tablesError.message}`)
      }

      if (!tables || tables.length === 0) {
        throw new Error('food_log table does not exist. Please run the SQL script in Supabase first.')
      }

      setTestResults(prev => [...prev, { 
        test: 'Table Exists', 
        status: '✅ PASSED',
        details: 'food_log table found in database'
      }])
      setStatus('Step 2: Testing table structure...')

      // Test 2: Check table structure
      const { data: columns, error: columnsError } = await supabase
        .from('information_schema.columns')
        .select('column_name, data_type, is_nullable, column_default')
        .eq('table_schema', 'public')
        .eq('table_name', 'food_log')
        .order('ordinal_position')

      if (columnsError) {
        throw new Error(`Error checking table structure: ${columnsError.message}`)
      }

      const expectedColumns = ['id', 'user_id', 'name', 'calories', 'protein', 'timestamp', 'is_favorite']
      const foundColumns = columns?.map(c => c.column_name) || []
      const missingColumns = expectedColumns.filter(col => !foundColumns.includes(col))

      if (missingColumns.length > 0) {
        throw new Error(`Missing columns: ${missingColumns.join(', ')}`)
      }

      setTestResults(prev => [...prev, { 
        test: 'Table Structure', 
        status: '✅ PASSED',
        details: `Found all required columns: ${foundColumns.join(', ')}`
      }])
      setStatus('Step 3: Testing food log insertion...')

      // Test 3: Try to insert a test food log entry
      const testEntry = {
        user_id: user.id,
        name: 'Test Food Item',
        calories: 250,
        protein: 15,
        is_favorite: false
      }

      const { data: insertData, error: insertError } = await supabase
        .from('food_log')
        .insert(testEntry)
        .select()

      if (insertError) {
        throw new Error(`Error inserting test entry: ${insertError.message}`)
      }

      setTestResults(prev => [...prev, { 
        test: 'Insert Entry', 
        status: '✅ PASSED',
        details: `Successfully inserted entry with ID: ${insertData?.[0]?.id}`
      }])
      setStatus('Step 4: Testing food log selection...')

      // Test 4: Try to select the test entry
      const { data: selectData, error: selectError } = await supabase
        .from('food_log')
        .select('*')
        .eq('user_id', user.id)
        .eq('name', 'Test Food Item')

      if (selectError) {
        throw new Error(`Error selecting test entry: ${selectError.message}`)
      }

      if (!selectData || selectData.length === 0) {
        throw new Error('Could not retrieve inserted test entry')
      }

      setTestResults(prev => [...prev, { 
        test: 'Select Entry', 
        status: '✅ PASSED',
        details: `Retrieved ${selectData.length} entries for current user`
      }])
      setStatus('Step 5: Testing food log update...')

      // Test 5: Try to update the test entry
      const { data: updateData, error: updateError } = await supabase
        .from('food_log')
        .update({ calories: 300, protein: 20 })
        .eq('id', selectData[0].id)
        .select()

      if (updateError) {
        throw new Error(`Error updating test entry: ${updateError.message}`)
      }

      setTestResults(prev => [...prev, { 
        test: 'Update Entry', 
        status: '✅ PASSED',
        details: `Updated calories to ${updateData?.[0]?.calories} and protein to ${updateData?.[0]?.protein}g`
      }])
      setStatus('Step 6: Testing food log deletion...')

      // Test 6: Try to delete the test entry
      const { error: deleteError } = await supabase
        .from('food_log')
        .delete()
        .eq('id', selectData[0].id)

      if (deleteError) {
        throw new Error(`Error deleting test entry: ${deleteError.message}`)
      }

      setTestResults(prev => [...prev, { 
        test: 'Delete Entry', 
        status: '✅ PASSED',
        details: 'Successfully deleted test entry'
      }])
      setStatus('Step 7: Testing Row Level Security...')

      // Test 7: Test RLS - try to access another user's data (should fail or return empty)
      const { data: otherUserData, error: rlsError } = await supabase
        .from('food_log')
        .select('*')
        .neq('user_id', user.id)
        .limit(1)

      if (rlsError) {
        setTestResults(prev => [...prev, { 
          test: 'RLS Protection', 
          status: '✅ PASSED',
          details: 'Correctly blocked access to other user data'
        }])
      } else if (!otherUserData || otherUserData.length === 0) {
        setTestResults(prev => [...prev, { 
          test: 'RLS Protection', 
          status: '✅ PASSED',
          details: 'No other user data accessible (RLS working correctly)'
        }])
      } else {
        setTestResults(prev => [...prev, { 
          test: 'RLS Protection', 
          status: '❌ FAILED',
          details: 'Could access other user data - RLS may not be configured correctly'
        }])
      }

      // Test 8: Test multiple insertions create separate rows
      setStatus('Testing multiple insertions...')
      const testEntries = [
        { name: 'Test Food 1', calories: 100, protein: 10, is_favorite: false },
        { name: 'Test Food 1', calories: 100, protein: 10, is_favorite: false }, // Same name and values
        { name: 'Test Food 2', calories: 200, protein: 20, is_favorite: true } // This one is a favorite
      ]

      const insertedIds = []
      for (const testEntry of testEntries) {
        const { data: insertData, error: insertError } = await supabase
          .from('food_log')
          .insert({
            user_id: user.id,
            ...testEntry
          })
          .select()

        if (insertError) {
          throw new Error(`Error inserting test entry: ${insertError.message}`)
        }
        insertedIds.push(insertData[0].id)
      }

      // Verify all entries were created as separate rows
      const { data: allEntries, error: selectAllError } = await supabase
        .from('food_log')
        .select('*')
        .in('id', insertedIds)
        .order('timestamp', { ascending: true })

      if (selectAllError) {
        throw new Error(`Error selecting all test entries: ${selectAllError.message}`)
      }

      if (allEntries.length !== 3) {
        throw new Error(`Expected 3 separate entries, but found ${allEntries.length}`)
      }

      // Verify timestamps are different (indicating separate inserts)
      const timestamps = allEntries.map(entry => new Date(entry.timestamp).getTime())
      const uniqueTimestamps = new Set(timestamps)
      
      if (uniqueTimestamps.size !== 3) {
        throw new Error('Timestamps are not unique - entries may have been merged')
      }

      // Verify favorites are marked correctly
      const regularEntries = allEntries.filter(entry => !entry.is_favorite)
      const favoriteEntries = allEntries.filter(entry => entry.is_favorite)

      if (regularEntries.length !== 2) {
        throw new Error(`Expected 2 regular entries, but found ${regularEntries.length}`)
      }

      if (favoriteEntries.length !== 1) {
        throw new Error(`Expected 1 favorite entry, but found ${favoriteEntries.length}`)
      }

      setTestResults(prev => [...prev, { 
        test: 'Multiple Insertions', 
        status: '✅ PASSED',
        details: `Created ${allEntries.length} separate rows with unique timestamps (${regularEntries.length} regular, ${favoriteEntries.length} favorite)`
      }])

      // Test 9: Test goals table
      setStatus('Testing goals table...')
      
      // Check if goals table exists
      const { data: goalsTables, error: goalsTablesError } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public')
        .eq('table_name', 'goals')

      if (goalsTablesError) {
        throw new Error(`Error checking goals table: ${goalsTablesError.message}`)
      }

      if (!goalsTables || goalsTables.length === 0) {
        throw new Error('goals table does not exist. Please run the updated SQL script.')
      }

      setTestResults(prev => [...prev, { 
        test: 'Goals Table Exists', 
        status: '✅ PASSED',
        details: 'goals table found in database'
      }])

      // Test goals table structure
      const { data: goalsColumns, error: goalsColumnsError } = await supabase
        .from('information_schema.columns')
        .select('column_name, data_type, is_nullable, column_default')
        .eq('table_schema', 'public')
        .eq('table_name', 'goals')
        .order('ordinal_position')

      if (goalsColumnsError) {
        throw new Error(`Error checking goals table structure: ${goalsColumnsError.message}`)
      }

      const expectedGoalsColumns = ['id', 'user_id', 'daily_calories_goal', 'daily_protein_goal', 'created_at', 'updated_at']
      const foundGoalsColumns = goalsColumns?.map(c => c.column_name) || []
      const missingGoalsColumns = expectedGoalsColumns.filter(col => !foundGoalsColumns.includes(col))

      if (missingGoalsColumns.length > 0) {
        throw new Error(`Missing goals columns: ${missingGoalsColumns.join(', ')}`)
      }

      setTestResults(prev => [...prev, { 
        test: 'Goals Table Structure', 
        status: '✅ PASSED',
        details: `Found all required goals columns: ${foundGoalsColumns.join(', ')}`
      }])

      // Test goals insertion and retrieval
      const testGoals = {
        user_id: user.id,
        daily_calories_goal: 2000,
        daily_protein_goal: 100
      }

      const { data: insertGoalsData, error: insertGoalsError } = await supabase
        .from('goals')
        .upsert(testGoals, { onConflict: 'user_id' })
        .select('id, user_id, daily_calories_goal, daily_protein_goal')

      if (insertGoalsError) {
        throw new Error(`Error upserting goals: ${insertGoalsError.message}`)
      }

      setTestResults(prev => [...prev, { 
        test: 'Goals Upsert', 
        status: '✅ PASSED',
        details: `Successfully upserted goals: ${insertGoalsData?.[0]?.daily_calories_goal} cal, ${insertGoalsData?.[0]?.daily_protein_goal}g protein`
      }])

      // Test goals retrieval
      const { data: selectGoalsData, error: selectGoalsError } = await supabase
        .from('goals')
        .select('id, user_id, daily_calories_goal, daily_protein_goal')
        .eq('user_id', user.id)
        .single()

      if (selectGoalsError) {
        throw new Error(`Error selecting goals: ${selectGoalsError.message}`)
      }

      if (!selectGoalsData) {
        throw new Error('Could not retrieve goals')
      }

      setTestResults(prev => [...prev, { 
        test: 'Goals Select', 
        status: '✅ PASSED',
        details: `Retrieved goals: ${selectGoalsData.daily_calories_goal} cal, ${selectGoalsData.daily_protein_goal}g protein`
      }])

      // Clean up test entries
      setStatus('Cleaning up test data...')
      for (const id of insertedIds) {
        await supabase
          .from('food_log')
          .delete()
          .eq('id', id)
      }

      setStatus('All food_log table tests completed successfully! ✅')

    } catch (err: unknown) {
      console.error('Food log test error:', err)
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      setError(errorMessage)
      setStatus('Food log table test failed ❌')
    } finally {
      setIsRunning(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-2xl mx-auto pt-16">
        <h1 className="text-2xl font-bold text-white mb-6">Food Log Table Verification</h1>
        
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 mb-6">
          <h2 className="text-lg font-semibold text-white mb-4">Setup Instructions</h2>
          <div className="text-gray-300 text-sm space-y-2 mb-4">
            <p>1. Go to your Supabase dashboard</p>
            <p>2. Open the SQL Editor</p>
            <p>3. Copy and paste the SQL from <code className="bg-gray-800 px-2 py-1 rounded">create-food-log-table.sql</code></p>
            <p>4. Run the SQL script</p>
            <p>5. Click &quot;Run Tests&quot; below to verify everything works</p>
          </div>
          
          <button
            onClick={runTests}
            disabled={isRunning || !user}
            className="btn-save w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isRunning ? 'Running Tests...' : 'Run Tests'}
          </button>
        </div>
        
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 mb-6">
          <h2 className="text-lg font-semibold text-white mb-4">Status</h2>
          <p className="text-gray-300 mb-4">{status}</p>
          
          {error && (
            <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4 mb-4">
              <h3 className="text-red-400 font-semibold mb-2">Error:</h3>
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          {user && (
            <div className="p-4 bg-blue-500/20 border border-blue-500/30 rounded-lg mb-4">
              <h3 className="text-blue-400 font-semibold mb-2">User Info:</h3>
              <p className="text-blue-300 text-sm">ID: {user.id}</p>
              <p className="text-blue-300 text-sm">Email: {user.email}</p>
            </div>
          )}
        </div>

        {/* Test Results */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 mb-6">
          <h2 className="text-lg font-semibold text-white mb-4">Test Results</h2>
          {testResults.length === 0 ? (
            <p className="text-gray-300">No tests run yet. Click &quot;Run Tests&quot; to start verification.</p>
          ) : (
            <div className="space-y-3">
              {testResults.map((result, index) => (
                <div key={index} className="flex items-start justify-between p-3 bg-white/5 rounded-lg">
                  <div className="flex-1">
                    <span className="text-white font-medium">{result.test}</span>
                    {result.details && <p className="text-gray-400 text-sm mt-1">{result.details}</p>}
                  </div>
                  <span className={`${result.status.includes('PASSED') ? 'text-green-400' : 'text-red-400'} ml-4`}>
                    {result.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Current Food Log Data */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <h2 className="text-lg font-semibold text-white mb-4">Current Food Log Data</h2>
          {loading ? (
            <p className="text-gray-300">Loading...</p>
          ) : log.length === 0 ? (
            <p className="text-gray-300">No food logged yet</p>
          ) : (
            <div className="space-y-2">
              {log.map((entry, index) => (
                <div key={index} className="p-3 bg-white/5 rounded-lg">
                  <p className="text-white font-medium">{entry.name}</p>
                  <p className="text-gray-300 text-sm">{entry.calories} cal, {entry.protein}g protein</p>
                  <p className="text-gray-400 text-xs">{new Date(entry.timestamp).toLocaleString()}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 