'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useFoodLog } from '../../../lib/FoodLogContext'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import ProtectedRoute from '../../components/ProtectedRoute'

function ManualEntryForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { addEntry, addFavorite } = useFoodLog()
  const [formData, setFormData] = useState({
    name: '',
    calories: '',
    protein: ''
  })
  const [loading, setLoading] = useState(false)

  // Handle URL parameters for prefill
  useEffect(() => {
    const name = searchParams.get('name')
    const calories = searchParams.get('calories')
    const protein = searchParams.get('protein')
    
    if (name || calories || protein) {
      setFormData({
        name: name || '',
        calories: calories || '',
        protein: protein || ''
      })
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const entry = {
      name: formData.name,
      calories: parseInt(formData.calories) || 0,
      protein: parseInt(formData.protein) || 0
    }

    await addEntry(entry)
    router.push('/dashboard')
  }

  const handleLogAndSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const entry = {
      name: formData.name,
      calories: parseInt(formData.calories) || 0,
      protein: parseInt(formData.protein) || 0
    }

    await addEntry(entry)
    await addFavorite(entry)
    router.push('/dashboard')
  }

  return (
    <ProtectedRoute>
      <main className="p-4 sm:p-6 max-w-xl mx-auto space-y-6 pb-20">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Link href="/log" className="text-[#F5F5F5] hover:text-[#F5F5F5]/70">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-2xl font-bold text-[#F5F5F5]">Manual Entry</h1>
        </div>
        <div className="card-primary">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-primary">Food Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="input-primary"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-primary">Calories</label>
              <input
                type="number"
                value={formData.calories}
                onChange={(e) => setFormData(prev => ({ ...prev, calories: e.target.value }))}
                className="input-primary"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-primary">Protein (grams)</label>
              <input
                type="number"
                value={formData.protein}
                onChange={(e) => setFormData(prev => ({ ...prev, protein: e.target.value }))}
                className="input-primary"
                required
              />
            </div>
            <div className="space-y-3">
              <button
                type="submit"
                className="btn-save w-full"
                disabled={loading}
              >
                {loading ? 'Logging...' : 'Log Food Once'}
              </button>
              <button
                type="button"
                onClick={handleLogAndSave}
                className="btn-save w-full"
                disabled={loading}
                style={{
                  background: 'linear-gradient(135deg,rgba(255, 98, 174, 0.43),rgba(162, 0, 255, 0.78))',
                  boxShadow: '0 0 10px rgba(161, 0, 255, 0.4)',
                  border: '1px solid transparent',
                  borderRadius: '0.5rem',
                }}
              >
                {loading ? 'Logging...' : 'Log and Save to Favorites'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </ProtectedRoute>
  )
}

export default function ManualEntryPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ManualEntryForm />
    </Suspense>
  )
}
