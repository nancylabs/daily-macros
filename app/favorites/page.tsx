'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useFoodLog } from '../../lib/FoodLogContext'
import { Edit } from 'lucide-react'
import Link from 'next/link'
import FadeIn from '../components/FadeIn'
import ProtectedRoute from '../components/ProtectedRoute'

export default function FavoritesPage() {
  const router = useRouter()
  const { favorites, addFavorite, removeFavorite, logFavorite, updateFavorite } = useFoodLog()
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [newFavorite, setNewFavorite] = useState({
    name: '',
    calories: '',
    protein: ''
  })
  const [editingFavorite, setEditingFavorite] = useState({
    name: '',
    calories: '',
    protein: ''
  })

  const handleAddFavorite = (e: React.FormEvent) => {
    e.preventDefault()
    
    const entry = {
      name: newFavorite.name,
      calories: parseInt(newFavorite.calories),
      protein: parseInt(newFavorite.protein)
    }
    
    addFavorite(entry)
    setNewFavorite({ name: '', calories: '', protein: '' })
    setShowAddForm(false)
  }

  const handleLogFavorite = (favorite: typeof favorites[0]) => {
    logFavorite({
      name: favorite.name,
      calories: favorite.calories,
      protein: favorite.protein
    })
    router.push('/dashboard')
  }

  const handleEdit = (index: number) => {
    const favorite = favorites[index]
    setEditingFavorite({
      name: favorite.name,
      calories: favorite.calories.toString(),
      protein: favorite.protein.toString()
    })
    setEditingIndex(index)
  }

  const handleSaveEdit = () => {
    if (editingIndex !== null) {
      updateFavorite(editingIndex, {
        name: editingFavorite.name,
        calories: parseInt(editingFavorite.calories),
        protein: parseInt(editingFavorite.protein)
      })
      setEditingIndex(null)
      setEditingFavorite({ name: '', calories: '', protein: '' })
    }
  }

  const handleRemoveFavorite = (index: number) => {
    removeFavorite(index)
    setEditingIndex(null)
  }

  return (
    <ProtectedRoute>
      <main className="bg-[#0E0F1A] min-h-screen">
        <div className="section-container">
          {/* Dark Header Section - matching Dashboard Summary */}
          <div className="bg-[#1A1C2C] rounded-xl p-6 -mx-4 sm:-mx-6">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-[#F5F5F5]">Favorites</h1>
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="text-sm text-[#F5F5F5]/70 hover:text-[#F5F5F5] underline transition-colors"
              >
                {showAddForm ? 'Cancel' : '+ Add Favorite'}
              </button>
            </div>
          </div>

          {/* Add Favorite Form */}
          {showAddForm && (
            <div className="card-primary">
              <h2 className="section-heading-sm">Add New Favorite</h2>
              <form onSubmit={handleAddFavorite} className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-primary">Food Name</label>
                  <input
                    type="text"
                    value={newFavorite.name}
                    onChange={(e) => setNewFavorite(prev => ({ ...prev, name: e.target.value }))}
                    className="input-primary"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-primary">Calories</label>
                  <input
                    type="number"
                    value={newFavorite.calories}
                    onChange={(e) => setNewFavorite(prev => ({ ...prev, calories: e.target.value }))}
                    className="input-primary"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-primary">Protein (grams)</label>
                  <input
                    type="number"
                    value={newFavorite.protein}
                    onChange={(e) => setNewFavorite(prev => ({ ...prev, protein: e.target.value }))}
                    className="input-primary"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="btn-save w-full"
                >
                  Add to Favorites
                </button>
              </form>
            </div>
          )}

          {/* Favorites List */}
          <section>
            {favorites.length === 0 ? (
              <p className="text-secondary text-center py-8">No favorites yet. Add some common foods to log them quickly!</p>
            ) : (
              <ul className="space-y-3">
                {favorites.map((favorite, index) => (
                  <FadeIn key={index} delay={index * 0.1}>
                    <li
                      className="card-hover relative"
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
                              value={editingFavorite.name}
                              onChange={(e) => setEditingFavorite(prev => ({ ...prev, name: e.target.value }))}
                              className="input-secondary"
                              placeholder="Food name"
                            />
                          </div>
                          <div className="flex gap-2">
                            <div className="flex-1">
                              <label className="block text-sm font-medium text-primary mb-1">Calories</label>
                              <input
                                type="number"
                                value={editingFavorite.calories}
                                onChange={(e) => setEditingFavorite(prev => ({ ...prev, calories: e.target.value }))}
                                className="input-secondary"
                                placeholder="Calories"
                              />
                            </div>
                            <div className="flex-1">
                              <label className="block text-sm font-medium text-primary mb-1">Protein (grams)</label>
                              <input
                                type="number"
                                value={editingFavorite.protein}
                                onChange={(e) => setEditingFavorite(prev => ({ ...prev, protein: e.target.value }))}
                                className="input-secondary"
                                placeholder="Protein (g)"
                              />
                            </div>
                          </div>
                          <div className="flex gap-2 justify-between items-center">
                            <div className="flex gap-2">
                              <button
                                onClick={handleSaveEdit}
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
                              onClick={() => handleRemoveFavorite(index)}
                              className="text-sm text-[#FF62AD] hover:text-[#A100FF] underline transition-colors"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div 
                          className="flex items-center space-x-4 p-4 pl-6 relative cursor-pointer"
                          onClick={() => handleLogFavorite(favorite)}
                        >
                          {/* Neon vertical gradient strip */}
                          <div 
                            className="absolute left-0 top-2 bottom-2 w-[2px] rounded-sm"
                            style={{
                              background: 'linear-gradient(to bottom, rgba(98, 0, 234, 0.5), rgba(186, 104, 200, 0.3))'
                            }}
                          />
                          
                          {/* Plus Icon */}
                          <div className="flex-shrink-0">
                            <svg 
                              className="w-7 h-7" 
                              fill="none" 
                              viewBox="0 0 24 24"
                            >
                              <defs>
                                <linearGradient id="favoritePlusGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                  <stop offset="0%" stopColor="#FF62AD" />
                                  <stop offset="100%" stopColor="#A100FF" />
                                </linearGradient>
                              </defs>
                              <path 
                                stroke="url(#favoritePlusGradient)" 
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
                              {favorite.name}
                            </h3>
                            <p className="text-secondary mt-1">
                              {favorite.calories} calories · {favorite.protein}g protein
                            </p>
                          </div>
                          
                          {/* Action Buttons - stacked vertically */}
                          <div className="flex-shrink-0 flex flex-col items-end gap-1">
                            <button
                              onClick={() => handleEdit(index)}
                              className="p-2 text-accent hover:text-[#A100FF] hover:bg-[#1A1C2C] rounded-lg transition-colors"
                              title="Edit favorite"
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
        </div>
      </main>
    </ProtectedRoute>
  )
} 