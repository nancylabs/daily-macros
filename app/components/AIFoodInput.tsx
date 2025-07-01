"use client"
import { useState, useRef } from "react"

type FoodItem = {
  name: string
  estimated_calories: number
  estimated_protein: number
  assumed_weight_g: number
  notes: string
}

export default function AIFoodInput({ onPrefill }: { onPrefill: (item: FoodItem | null, summary: string) => void }) {
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [foods, setFoods] = useState<FoodItem[] | null>(null)
  const [expanded, setExpanded] = useState(false)
  const [summary, setSummary] = useState("")
  const recognitionRef = useRef<any>(null)
  const [isRecording, setIsRecording] = useState(false)

  // Speech-to-text support
  const supportsSpeech = typeof window !== "undefined" && (
    (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
  )

  const handleSpeech = () => {
    if (!supportsSpeech) return
    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
    if (!recognitionRef.current) {
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = false
      recognitionRef.current.interimResults = false
      recognitionRef.current.lang = "en-US"
      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript
        setInput(transcript)
        setIsRecording(false)
      }
      recognitionRef.current.onerror = () => setIsRecording(false)
      recognitionRef.current.onend = () => setIsRecording(false)
    }
    setIsRecording(true)
    recognitionRef.current.start()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setFoods(null)
    setSummary("")
    onPrefill(null, "")
    try {
      const res = await fetch("/api/parse-meal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Unknown error")
      } else {
        setFoods(data)
        if (Array.isArray(data) && data.length > 0) {
          // Build summary
          const totalCals = data.reduce((sum, f) => sum + (f.estimated_calories || 0), 0)
          const totalProtein = data.reduce((sum, f) => sum + (f.estimated_protein || 0), 0)
          const summaryLine = `We found ${data.length} item${data.length > 1 ? "s" : ""} totaling ~${totalCals} calories and ${totalProtein}g of protein`
          setSummary(summaryLine)
          onPrefill(data[0], summaryLine)
        } else {
          setSummary("")
          onPrefill(null, "")
        }
      }
    } catch (err: any) {
      setError(err.message || "Request failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-[#181A2A] rounded-xl shadow-lg p-4 mb-6 border border-[#2A2E3B]">
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-stretch gap-2">
        <input
          type="text"
          className="flex-1 p-3 rounded border border-gray-700 bg-gray-900 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Type, search, or say what you ate…"
          value={input}
          onChange={e => setInput(e.target.value)}
          disabled={loading || isRecording}
          aria-label="Food description"
        />
        <button
          type="button"
          onClick={handleSpeech}
          className={`px-3 rounded bg-gray-800 text-blue-400 hover:bg-blue-900 transition flex items-center justify-center ${!supportsSpeech ? "opacity-50 cursor-not-allowed" : ""}`}
          disabled={!supportsSpeech || loading || isRecording}
          aria-label="Speak food description"
        >
          <svg className={`w-6 h-6 ${isRecording ? "animate-pulse text-red-500" : ""}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 18v2m0 0c-3.314 0-6-2.686-6-6m6 6c3.314 0 6-2.686 6-6m-6 6V4m0 0c-1.657 0-3 1.343-3 3v4c0 1.657 1.343 3 3 3s3-1.343 3-3V7c0-1.657-1.343-3-3-3z" /></svg>
        </button>
        <button
          type="submit"
          className="px-6 py-2 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 transition disabled:opacity-50"
          disabled={loading || !input.trim()}
        >
          {loading ? (
            <span className="flex items-center gap-2"><span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>Analyzing…</span>
          ) : (
            "Analyze"
          )}
        </button>
      </form>
      {error && (
        <div className="bg-red-100 text-red-800 p-3 rounded mt-3">{error}</div>
      )}
      {summary && (
        <div className="mt-4 text-blue-200 text-sm flex items-center gap-2">
          <span>{summary}</span>
          {foods && foods.length > 1 && (
            <button
              className="ml-2 underline text-blue-400 hover:text-blue-200 text-xs"
              onClick={() => setExpanded(e => !e)}
              type="button"
            >
              {expanded ? "Hide details" : "Show details"}
            </button>
          )}
        </div>
      )}
      {foods && foods.length > 0 && (expanded || foods.length === 1) && (
        <div className="mt-2 space-y-2">
          {foods.map((f, i) => (
            <div key={i} className="bg-gray-800 rounded p-3 text-white text-sm flex flex-col gap-1">
              <div className="font-semibold">{f.name}</div>
              <div>Calories: <span className="font-mono">{f.estimated_calories}</span> | Protein: <span className="font-mono">{f.estimated_protein}g</span></div>
              <div className="text-xs text-blue-200">{f.notes}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
} 