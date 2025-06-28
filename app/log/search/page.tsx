'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useFoodLog } from '../../../lib/FoodLogContext'
import { Search, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import ProtectedRoute from '../../components/ProtectedRoute'

type FoodItem = {
  fdcId: number
  description: string
  brandName?: string
  servingSize?: number
  servingSizeUnit?: string
  foodNutrients: Array<{
    nutrientName: string
    value: number
    unitName: string
  }>
}

const popularFoods = [
  { name: 'Chicken Breast', calories: 165, protein: 31, servingSize: '3 oz' },
  { name: 'Salmon', calories: 208, protein: 25, servingSize: '3 oz' },
  { name: 'Greek Yogurt', calories: 100, protein: 17, servingSize: '6 oz' },
  { name: 'Eggs', calories: 140, protein: 12, servingSize: '2 large' },
  { name: 'Quinoa', calories: 120, protein: 4, servingSize: '1/2 cup' },
  { name: 'Almonds', calories: 160, protein: 6, servingSize: '1/4 cup' },
]

export default function SearchFoodPage() {
  const router = useRouter()
  const { addEntry } = useFoodLog()
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState<FoodItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const searchFoods = async (query: string) => {
    setIsLoading(true)
    setError('')
    
    try {
      const response = await fetch(
        `https://api.nal.usda.gov/fdc/v1/foods/search?api_key=DEMO_KEY&query=${encodeURIComponent(query)}&pageSize=10&dataType=Foundation,SR Legacy`
      )
      
      if (!response.ok) {
        throw new Error('Failed to fetch food data')
      }

      const data = await response.json()
      setSearchResults(data.foods || [])
    } catch (err) {
      console.error('Search error:', err)
      setError('Failed to search foods. Please try again.')
      setSearchResults([])
    } finally {
      setIsLoading(false)
    }
  }

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm.trim()) {
        searchFoods(searchTerm)
      } else {
        setSearchResults([])
      }
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [searchTerm])

  const getNutrientValue = (food: FoodItem, nutrientName: string) => {
    const nutrient = food.foodNutrients.find(n => 
      n.nutrientName.toLowerCase().includes(nutrientName.toLowerCase())
    )
    return nutrient ? Math.round(nutrient.value) : 0
  }

  const handleFoodSelect = (food: FoodItem) => {
    const calories = getNutrientValue(food, 'Energy')
    const protein = getNutrientValue(food, 'Protein')
    
    addEntry({
      name: food.description,
      calories: calories,
      protein: protein
    })
    router.push('/dashboard')
  }

  const handlePopularFoodSelect = (food: typeof popularFoods[0]) => {
    addEntry({
      name: food.name,
      calories: food.calories,
      protein: food.protein
    })
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
          <h1 className="text-2xl font-bold text-[#F5F5F5]">Search Food</h1>
        </div>

        {/* Search Input */}
        <div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search for foods..."
            className="input-primary text-lg"
            autoFocus
          />
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mx-auto"></div>
            <p className="text-secondary mt-2">Searching...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="card-primary">
            <p className="text-primary">{error}</p>
          </div>
        )}

        {/* Search Results */}
        {searchResults.length > 0 && (
          <section>
            <h2 className="section-heading-sm">Search Results</h2>
            <ul className="space-y-3">
              {searchResults.map((food) => {
                const calories = getNutrientValue(food, 'Energy')
                const protein = getNutrientValue(food, 'Protein')
                
                return (
                  <li
                    key={food.fdcId}
                    className="card-hover cursor-pointer border-l-2 border-[#00C2FF]"
                    onClick={() => handleFoodSelect(food)}
                  >
                    <div className="flex items-center space-x-4">
                      {/* Plus Icon */}
                      <div className="flex-shrink-0">
                        <svg 
                          className="w-7 h-7" 
                          fill="none" 
                          viewBox="0 0 24 24"
                        >
                          <defs>
                            <linearGradient id="searchPlusGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" stopColor="#FF62AD" />
                              <stop offset="100%" stopColor="#A100FF" />
                            </linearGradient>
                          </defs>
                          <path 
                            stroke="url(#searchPlusGradient)" 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth={3} 
                            d="M12 5v14M5 12h14" 
                          />
                        </svg>
                      </div>
                      
                      {/* Food Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <h3 className="text-lg font-semibold text-primary truncate">
                            {food.description}
                          </h3>
                        </div>
                        {food.brandName && (
                          <p className="text-xs text-secondary mt-1">{food.brandName}</p>
                        )}
                        <p className="text-sm text-secondary mt-1">
                          {calories} calories · {protein}g protein
                        </p>
                      </div>
                    </div>
                  </li>
                )
              })}
            </ul>
          </section>
        )}

        {/* Popular Foods (when no search results) */}
        {!searchTerm && !isLoading && !error && (
          <section>
            <h2 className="section-heading-sm">Popular Foods</h2>
            <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {popularFoods.map((food, index) => (
                <div
                  key={index}
                  className="card-hover cursor-pointer border-l-2 border-[#00C2FF]"
                  onClick={() => handlePopularFoodSelect(food)}
                >
                  <div className="flex items-center space-x-4 p-4">
                    {/* Plus Icon */}
                    <div className="flex-shrink-0">
                      <svg 
                        className="w-7 h-7" 
                        fill="none" 
                        viewBox="0 0 24 24"
                      >
                        <defs>
                          <linearGradient id="searchPlusGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#FF62AD" />
                            <stop offset="100%" stopColor="#A100FF" />
                          </linearGradient>
                        </defs>
                        <path 
                          stroke="url(#searchPlusGradient)" 
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
                        {food.name}
                      </h3>
                      <p className="text-xs text-secondary mt-1">Serving Size: {food.servingSize}</p>
                      <p className="text-sm text-secondary mt-1">
                        {food.calories} calories · {food.protein}g protein
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </ProtectedRoute>
  )
} 