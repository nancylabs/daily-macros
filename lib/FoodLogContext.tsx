'use client'

import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react'
import { useAuth } from './AuthContext'
import { supabase } from './supabase'
import { startOfDay, endOfDay } from 'date-fns'
import { zonedTimeToUtc } from 'date-fns-tz'

type Entry = {
  id?: string
  name: string
  calories: number
  protein: number
  timestamp: Date
  user_id?: string
  is_favorite?: boolean
}

type Goals = {
  id?: string
  user_id?: string
  daily_calories_goal: number
  daily_protein_goal: number
  created_at?: string
  updated_at?: string
}

type FoodFrequency = {
  name: string
  count: number
  calories: number
  protein: number
}

type FoodLogContextType = {
  log: Entry[]
  favorites: Entry[]
  goals: Goals
  loading: boolean
  addEntry: (entry: Omit<Entry, 'timestamp' | 'id' | 'user_id'>) => Promise<void>
  removeEntry: (index: number) => Promise<void>
  updateEntry: (index: number, entry: Omit<Entry, 'timestamp' | 'id' | 'user_id'>) => Promise<void>
  addFavorite: (entry: Omit<Entry, 'timestamp' | 'id' | 'user_id'>) => Promise<void>
  removeFavorite: (index: number) => Promise<void>
  updateFavorite: (index: number, entry: Omit<Entry, 'timestamp' | 'id' | 'user_id'>) => Promise<void>
  logFavorite: (entry: Omit<Entry, 'timestamp' | 'id' | 'user_id'>) => Promise<void>
  updateGoals: (goals: Omit<Goals, 'user_id' | 'id' | 'created_at' | 'updated_at'>) => Promise<void>
  getTopFrequentFoods: () => Promise<FoodFrequency[]>
}

const FoodLogContext = createContext<FoodLogContextType | undefined>(undefined)

