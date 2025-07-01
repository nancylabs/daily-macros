'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '../../lib/AuthContext'
import { supabase } from '../../lib/supabase'

export default function TestDbPage() {
  const { user } = useAuth()
  const [entries, setEntries] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return
    setLoading(true)
    setError(null)
    supabase
      .from('food_log')
      .select('*')
      .eq('user_id', user.id)
      .order('timestamp', { ascending: false })
      .then(({ data, error }) => {
        if (error) setError(error.message)
        else setEntries(data || [])
        setLoading(false)
      })
  }, [user])

  return (
    <div className="max-w-xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">All Food Log Entries (for debugging)</h1>
      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}
      <ul className="space-y-2">
        {entries.map((entry) => (
          <li key={entry.id} className="bg-gray-800 text-white rounded p-3">
            <div><b>{entry.name}</b> ({entry.calories} cal, {entry.protein}g protein)</div>
            <div className="text-xs text-gray-400">{new Date(entry.timestamp).toLocaleString()} | is_favorite: {String(entry.is_favorite)}</div>
          </li>
        ))}
      </ul>
    </div>
  )
} 