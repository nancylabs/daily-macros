'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useFoodLog } from '../../../lib/FoodLogContext'
import { Camera, Upload, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import ProtectedRoute from '../../components/ProtectedRoute'

interface AnalysisResult {
  name: string
  calories: number
  protein: number
  confidence: number
}

interface Annotation {
  name: string
  confidence: number
}

interface Nutrient {
  name: string
  amount: number
}

interface NutritionData {
  nutrients: Nutrient[]
}

interface AnalysisResponse {
  annotations: Annotation[]
  nutrition?: NutritionData
}

export default function PhotoPage() {
  const router = useRouter()
  const { addEntry } = useFoodLog()
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    calories: '',
    protein: ''
  })
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsAnalyzing(true)
    setError(null)
    setAnalysisResult(null)

    try {
      // Convert image to base64
      const base64 = await fileToBase64(file)
      
      // Call Spoonacular API
      const result = await analyzeImage(base64)
      
      if (result) {
        setAnalysisResult(result)
        setFormData({
          name: result.name,
          calories: result.calories.toString(),
          protein: result.protein.toString()
        })
        setShowForm(true)
      } else {
        setError("We couldn't recognize the food. Try again or log manually.")
      }
    } catch (err) {
      console.error('Analysis error:', err)
      setError("We couldn't analyze the image. Try again or log manually.")
    } finally {
      setIsAnalyzing(false)
    }
  }

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => {
        const result = reader.result as string
        // Remove the data:image/jpeg;base64, prefix
        const base64 = result.split(',')[1]
        resolve(base64)
      }
      reader.onerror = reject
    })
  }

  const analyzeImage = async (base64Image: string): Promise<AnalysisResult | null> => {
    try {
      setIsAnalyzing(true)
      setError(null)

      // Simulate API call with realistic delay
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Simulate API response
      const mockResponse = {
        annotations: [
          { name: 'Grilled Chicken Breast', confidence: 0.92 },
          { name: 'Rice', confidence: 0.85 },
          { name: 'Broccoli', confidence: 0.78 }
        ],
        nutrition: {
          nutrients: [
            { name: 'Calories', amount: 450 },
            { name: 'Protein', amount: 35 }
          ]
        }
      }

      // Parse the response to extract food information
      if (mockResponse.annotations && mockResponse.annotations.length > 0) {
        // Find the annotation with the highest confidence
        const bestMatch = mockResponse.annotations.reduce((prev: Annotation, current: Annotation) => 
          (current.confidence > prev.confidence) ? current : prev
        )

        // Extract nutrition info if available
        let calories = 300 // Default fallback
        let protein = 15 // Default fallback

        if (mockResponse.nutrition && mockResponse.nutrition.nutrients) {
          const calorieNutrient = mockResponse.nutrition.nutrients.find((n: Nutrient) => n.name === 'Calories')
          const proteinNutrient = mockResponse.nutrition.nutrients.find((n: Nutrient) => n.name === 'Protein')
          
          if (calorieNutrient) calories = Math.round(calorieNutrient.amount)
          if (proteinNutrient) protein = Math.round(proteinNutrient.amount)
        }

        return {
          name: bestMatch.name || 'Unknown Food',
          calories,
          protein,
          confidence: bestMatch.confidence || 0
        }
      }

      return null
    } catch (error) {
      setError('Failed to analyze image. Please try again.')
      return null
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const entry = {
      name: formData.name,
      calories: parseInt(formData.calories),
      protein: parseInt(formData.protein)
    }
    
    addEntry(entry)
    router.push('/dashboard')
  }

  const handleCancel = () => {
    setShowForm(false)
    setAnalysisResult(null)
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <ProtectedRoute>
      <main className="p-4 sm:p-6 max-w-xl mx-auto space-y-6 pb-20">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Link href="/log" className="text-[#F5F5F5] hover:text-[#F5F5F5]/70">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-2xl font-bold text-[#F5F5F5]">Take Photo</h1>
        </div>

        {!showForm && !isAnalyzing && !error && (
          <div className="bg-[#1A1B2E] rounded-xl p-6 border border-[#2D2F45]">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-[#2D2F45] rounded-full flex items-center justify-center">
                <Camera className="w-8 h-8 text-[#6366F1]" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-[#F5F5F5] mb-2">Upload Food Photo</h2>
                <p className="text-[#F5F5F5]/70">Take a photo of your food to automatically log it</p>
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="image-upload"
              />
              <label
                htmlFor="image-upload"
                className="bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white px-6 py-3 rounded-lg hover:from-[#5B5BD6] hover:to-[#7C3AED] transition-all inline-flex items-center gap-2 cursor-pointer"
              >
                <Upload className="w-5 h-5" />
                Choose Photo
              </label>
            </div>
          </div>
        )}

        {isAnalyzing && (
          <div className="bg-[#1A1B2E] rounded-xl p-6 border border-[#2D2F45] text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6366F1] mx-auto mb-4"></div>
            <h2 className="text-lg font-semibold text-[#F5F5F5] mb-2">Analyzing Image...</h2>
            <p className="text-[#F5F5F5]/70">Our AI is identifying the food in your photo</p>
          </div>
        )}

        {error && (
          <div className="bg-red-900/20 border border-red-500/50 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-red-400 mb-2">Analysis Failed</h2>
            <p className="text-red-300 mb-4">{error}</p>
            <button
              onClick={handleCancel}
              className="bg-[#2D2F45] hover:bg-[#3A3D5A] text-[#F5F5F5] px-4 py-2 rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {showForm && analysisResult && (
          <div className="bg-[#1A1B2E] rounded-xl p-6 border border-[#2D2F45]">
            <h2 className="text-lg font-semibold text-[#F5F5F5] mb-4">Analysis Result</h2>
            
            <div className="bg-[#2D2F45] rounded-lg p-4 mb-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">AI</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-[#F5F5F5]">{analysisResult.name}</h3>
                  <p className="text-[#F5F5F5]/70">
                    {analysisResult.calories} calories · {analysisResult.protein}g protein
                  </p>
                  <p className="text-xs text-[#6366F1] mt-1">
                    Confidence: {Math.round(analysisResult.confidence * 100)}%
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#F5F5F5]/70 mb-2">
                  Food Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-[#2D2F45] border border-[#3A3D5A] rounded-lg text-[#F5F5F5] placeholder-[#F5F5F5]/40 focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:border-transparent"
                  placeholder="Food name"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#F5F5F5]/70 mb-2">
                    Calories
                  </label>
                  <input
                    type="number"
                    value={formData.calories}
                    onChange={(e) => setFormData({ ...formData, calories: e.target.value })}
                    className="w-full px-4 py-3 bg-[#2D2F45] border border-[#3A3D5A] rounded-lg text-[#F5F5F5] placeholder-[#F5F5F5]/40 focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:border-transparent"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#F5F5F5]/70 mb-2">
                    Protein (g)
                  </label>
                  <input
                    type="number"
                    value={formData.protein}
                    onChange={(e) => setFormData({ ...formData, protein: e.target.value })}
                    className="w-full px-4 py-3 bg-[#2D2F45] border border-[#3A3D5A] rounded-lg text-[#F5F5F5] placeholder-[#F5F5F5]/40 focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:border-transparent"
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white font-semibold py-3 px-6 rounded-lg hover:from-[#5B5BD6] hover:to-[#7C3AED] transition-all"
                >
                  Log Food
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex-1 bg-[#2D2F45] hover:bg-[#3A3D5A] text-[#F5F5F5] font-semibold py-3 px-6 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </main>
    </ProtectedRoute>
  )
} 