export function FoodLogProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [log, setLog] = useState<Entry[]>([])
  const [favorites, setFavorites] = useState<Entry[]>([])
  const [goals, setGoals] = useState<Goals>({
    daily_calories_goal: 1800,
    daily_protein_goal: 75
  })
  const [loading, setLoading] = useState(true)
  const [currentDate, setCurrentDate] = useState(() => new Date().toDateString())

  // Load user data from Supabase
  const loadUserData = useCallback(async () => {
    if (!user) {
      setLog([])
      setFavorites([])
      setGoals({ daily_calories_goal: 1800, daily_protein_goal: 75 })
      setLoading(false)
      return
    }

    try {
      setLoading(true)

      // Use Pacific Time for daily boundaries
      const timeZone = 'America/Los_Angeles'
      const now = new Date()
      const year = now.getFullYear()
      const month = (now.getMonth() + 1).toString().padStart(2, '0')
      const day = now.getDate().toString().padStart(2, '0')
      const startOfDayPT = `${year}-${month}-${day}T00:00:00`
      const endOfDayPT = `${year}-${month}-${day}T23:59:59.999`
      const todayStartUTC = zonedTimeToUtc(startOfDayPT, timeZone).toISOString()
      const todayEndUTC = zonedTimeToUtc(endOfDayPT, timeZone).toISOString()

      console.log('🔍 Loading food log for user:', user.id)
      console.log('📅 Date range (Pacific Time boundaries, UTC for DB):', {
        todayStartUTC,
        todayEndUTC
      })

      // First try to load with date filtering (only regular entries)
      const { data: logData, error: logError } = await supabase
        .from('food_log')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_favorite', false)
        .gte('timestamp', todayStartUTC)
        .lt('timestamp', todayEndUTC)
        .order('timestamp', { ascending: false })

      if (logError) {
        console.error('❌ Error loading food log:', logError)
        throw logError
      }

      // If no data found with date filtering, try loading all regular entries for debugging
      if (!logError && (!logData || logData.length === 0)) {
        console.log('⚠️ No entries found with date filtering, trying to load all regular entries...')
        const { data: allData, error: allError } = await supabase
          .from('food_log')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_favorite', false) // Only regular entries, not favorites
          .order('timestamp', { ascending: false })

        if (!allError && allData && allData.length > 0) {
          console.log('📊 Found entries without date filtering:', allData)
          console.log('🔍 Checking if entries are from today...')
          
          // Filter entries that are from today
          const todayEntries = allData.filter(entry => {
            const entryDate = new Date(entry.timestamp)
            const entryDateString = entryDate.toDateString()
            const todayString = now.toDateString()
            const isToday = entryDateString === todayString
            console.log(`Entry: ${entry.name}, Date: ${entryDateString}, Today: ${todayString}, IsToday: ${isToday}`)
            return isToday
          })
          
          console.log('📅 Today entries found:', todayEntries.length)
          const updatedLogData = todayEntries
          
          // If still no today entries, use all entries for debugging
          if (todayEntries.length === 0) {
            console.log('⚠️ No today entries found, using all entries for debugging')
            const finalLogData = allData
            console.log('📊 Raw Supabase response:', finalLogData)
            console.log('📈 Number of entries returned:', finalLogData?.length || 0)

            const formattedLog = finalLogData?.map(entry => ({
              ...entry,
              timestamp: new Date(entry.timestamp)
            })) || []

            console.log('✅ Setting log state with entries:', formattedLog)
            setLog(formattedLog)
          } else {
            console.log('📊 Raw Supabase response:', updatedLogData)
            console.log('📈 Number of entries returned:', updatedLogData?.length || 0)

            const formattedLog = updatedLogData?.map(entry => ({
              ...entry,
              timestamp: new Date(entry.timestamp)
            })) || []

            console.log('✅ Setting log state with entries:', formattedLog)
            setLog(formattedLog)
          }
        } else {
          console.log('📊 All regular entries for user:', allData)
          const formattedLog = logData?.map(entry => ({
            ...entry,
            timestamp: new Date(entry.timestamp)
          })) || []

          console.log('✅ Setting log state with entries:', formattedLog)
          setLog(formattedLog)
        }
      } else {
        console.log('📊 Raw Supabase response:', logData)
        console.log('📈 Number of entries returned:', logData?.length || 0)

        const formattedLog = logData?.map(entry => ({
          ...entry,
          timestamp: new Date(entry.timestamp)
        })) || []

        console.log('✅ Setting log state with entries:', formattedLog)
        setLog(formattedLog)
      }

      // Load favorites (only entries marked as favorites)
      console.log('⭐ Loading favorites for user:', user.id)
      const { data: favoritesData, error: favoritesError } = await supabase
        .from('food_log')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_favorite', true) // Only favorites
        .order('name')

      if (favoritesError) {
        console.error('❌ Error loading favorites:', favoritesError)
        // Don't throw error for favorites, just log it
      }

      console.log('⭐ Raw favorites response:', favoritesData)
      console.log('⭐ Number of favorites returned:', favoritesData?.length || 0)

      const formattedFavorites = favoritesData?.map(entry => ({
        ...entry,
        timestamp: new Date(entry.timestamp)
      })) || []

      console.log('✅ Setting favorites state with entries:', formattedFavorites)
      setFavorites(formattedFavorites)

      // Load goals
      console.log('🎯 Loading goals for user:', user.id)
      const { data: goalsData, error: goalsError } = await supabase
        .from('goals')
        .select('id, user_id, daily_calories_goal, daily_protein_goal, created_at, updated_at')
        .eq('user_id', user.id)
        .single()

      if (goalsError) {
        console.log('⚠️ Goals error:', goalsError)
        if (goalsError.code === 'PGRST116') { // PGRST116 = no rows returned
          console.log('📝 No goals found, creating default goals...')
          // Create default goals for new user using upsert
          const { data: newGoals, error: createGoalsError } = await supabase
            .from('goals')
            .upsert({
              user_id: user.id,
              daily_calories_goal: 1800,
              daily_protein_goal: 75
            }, { onConflict: 'user_id' })
            .select('id, user_id, daily_calories_goal, daily_protein_goal, created_at, updated_at')
            .single()

          if (createGoalsError) {
            console.error('❌ Error creating goals:', createGoalsError)
            // Set default goals locally if database creation fails
            setGoals({ daily_calories_goal: 1800, daily_protein_goal: 75 })
          } else {
            console.log('✅ Default goals created:', newGoals)
            setGoals(newGoals)
          }
        } else {
          console.error('❌ Error loading goals:', goalsError)
          // Set default goals on error
          setGoals({ daily_calories_goal: 1800, daily_protein_goal: 75 })
        }
      } else {
        console.log('✅ Goals loaded:', goalsData)
        setGoals(goalsData)
      }

    } catch (error) {
      console.error('Error loading user data:', error)
      // Set default values on error
      setLog([])
      setFavorites([])
      setGoals({ daily_calories_goal: 1800, daily_protein_goal: 75 })
    } finally {
      setLoading(false)
    }
  }, [user])

  // Load data when user changes
  useEffect(() => {
    loadUserData()
  }, [user, loadUserData])

  // Check for date change and reload data if needed
  useEffect(() => {
    const checkDateChange = () => {
      const today = new Date().toDateString()
      if (today !== currentDate) {
        console.log('Date changed, clearing log for new day')
        setCurrentDate(today)
        // Clear the log for the new day
        setLog([])
        // Reload user data to get fresh data for the new day
        loadUserData()
      }
    }

    // Check immediately
    checkDateChange()

    // Set up interval to check every minute
    const interval = setInterval(checkDateChange, 60000)

    // Set up listener for when tab becomes visible
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        checkDateChange()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      clearInterval(interval)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [currentDate, user, loadUserData])

  const addEntry = async (entry: Omit<Entry, 'timestamp' | 'id' | 'user_id'>) => {
    if (!user) {
      console.error('No user authenticated')
      return
    }

    try {
      const newEntry = { ...entry, timestamp: new Date(), user_id: user.id, is_favorite: false }
      console.log('➕ Adding new entry:', newEntry)

      const { data, error } = await supabase
        .from('food_log')
        .insert(newEntry)
        .select()
        .single()

      if (error) {
        console.error('❌ Error adding entry:', error)
        throw error
      }

      console.log('✅ Entry added successfully:', data)

      const formattedEntry = {
        ...data,
        timestamp: new Date(data.timestamp)
      }

      setLog(prev => {
        const newLog = [formattedEntry, ...prev]
        console.log('📝 New log state after addEntry:', newLog)
        return newLog
      })
    } catch (error) {
      console.error('Error adding entry:', error)
    }
  }

  const removeEntry = async (index: number) => {
    if (!user) return

    const entry = log[index]
    if (!entry.id) return

    try {
      const { error } = await supabase
        .from('food_log')
        .delete()
        .eq('id', entry.id)

      if (error) {
        console.error('Error removing entry:', error)
        throw error
      }

      setLog(prev => prev.filter((_, i) => i !== index))
    } catch (error) {
      console.error('Error removing entry:', error)
    }
  }

  const updateEntry = async (index: number, entry: Omit<Entry, 'timestamp' | 'id' | 'user_id'>) => {
    if (!user) return

    const existingEntry = log[index]
    if (!existingEntry.id) return

    try {
      const { data, error } = await supabase
        .from('food_log')
        .update(entry)
        .eq('id', existingEntry.id)
        .select()
        .single()

      if (error) {
        console.error('Error updating entry:', error)
        throw error
      }

      const formattedEntry = {
        ...data,
        timestamp: new Date(data.timestamp)
      }

      setLog(prev => prev.map((item, i) => 
        i === index ? formattedEntry : item
      ))
    } catch (error) {
      console.error('Error updating entry:', error)
    }
  }

  const addFavorite = async (entry: Omit<Entry, 'timestamp' | 'id' | 'user_id'>) => {
    if (!user) return

    try {
      console.log('⭐ Adding new favorite:', entry)
      const newFavorite = { ...entry, timestamp: new Date(), user_id: user.id, is_favorite: true }

      const { data, error } = await supabase
        .from('food_log')
        .insert(newFavorite)
        .select()
        .single()

      if (error) {
        console.error('❌ Error adding favorite:', error)
        throw error
      }

      console.log('✅ Favorite added successfully:', data)

      const formattedFavorite = {
        ...data,
        timestamp: new Date(data.timestamp)
      }

      console.log('🔄 Updating favorites state. Previous favorites:', favorites.length)
      setFavorites(prev => {
        const newFavorites = [...prev, formattedFavorite]
        console.log('📝 New favorites state will have entries:', newFavorites.length)
        return newFavorites
      })
    } catch (error) {
      console.error('Error adding favorite:', error)
    }
  }

  const removeFavorite = async (index: number) => {
    if (!user) return

    const favorite = favorites[index]
    if (!favorite.id) return

    try {
      const { error } = await supabase
        .from('food_log')
        .delete()
        .eq('id', favorite.id)

      if (error) {
        console.error('Error removing favorite:', error)
        throw error
      }

      setFavorites(prev => prev.filter((_, i) => i !== index))
    } catch (error) {
      console.error('Error removing favorite:', error)
    }
  }

  const updateFavorite = async (index: number, entry: Omit<Entry, 'timestamp' | 'id' | 'user_id'>) => {
    if (!user) return

    const existingFavorite = favorites[index]
    if (!existingFavorite.id) return

    try {
      const { data, error } = await supabase
        .from('food_log')
        .update(entry)
        .eq('id', existingFavorite.id)
        .select()
        .single()

      if (error) {
        console.error('Error updating favorite:', error)
        throw error
      }

      const formattedFavorite = {
        ...data,
        timestamp: new Date(data.timestamp)
      }

      setFavorites(prev => prev.map((item, i) => 
        i === index ? formattedFavorite : item
      ))
    } catch (error) {
      console.error('Error updating favorite:', error)
    }
  }

  const logFavorite = async (entry: Omit<Entry, 'timestamp' | 'id' | 'user_id'>) => {
    console.log('📝 logFavorite called with:', entry)
    try {
      await addEntry(entry)
      console.log('📝 logFavorite completed')
    } catch (error) {
      console.error('📝 logFavorite error:', error)
    }
  }

  const updateGoals = async (newGoals: Omit<Goals, 'user_id' | 'id' | 'created_at' | 'updated_at'>) => {
    if (!user) return

    try {
      console.log('🔄 Updating goals for user:', user.id, 'New goals:', newGoals)
      
      // Use upsert to handle both insert and update cases
      const { data, error } = await supabase
        .from('goals')
        .upsert({
          user_id: user.id,
          daily_calories_goal: newGoals.daily_calories_goal,
          daily_protein_goal: newGoals.daily_protein_goal
        }, { onConflict: 'user_id' })
        .select('id, user_id, daily_calories_goal, daily_protein_goal, created_at, updated_at')
        .single()

      if (error) {
        console.error('❌ Error updating goals:', error)
        throw error
      }
      console.log('✅ Goals updated:', data)
      setGoals(data)
    } catch (error) {
      console.error('❌ Error in updateGoals:', error)
    }
  }

  const getTopFrequentFoods = async (): Promise<FoodFrequency[]> => {
    if (!user) return []

    try {
      console.log('📊 Fetching historical food entries for frequency calculation...')
      
      // Fetch all historical entries (not just today's)
      const { data: allEntries, error } = await supabase
        .from('food_log')
        .select('name, calories, protein')
        .eq('user_id', user.id)
        .eq('is_favorite', false) // Only regular entries, not favorites

      if (error) {
        console.error('❌ Error fetching historical entries:', error)
        return []
      }

      console.log('📊 Found historical entries:', allEntries?.length || 0)

      const frequencyMap = new Map<string, FoodFrequency>()

      // Count from all historical entries
      allEntries?.forEach(entry => {
        const key = entry.name.toLowerCase()
        const existing = frequencyMap.get(key)
        if (existing) {
          existing.count += 1
          existing.calories += entry.calories
          existing.protein += entry.protein
        } else {
          frequencyMap.set(key, {
            name: entry.name,
            count: 1,
            calories: entry.calories,
            protein: entry.protein
          })
        }
      })

      const result = Array.from(frequencyMap.values())
        .sort((a, b) => b.count - a.count)
        .slice(0, 10) // Show top 10 instead of 5

      console.log('📊 Top frequent foods:', result.map(f => `${f.name} (${f.count}x)`))
      return result
    } catch (error) {
      console.error('❌ Error in getTopFrequentFoods:', error)
      return []
    }
  }

  const value = {
    log,
    favorites,
    goals,
    loading,
    addEntry,
    removeEntry,
    updateEntry,
    addFavorite,
    removeFavorite,
    updateFavorite,
    logFavorite,
    updateGoals,
    getTopFrequentFoods,
  }

  return <FoodLogContext.Provider value={value}>{children}</FoodLogContext.Provider>
}

export function useFoodLog() {
  const context = useContext(FoodLogContext)
  if (context === undefined) {
    throw new Error('useFoodLog must be used within a FoodLogProvider')
  }
  return context
}
