import { useState } from 'react'

export default function TestParseMealPage() {
  const [input, setInput] = useState('')
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const res = await fetch('/api/parse-meal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Unknown error')
      } else {
        setResult(data)
      }
    } catch (err: any) {
      setError(err.message || 'Request failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="max-w-xl mx-auto p-8 space-y-6">
      <h1 className="text-2xl font-bold mb-4">Test AI Food Parse API</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <textarea
          className="w-full p-3 rounded border border-gray-300 bg-gray-900 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={3}
          placeholder="Type what you ate (e.g. 'half a turkey sandwich and a handful of almonds')"
          value={input}
          onChange={e => setInput(e.target.value)}
          required
        />
        <button
          type="submit"
          className="px-6 py-2 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 transition disabled:opacity-50"
          disabled={loading || !input.trim()}
        >
          {loading ? 'Analyzing...' : 'Analyze'}
        </button>
      </form>
      {error && (
        <div className="bg-red-100 text-red-800 p-3 rounded">{error}</div>
      )}
      {result && (
        <pre className="bg-gray-800 text-green-200 p-4 rounded overflow-x-auto text-sm">
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </main>
  )
} 