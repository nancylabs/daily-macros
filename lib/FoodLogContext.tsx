'use client'

import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react'

type Entry = {
  id?: string
  name: string
  calories: number
  protein: number
  timestamp: Date
  is_favorite?: boolean
}

type Goals = {
  daily_calories_goal: number
  daily_protein_goal: number
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

const KEYS = {
  LOG_DATE: 'dm-log-date',
  LOG: 'dm-log',
  FAVORITES: 'dm-favorites',
  GOALS: 'dm-goals',
  HISTORY: 'dm-history',
  SEEDED: 'dm-seeded',
}

const DEFAULT_GOALS: Goals = {
  daily_calories_goal: 2000,
  daily_protein_goal: 150,
}

function makeId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

function todayStr() {
  return new Date().toDateString()
}

function seedData() {
  const now = new Date()
  const d = (h: number, m: number) => {
    const t = new Date(now)
    t.setHours(h, m, 0, 0)
    return t.toISOString()
  }

  const log: Entry[] = [
    { id: makeId(), name: 'Overnight Oats', calories: 380, protein: 12, timestamp: new Date(d(7, 30)), is_favorite: false },
    { id: makeId(), name: 'Coffee with Oat Milk', calories: 60, protein: 1, timestamp: new Date(d(7, 45)), is_favorite: false },
    { id: makeId(), name: 'Grilled Chicken Salad', calories: 420, protein: 38, timestamp: new Date(d(12, 30)), is_favorite: false },
    { id: makeId(), name: 'Protein Bar', calories: 210, protein: 20, timestamp: new Date(d(15, 15)), is_favorite: false },
    { id: makeId(), name: 'Apple', calories: 95, protein: 0, timestamp: new Date(d(16, 0)), is_favorite: false },
  ]

  const favorites: Entry[] = [
    { id: makeId(), name: 'Grilled Chicken Breast', calories: 165, protein: 31, timestamp: new Date(), is_favorite: true },
    { id: makeId(), name: 'Greek Yogurt', calories: 150, protein: 17, timestamp: new Date(), is_favorite: true },
    { id: makeId(), name: 'Protein Shake', calories: 180, protein: 25, timestamp: new Date(), is_favorite: true },
    { id: makeId(), name: 'Brown Rice (1 cup)', calories: 215, protein: 5, timestamp: new Date(), is_favorite: true },
    { id: makeId(), name: 'Overnight Oats', calories: 380, protein: 12, timestamp: new Date(), is_favorite: true },
    { id: makeId(), name: 'Almonds (1 oz)', calories: 164, protein: 6, timestamp: new Date(), is_favorite: true },
  ]

  localStorage.setItem(KEYS.LOG_DATE, todayStr())
  localStorage.setItem(KEYS.LOG, JSON.stringify(log.map(e => ({ ...e, timestamp: e.timestamp.toISOString() }))))
  localStorage.setItem(KEYS.FAVORITES, JSON.stringify(favorites.map(e => ({ ...e, timestamp: e.timestamp.toISOString() }))))
  localStorage.setItem(KEYS.GOALS, JSON.stringify(DEFAULT_GOALS))
  localStorage.setItem(KEYS.HISTORY, JSON.stringify(log.map(e => ({ name: e.name, calories: e.calories, protein: e.protein }))))
  localStorage.setItem(KEYS.SEEDED, '1')

  return { log, favorites, goals: DEFAULT_GOALS }
}

function parseEntries(raw: string | null): Entry[] {
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw)
    return parsed.map((e: Entry & { timestamp: string }) => ({ ...e, timestamp: new Date(e.timestamp) }))
  } catch {
    return []
  }
}

const FoodLogContext = createContext<FoodLogContextType | undefined>(undefined)

