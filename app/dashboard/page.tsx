'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useFoodLog } from '../../lib/FoodLogContext'
import { useAuth } from '../../lib/AuthContext'
import { Edit } from 'lucide-react'
import FadeIn from '../components/FadeIn'
import ProtectedRoute from '../components/ProtectedRoute'
import UserMenu from '../components/UserMenu'
import { getFoodImage } from '@/lib/getFoodImage'
import { useEffect } from 'react'

export default function DashboardPage() {
  const router = useRouter()
  const { log, updateEntry, goals, updateGoals, removeEntry, loading, addEntry } = useFoodLog()
  const { signOut } = useAuth()
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [editingEntry, setEditingEntry] = useState({ name: '', calories: '', protein: '' })
  const [showGoalEditor, setShowGoalEditor] = useState(false)
  const [editingGoals, setEditingGoals] = useState({
    daily_calories_goal: goals.daily_calories_goal.toString(),
    daily_protein_goal: goals.daily_protein_goal.toString()
  })
  const [tempGoals, setTempGoals] = useState(goals)
  const [tempEntry, setTempEntry] = useState({ name: '', calories: 0, protein: 0 })

  // Debug logging for log state
  useEffect(() => {
    console.log('📊 Dashboard - Current log state:', log)
    console.log('📈 Dashboard - Number of entries:', log.length)
  }, [log])

  // Calculate totals
  const totalCalories = log.reduce((sum, entry) => sum + entry.calories, 0)
  const totalProtein = log.reduce((sum, entry) => sum + entry.protein, 0)
  const caloriesRemaining = Math.max(0, goals.daily_calories_goal - totalCalories)
  const proteinRemaining = Math.max(0, goals.daily_protein_goal - totalProtein)
  const calorieProgress = Math.min(100, (totalCalories / goals.daily_calories_goal) * 100)
  const proteinProgress = Math.min(100, (totalProtein / goals.daily_protein_goal) * 100)

  // Update temp goals when goals change
  useEffect(() => {
    setTempGoals(goals)
  }, [goals])

  const handleEdit = (index: number) => {
    const entry = log[index]
    setEditingEntry({
      name: entry.name,
      calories: entry.calories.toString(),
      protein: entry.protein.toString()
    })
    setEditingIndex(index)
    setTempEntry({ name: entry.name, calories: entry.calories, protein: entry.protein })
  }

  const handleSaveEdit = () => {
    if (editingIndex !== null) {
      updateEntry(editingIndex, {
        name: editingEntry.name,
        calories: parseInt(editingEntry.calories),
        protein: parseInt(editingEntry.protein)
      })
      setEditingIndex(null)
      setEditingEntry({ name: '', calories: '', protein: '' })
    }
  }

  const handleSaveGoals = async () => {
    await updateGoals({
      daily_calories_goal: parseInt(editingGoals.daily_calories_goal),
      daily_protein_goal: parseInt(editingGoals.daily_protein_goal)
    })
    setShowGoalEditor(false)
  }

  const handleLogout = async () => {
    await signOut()
    router.push('/login')
  }

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    }).format(date)
  }

  // Circular Progress Component
  const CircularProgress = ({ 
    percentage, 
    value, 
    label, 
    subtitle, 
    color, 
    bgColor,
    textColor = "text-[#F5F5F5]"
  }: {
    percentage: number
    value: string
    label: string
    subtitle: string
    color: string
    bgColor: string
    textColor?: string
  }) => {
    const radius = 60
    const circumference = 2 * Math.PI * radius
    const strokeDasharray = circumference
    const strokeDashoffset = circumference - (percentage / 100) * circumference

    return (
      <div className="flex flex-col items-center space-y-3">
        <div className="relative">
          <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 140 140">
            {/* Background circle */}
            <circle
              cx="70"
              cy="70"
              r={radius}
              stroke={bgColor}
              strokeWidth="8"
              fill="transparent"
            />
            {/* Progress circle with gradient */}
            <defs>
              <linearGradient id={`gradient-${label}`} x1="0%" y1="0%" x2="100%" y2="100%">
                {color.includes('from-[#FF62AD]') ? (
                  <>
                    <stop offset="0%" stopColor="#FF62AD" />
                    <stop offset="100%" stopColor="#A100FF" />
                  </>
                ) : (
                  <>
                    <stop offset="0%" stopColor="#00C2FF" />
                    <stop offset="100%" stopColor="#A100FF" />
                  </>
                )}
              </linearGradient>
            </defs>
            <circle
              cx="70"
              cy="70"
              r={radius}
              stroke={`url(#gradient-${label})`}
              strokeWidth="8"
              fill="transparent"
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              style={{
                transition: 'stroke-dashoffset 0.8s ease-out'
              }}
            />
          </svg>
          {/* Center content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className={`text-3xl font-bold ${textColor}`}>{value}</div>
            <div className={`text-xs ${textColor}`}>{label}</div>
          </div>
        </div>
        <div className={`text-sm ${textColor} text-center`}>{subtitle}</div>
      </div>
    )
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <main className="p-4 sm:p-6 max-w-xl mx-auto space-y-6 pb-20">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6366F1] mx-auto mb-4"></div>
              <p className="text-[#F5F5F5]">Loading your data...</p>
            </div>
          </div>
        </main>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <main className="p-4 sm:p-6 max-w-xl mx-auto space-y-6 pb-20">
        {/* Dark Summary Section */}
        <div className="bg-[#1A1C2C] rounded-xl p-6 -mx-4 sm:-mx-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-[#F5F5F5]">Daily Macros</h1>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowGoalEditor(true)}
                className="text-sm text-[#F5F5F5]/70 hover:text-[#F5F5F5] underline transition-colors"
              >
                Edit Goals
              </button>
              <UserMenu />
            </div>
          </div>

          {/* Horizontal Progress Cards */}
          <div className="grid grid-cols-2 gap-4">
            <FadeIn delay={0.1}>
              <div 
                className="rounded-2xl shadow-xl p-5 relative text-[#F5F5F5] backdrop-blur-sm overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, rgba(193, 71, 224, 0.83), rgba(65, 30, 140, 0.8), rgba(28, 28, 48, 0.85))',
                  border: '1px solid rgba(161, 0, 255, 0.3)',
                  boxShadow: '0 0 20px rgba(161, 0, 255, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                }}
              >
                <h3 className="text-xl font-semibold text-[#F5F5F5] mb-3 text-center">Calories</h3>
                <CircularProgress
                  percentage={calorieProgress}
                  value={caloriesRemaining.toString()}
                  label="Remaining"
                  subtitle={`${totalCalories}/${goals.daily_calories_goal} Spent`}
                  color="bg-gradient-to-tr from-[#FF62AD] to-[#A100FF]"
                  bgColor="#2A2E3B"
                  textColor="text-[#F5F5F5]"
                />
              </div>
            </FadeIn>
            <FadeIn delay={0.2}>
              <div 
                className="rounded-2xl shadow-xl p-5 relative text-[#F5F5F5] backdrop-blur-sm overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, rgba(112, 176, 236, 0.7), rgba(50, 60, 150, 0.6), rgba(28, 28, 48, 0.85))',
                  border: '1px solid rgba(0, 194, 255, 0.3)',
                  boxShadow: '0 0 20px rgba(0, 194, 255, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                }}
              >
                <h3 className="text-xl font-semibold text-[#F5F5F5] mb-3 text-center">Protein</h3>
                <CircularProgress
                  percentage={proteinProgress}
                  value={`${proteinRemaining}g`}
                  label="Needed"
                  subtitle={`${totalProtein}/${goals.daily_protein_goal}g Achieved`}
                  color="bg-gradient-to-tr from-[#00C2FF] to-[#A100FF]"
                  bgColor="#2A2E3B"
                  textColor="text-[#F5F5F5]"
                />
              </div>
            </FadeIn>
          </div>
        </div>

        {/* Goal Editor Modal */}
        {showGoalEditor && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div 
              className="rounded-2xl shadow-xl p-5 max-w-sm w-full mx-4 relative overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, rgba(125, 45, 185, 0.8), rgba(65, 30, 140, 0.8), rgba(28, 28, 48, 0.85))',
                border: '1px solid rgba(161, 0, 255, 0.3)',
                boxShadow: '0 0 20px rgba(161, 0, 255, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
              }}
            >
              <h3 className="font-semibold mb-4 text-[#F5F5F5]">Edit Daily Goals</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-[#F5F5F5]">Daily Calories</label>
                  <input
                    type="number"
                    value={editingGoals.daily_calories_goal}
                    onChange={(e) => setEditingGoals(prev => ({ ...prev, daily_calories_goal: e.target.value }))}
                    className="input-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#F5F5F5]">Daily Protein (grams)</label>
                  <input
                    type="number"
                    value={editingGoals.daily_protein_goal}
                    onChange={(e) => setEditingGoals(prev => ({ ...prev, daily_protein_goal: e.target.value }))}
                    className="input-primary"
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => setShowGoalEditor(false)}
                  className="btn-secondary-sm flex-1"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveGoals}
                  className="btn-save flex-1"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Food List */}
        <section>
          <h2 className="section-heading-sm">Today&apos;s Food</h2>
          
          {log.length === 0 ? (
            <div className="space-y-4">
              <p className="text-secondary mt-2">No food logged yet today.</p>
              <button
                onClick={() => router.push('/log')}
                className="btn-save w-full"
                style={{
                  background: 'linear-gradient(135deg,rgba(162, 0, 255, 0.78),rgba(28, 28, 48, 0.85))',
                  boxShadow: '0 0 10px rgba(161, 0, 255, 0.4)',
                  border: '1px solid transparent',
                  borderRadius: '0.5rem',
                }}
              >
                Log Food
              </button>
            </div>
          ) : (
            <ul className="mt-4 space-y-3">
              {log.map((entry, index) => (
                <FadeIn key={index} delay={index * 0.1}>
                  <li 
                    className="bg-[#1F1F2A] rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 group relative"
                  >
                    {editingIndex === index ? (
                      <div className="space-y-3 p-4 pl-6">
                        {/* Neon vertical gradient strip */}
                        <div 
                          className="absolute left-0 top-2 bottom-2 w-[2px] rounded-sm"
                          style={{
                            background: 'linear-gradient(to bottom, rgba(98, 0, 234, 0.5), rgba(186, 104, 200, 0.3))'
                          }}
                        />
                        
                        <div>
                          <label className="block text-sm font-medium text-primary mb-1">Food Name</label>
                          <input
                            type="text"
                            value={tempEntry.name}
                            onChange={(e) => setTempEntry({ ...tempEntry, name: e.target.value })}
                            className="input-secondary"
                            placeholder="Food name"
                          />
                        </div>
                        <div className="flex gap-2">
                          <div className="flex-1">
                            <label className="block text-sm font-medium text-primary mb-1">Calories</label>
                            <input
                              type="number"
                              value={tempEntry.calories}
                              onChange={(e) => setTempEntry({ ...tempEntry, calories: parseInt(e.target.value) || 0 })}
                              className="input-secondary"
                              placeholder="Calories"
                            />
                          </div>
                          <div className="flex-1">
                            <label className="block text-sm font-medium text-primary mb-1">Protein (grams)</label>
                            <input
                              type="number"
                              value={tempEntry.protein}
                              onChange={(e) => setTempEntry({ ...tempEntry, protein: parseInt(e.target.value) || 0 })}
                              className="input-secondary"
                              placeholder="Protein (g)"
                            />
                          </div>
                        </div>
                        <div className="flex gap-2 justify-between items-center">
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                updateEntry(index, tempEntry)
                                setEditingIndex(null)
                              }}
                              className="btn-save"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingIndex(null)}
                              className="btn-secondary-sm"
                            >
                              Cancel
                            </button>
                          </div>
                          <button
                            onClick={() => {
                              removeEntry(index)
                              setEditingIndex(null)
                            }}
                            className="text-sm text-[#FF62AD] hover:text-[#A100FF] underline transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-4 p-4 pl-6 relative">
                        {/* Neon vertical gradient strip */}
                        <div 
                          className="absolute left-0 top-2 bottom-2 w-[2px] rounded-sm"
                          style={{
                            background: 'linear-gradient(to bottom, rgba(98, 0, 234, 0.5), rgba(186, 104, 200, 0.3))'
                          }}
                        />
                        
                        {/* Checkmark Icon */}
                        <div className="flex-shrink-0">
                          <svg 
                            className="w-6 h-6" 
                            fill="none" 
                            viewBox="0 0 24 24"
                          >
                            <defs>
                              <linearGradient id="checkmarkGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#FF62AD" />
                                <stop offset="100%" stopColor="#A100FF" />
                              </linearGradient>
                            </defs>
                            <path 
                              stroke="url(#checkmarkGradient)" 
                              strokeLinecap="round" 
                              strokeLinejoin="round" 
                              strokeWidth={3} 
                              d="M5 13l4 4L19 7" 
                            />
                          </svg>
                        </div>
                        
                        {/* Food Details */}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold text-[#F5F5F5] truncate">
                            {entry.name}
                          </h3>
                          <p className="text-[#C9D6DF] mt-1">
                            {entry.calories} calories · {entry.protein}g protein
                          </p>
                        </div>
                        
                        {/* Timestamp and Edit button aligned to the right */}
                        <div className="flex-shrink-0 flex flex-col items-end gap-1">
                          <span className="text-xs text-[#8891A8]">
                            {formatTime(entry.timestamp)}
                          </span>
                          <button
                            onClick={() => handleEdit(index)}
                            className="p-2 text-accent hover:text-[#A100FF] hover:bg-[#1A1C2C] rounded-lg transition-colors"
                            title="Edit item"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </li>
                </FadeIn>
              ))}
            </ul>
          )}
        </section>
      </main>
    </ProtectedRoute>
  )
}
  