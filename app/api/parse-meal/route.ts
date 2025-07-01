import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

const SYSTEM_PROMPT = `You're a helpful nutrition assistant. The user will describe what they ate in natural language. Your goal is to identify ALL individual foods mentioned, estimate their calories and protein, and explain how you arrived at your estimate.

IMPORTANT: If the user mentions multiple foods (e.g., "half a cheeseburger and 15 french fries"), you MUST identify each food item separately and calculate calories/protein for each one individually.

Some portions may be vague (e.g. "half an egg sandwich," "a fist-sized piece of salmon"). Use your best judgment to infer approximate weight or serving size in grams or common units.

Return a JSON array. Each item should include:
- name: string — a brief description of the food
- estimated_calories: number — total estimated calories for this specific item
- estimated_protein: number — grams of protein for this specific item
- assumed_weight_g: number — how many grams you assumed this portion was
- notes: string — a short explanation like "estimated based on 1/2 sandwich (75g)" or "fist-sized salmon ≈ 100g"

Examples:
- "half a cheeseburger and 15 french fries" should return 2 items: one for the cheeseburger portion and one for the fries
- "chicken salad with mixed greens" should return 2 items: one for the chicken salad and one for the greens
- "oatmeal with banana and honey" should return 3 items: one for each component

Respond **only** with a JSON array, no extra commentary or markdown.`

export async function POST(req: NextRequest) {
  try {
    const { input } = await req.json()
    if (!input || typeof input !== 'string') {
      return NextResponse.json({ error: 'Missing or invalid input' }, { status: 400 })
    }

    const apiKey = process.env.OPENAI_API_KEY
    console.log("OPENAI KEY:", process.env.OPENAI_API_KEY ? "PRESENT" : "MISSING")
    console.log("OPENAI KEY LENGTH:", process.env.OPENAI_API_KEY?.length || 0)
    if (!apiKey) {
      return NextResponse.json({ error: 'Missing OpenAI API key' }, { status: 500 })
    }

    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: input },
        ],
        temperature: 0.3,
        max_tokens: 800,
        response_format: { type: 'json_object' },
      }),
    })

    if (!openaiRes.ok) {
      const err = await openaiRes.text()
      return NextResponse.json({ error: 'OpenAI API error', details: err }, { status: 500 })
    }

    const data = await openaiRes.json()
    console.log("OpenAI Response:", JSON.stringify(data, null, 2))
    
    // Try to parse the JSON array from the response
    let foods = []
    try {
      // gpt-4o with response_format: json_object will return { "food_items": [...] }
      if (data.choices && data.choices[0]?.message?.content) {
        console.log("Raw content from OpenAI:", data.choices[0].message.content)
        // Try to parse as JSON array or object
        const parsed = JSON.parse(data.choices[0].message.content)
        console.log("Parsed content:", JSON.stringify(parsed, null, 2))
        
        if (Array.isArray(parsed)) {
          foods = parsed
        } else if (parsed.food_items && Array.isArray(parsed.food_items)) {
          foods = parsed.food_items
        } else if (parsed.name && parsed.estimated_calories) {
          // Single food object - wrap in array
          foods = [parsed]
        } else {
          foods = []
        }
      }
    } catch (e) {
      console.log("Error parsing JSON:", e)
      foods = []
    }

    if (!foods.length) {
      return NextResponse.json({ error: 'No foods found in response' }, { status: 500 })
    }

    return NextResponse.json(foods)
  } catch (err) {
    return NextResponse.json({ error: 'Server error', details: err instanceof Error ? err.message : err }, { status: 500 })
  }
} 