export function FoodLogProvider({ children }: { children: ReactNode }) {
  const [log, setLog] = useState<Entry[]>([])
  const [favorites, setFavorites] = useState<Entry[]>([])
  const [goals, setGoals] = useState<Goals>(DEFAULT_GOALS)
  const [loading, setLoading] = useState(true)
  const [currentDate, setCurrentDate] = useState(todayStr())

  const persistLog = useCallback((entries: Entry[]) => {
    localStorage.setItem(KEYS.LOG, JSON.stringify(entries.map(e => ({ ...e, timestamp: e.timestamp.toISOString() }))))
  }, [])

  const persistFavorites = useCallback((entries: Entry[]) => {
    localStorage.setItem(KEYS.FAVORITES, JSON.stringify(entries.map(e => ({ ...e, timestamp: e.timestamp.toISOString() }))))
  }, [])

  const appendHistory = useCallback((entry: { name: string; calories: number; protein: number }) => {
    const raw = localStorage.getItem(KEYS.HISTORY)
    const history = raw ? JSON.parse(raw) : []
    history.push(entry)
    localStorage.setItem(KEYS.HISTORY, JSON.stringify(history))
  }, [])

  useEffect(() => {
    const seeded = localStorage.getItem(KEYS.SEEDED)
    const savedDate = localStorage.getItem(KEYS.LOG_DATE)

    if (!seeded) {
      const { log: l, favorites: f, goals: g } = seedData()
      setLog(l)
      setFavorites(f)
      setGoals(g)
    } else {
      if (savedDate !== todayStr()) {
        localStorage.setItem(KEYS.LOG_DATE, todayStr())
        localStorage.setItem(KEYS.LOG, JSON.stringify([]))
        setLog([])
      } else {
        setLog(parseEntries(localStorage.getItem(KEYS.LOG)))
      }
      setFavorites(parseEntries(localStorage.getItem(KEYS.FAVORITES)))
      const rawGoals = localStorage.getItem(KEYS.GOALS)
      setGoals(rawGoals ? JSON.parse(rawGoals) : DEFAULT_GOALS)
    }

    setLoading(false)
  }, [])

  useEffect(() => {
    const check = () => {
      const today = todayStr()
      if (today !== currentDate) {
        setCurrentDate(today)
        localStorage.setItem(KEYS.LOG_DATE, today)
        localStorage.setItem(KEYS.LOG, JSON.stringify([]))
        setLog([])
      }
    }
    const interval = setInterval(check, 60000)
    const handleVisible = () => { if (!document.hidden) check() }
    document.addEventListener('visibilitychange', handleVisible)
    return () => {
      clearInterval(interval)
      document.removeEventListener('visibilitychange', handleVisible)
    }
  }, [currentDate])

  const addEntry = async (entry: Omit<Entry, 'timestamp' | 'id' | 'user_id'>) => {
    const newEntry: Entry = { ...entry, id: makeId(), timestamp: new Date(), is_favorite: false }
    setLog(prev => {
      const next = [newEntry, ...prev]
      persistLog(next)
      return next
    })
    appendHistory({ name: entry.name, calories: entry.calories, protein: entry.protein })
  }

  const removeEntry = async (index: number) => {
    setLog(prev => {
      const next = prev.filter((_, i) => i !== index)
      persistLog(next)
      return next
    })
  }

  const updateEntry = async (index: number, entry: Omit<Entry, 'timestamp' | 'id' | 'user_id'>) => {
    setLog(prev => {
      const next = prev.map((item, i) => i === index ? { ...item, ...entry } : item)
      persistLog(next)
      return next
    })
  }

  const addFavorite = async (entry: Omit<Entry, 'timestamp' | 'id' | 'user_id'>) => {
    const newFav: Entry = { ...entry, id: makeId(), timestamp: new Date(), is_favorite: true }
    setFavorites(prev => {
      const next = [...prev, newFav]
      persistFavorites(next)
      return next
    })
  }

  const removeFavorite = async (index: number) => {
    setFavorites(prev => {
      const next = prev.filter((_, i) => i !== index)
      persistFavorites(next)
      return next
    })
  }

  const updateFavorite = async (index: number, entry: Omit<Entry, 'timestamp' | 'id' | 'user_id'>) => {
    setFavorites(prev => {
      const next = prev.map((item, i) => i === index ? { ...item, ...entry } : item)
      persistFavorites(next)
      return next
    })
  }

  const logFavorite = async (entry: Omit<Entry, 'timestamp' | 'id' | 'user_id'>) => {
    await addEntry(entry)
  }

  const updateGoals = async (newGoals: Omit<Goals, 'user_id' | 'id' | 'created_at' | 'updated_at'>) => {
    const g: Goals = { daily_calories_goal: newGoals.daily_calories_goal, daily_protein_goal: newGoals.daily_protein_goal }
    localStorage.setItem(KEYS.GOALS, JSON.stringify(g))
    setGoals(g)
  }

  const getTopFrequentFoods = async (): Promise<FoodFrequency[]> => {
    const raw = localStorage.getItem(KEYS.HISTORY)
    const history: { name: string; calories: number; protein: number }[] = raw ? JSON.parse(raw) : []
    const map = new Map<string, FoodFrequency>()
    history.forEach(entry => {
      const key = entry.name.toLowerCase()
      const existing = map.get(key)
      if (existing) {
        existing.count += 1
      } else {
        map.set(key, { name: entry.name, count: 1, calories: entry.calories, protein: entry.protein })
      }
    })
    return Array.from(map.values()).sort((a, b) => b.count - a.count).slice(0, 10)
  }

  return (
    <FoodLogContext.Provider value={{ log, favorites, goals, loading, addEntry, removeEntry, updateEntry, addFavorite, removeFavorite, updateFavorite, logFavorite, updateGoals, getTopFrequentFoods }}>
      {children}
    </FoodLogContext.Provider>
  )
}

export function useFoodLog() {
  const context = useContext(FoodLogContext)
  if (context === undefined) throw new Error('useFoodLog must be used within a FoodLogProvider')
  return context
}
