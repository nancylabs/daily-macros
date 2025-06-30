'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useFoodLog } from '../../lib/FoodLogContext'
import { Search, Edit3, Camera } from 'lucide-react'
import ProtectedRoute from '../components/ProtectedRoute'

export default function LogPage() {
  const router = useRouter()
  const { favorites, logFavorite, getTopFrequentFoods, log } = useFoodLog()
  const [showAllFavorites, setShowAllFavorites] = useState(true)
  const [frequentFoods, setFrequentFoods] = useState<Array<{ name: string; calories: number; protein: number; timestamp: Date; count: number }>>([])
  const [loadingFrequentFoods, setLoadingFrequentFoods] = useState(true)
  const [refreshKey, setRefreshKey] = useState(0) // Add refresh key to force recalculation
  
  // Load frequent foods on component mount and when log changes
  useEffect(() => {
    const loadFrequentFoods = async () => {
      try {
        setLoadingFrequentFoods(true)
        const frequent = await getTopFrequentFoods()
        const frequentWithTimestamp = frequent.map(food => ({
          name: food.name,
          calories: food.calories,
          protein: food.protein,
          timestamp: new Date(),
          count: food.count // Use the count directly from FoodFrequency
        }))
        setFrequentFoods(frequentWithTimestamp)
      } catch (error) {
        console.error('Error loading frequent foods:', error)
      } finally {
        setLoadingFrequentFoods(false)
      }
    }

    loadFrequentFoods()
  }, [getTopFrequentFoods, log.length, refreshKey]) // Recalculate when log length changes or refresh key changes
  
  // Combine favorites and frequent foods
  const allQuickAddItems = [...favorites, ...frequentFoods]
  
  // Remove duplicates and show all items
  const uniqueQuickAddItems = allQuickAddItems.filter((item, index, self) => 
    index === self.findIndex(t => t.name === item.name)
  )

  const handleQuickAdd = async (food: { name: string; calories: number; protein: number }) => {
    console.log('🚀 Quick add triggered for:', food)
    try {
      await logFavorite(food)
      console.log('✅ Quick add successful, refreshing frequent foods')
      // Force refresh of frequent foods after adding an entry
      setRefreshKey(prev => prev + 1)
      router.push('/dashboard')
    } catch (error) {
      console.error('❌ Quick add failed:', error)
    }
  }

  return (
    <ProtectedRoute>
      <main className="bg-[#0E0F1A] min-h-screen">
        <div className="section-container">
          {/* Dark Header Section - matching Dashboard Summary */}
          <div className="bg-[#1A1C2C] rounded-xl p-6 -mx-4 sm:-mx-6">
            <h1 className="text-2xl font-bold text-[#F5F5F5]">Log Food</h1>
          </div>

          {/* Action buttons */}
          <div className="flex gap-4">
            <div className="relative flex-1 overflow-visible">
              <div
                className="absolute inset-0 rounded-2xl -z-10"
                style={{
                  background: 'linear-gradient(135deg, #FF62AD, #A100FF)',
                  filter: 'blur(12px)',
                  opacity: 0.7
                }}
              />
              <a
                href="/log/search"
                className="relative flex flex-col items-center justify-center gap-3 min-h-[120px] rounded-2xl p-5 text-[#F5F5F5] hover:shadow-lg transition-all duration-300"
                style={{
                  background: 'linear-gradient(135deg, rgba(125, 45, 185, 0.8), rgba(65, 30, 140, 0.8), rgba(28, 28, 48, 0.85))',
                  border: '1px solid rgba(161, 0, 255, 0.3)',
                  borderRadius: '1rem',
                  backdropFilter: 'blur(8px)'
                }}
              >
                <div className="w-10 h-10 flex items-center justify-center">
                  <Search 
                    className="w-10 h-10" 
                    style={{
                      stroke: 'url(#searchGradient)',
                      fill: 'none'
                    }}
                  />
                  <svg width="0" height="0">
                    <defs>
                      <linearGradient id="searchGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#FF62AD" />
                        <stop offset="100%" stopColor="#A100FF" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
                <span className="text-sm font-bold text-[#F5F5F5] text-center">Search Food</span>
              </a>
            </div>

            <div className="relative flex-1 overflow-visible">
              <div
                className="absolute inset-0 rounded-2xl -z-10"
                style={{
                  background: 'linear-gradient(135deg, #B621FE, #1FD1F9)',
                  filter: 'blur(12px)',
                  opacity: 0.5
                }}
              />
              <a
                href="/log/manual"
                className="relative flex flex-col items-center justify-center gap-3 min-h-[120px] rounded-2xl p-5 text-[#F5F5F5] hover:shadow-lg transition-all duration-300"
                style={{
                  background: 'linear-gradient(135deg, rgba(75, 90, 180, 0.7), rgba(50, 60, 150, 0.6), rgba(28, 28, 48, 0.85))',
                border: '1px solid rgba(0, 194, 255, 0.3)',
                  borderRadius: '1rem',
                  backdropFilter: 'blur(8px)'
                }}
              >
                <div className="w-10 h-10 flex items-center justify-center">
                  <Edit3 
                    className="w-10 h-10" 
                    style={{
                      stroke: 'url(#editGradient)',
                      fill: 'none'
                    }}
                  />
                  <svg width="0" height="0">
                    <defs>
                      <linearGradient id="editGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#B621FE" />
                        <stop offset="100%" stopColor="#1FD1F9" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
                <span className="text-sm font-bold text-[#F5F5F5] text-center">Manual Entry</span>
              </a>
            </div>

            <div className="relative flex-1 overflow-visible">
              <div
                className="absolute inset-0 rounded-2xl -z-10"
                style={{
                  background: 'linear-gradient(135deg, #FF62AD, #A100FF)',
                  filter: 'blur(12px)',
                  opacity: 0.7
                }}
              />
              <a
                href="/log/photo"
                className="relative flex flex-col items-center justify-center gap-3 min-h-[120px] rounded-2xl p-5 text-[#F5F5F5] hover:shadow-lg transition-all duration-300"
                style={{
                  background: 'linear-gradient(135deg, rgba(125, 45, 185, 0.8), rgba(65, 30, 140, 0.8), rgba(28, 28, 48, 0.85))',
                  border: '1px solid rgba(161, 0, 255, 0.3)',
                  borderRadius: '1rem',
                  backdropFilter: 'blur(8px)'
                }}
              >
                <div className="w-10 h-10 flex items-center justify-center">
                  <Camera 
                    className="w-10 h-10" 
                    style={{
                      stroke: 'url(#cameraGradient)',
                      fill: 'none'
                    }}
                  />
                  <svg width="0" height="0">
                    <defs>
                      <linearGradient id="cameraGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#FF62AD" />
                        <stop offset="100%" stopColor="#A100FF" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
                <span className="text-sm font-bold text-[#F5F5F5] text-center">Take Photo</span>
              </a>
            </div>
          </div>

          {/* Favorites */}
          <section>
            <div className="flex justify-between items-center">
              <h2 className="section-heading-sm">Quick Add</h2>
              <a href="/favorites" className="text-accent underline hover:text-[#A100FF] transition-colors">
                Manage Favorites
              </a>
            </div>
            {loadingFrequentFoods ? (
              <p className="text-secondary mt-2">Loading your frequently eaten foods...</p>
            ) : uniqueQuickAddItems.length === 0 ? (
              <p className="text-secondary mt-2">No favorites yet. Add some common foods to log them quickly!</p>
            ) : (
              <>
                <ul className="mt-2 space-y-3">
                  {uniqueQuickAddItems.map((item, index) => (
                    <li
                      key={index}
                      className="card-hover relative cursor-pointer"
                      onClick={() => handleQuickAdd(item)}
                    >
                      {/* Neon vertical gradient strip */}
                      <div 
                        className="absolute left-0 top-2 bottom-2 w-[2px] rounded-sm"
                        style={{
                          background: 'linear-gradient(to bottom, rgba(98, 0, 234, 0.5), rgba(186, 104, 200, 0.3))'
                        }}
                      />
                      
                      <div className="flex items-center space-x-4 p-4 pl-6">
                        {/* Plus Icon */}
                        <div className="flex-shrink-0">
                          <svg 
                            className="w-7 h-7" 
                            fill="none" 
                            viewBox="0 0 24 24"
                          >
                            <defs>
                              <linearGradient id="plusGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#FF62AD" />
                                <stop offset="100%" stopColor="#A100FF" />
                              </linearGradient>
                            </defs>
                            <path 
                              stroke="url(#plusGradient)" 
                              strokeLinecap="round" 
                              strokeLinejoin="round" 
                              strokeWidth={3} 
                              d="M12 5v14M5 12h14" 
                            />
                          </svg>
                        </div>
                        
                        {/* Food Details */}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold text-primary truncate">
                            {item.name}
                          </h3>
                          {item.calories > 0 && (
                            <p className="text-secondary mt-1">
                              {item.calories} calories · {item.protein}g protein
                              {('count' in item && item.count > 1) && (
                                <span className="text-accent ml-2">· {item.count}x</span>
                              )}
                            </p>
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </section>
        </div>
      </main>
    </ProtectedRoute>
  )
}
