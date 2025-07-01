import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

const SYSTEM_PROMPT = `You are a nutrition assistant. Your ONLY job is to identify EVERY food item mentioned and return nutrition data for each one.

RULE: If the user mentions multiple foods, you MUST create a separate entry for each one.

Example input: "half a cheeseburger and 15 french fries"
You MUST return:
[
  {"name": "half a cheeseburger", "estimated_calories": 250, "estimated_protein": 15, "assumed_weight_g": 100, "notes": "half of standard cheeseburger"},
  {"name": "15 french fries", "estimated_calories": 150, "estimated_protein": 2, "assumed_weight_g": 50, "notes": "15 medium french fries"}
]

DO NOT combine foods into one entry. DO NOT skip any foods mentioned.

The response must be valid JSON. Return your response as a JSON array. Each object in the array should contain: name, estimated_calories, estimated_protein, assumed_weight_g, notes.

Respond ONLY with a valid JSON array, and nothing else. Do NOT use markdown or code blocks. Do NOT wrap your response in triple backticks or any other formatting. If no foods are identified, return an empty array: []`

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
        
        const content = data.choices[0].message.content.trim()
        
        // Try to parse as JSON array or object
        let parsed
        try {
          parsed = JSON.parse(content)
        } catch (parseError) {
          // Fallback: try to extract JSON from markdown code blocks
          console.log("Initial JSON parse failed, trying to extract from markdown...")
          
          // Try to extract JSON from ```json ... ``` blocks
          const jsonBlockMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/)
          if (jsonBlockMatch) {
            try {
              parsed = JSON.parse(jsonBlockMatch[1].trim())
              console.log("Successfully extracted JSON from markdown block")
            } catch (blockError) {
              console.log("Failed to parse JSON from markdown block:", blockError)
            }
          }
          
          // If still no success, try to find any JSON array in the content
          if (!parsed) {
            const jsonArrayMatch = content.match(/\[[\s\S]*\]/)
            if (jsonArrayMatch) {
              try {
                parsed = JSON.parse(jsonArrayMatch[0])
                console.log("Successfully extracted JSON array from content")
              } catch (arrayError) {
                console.log("Failed to parse JSON array from content:", arrayError)
              }
            }
          }
        }
        
        if (parsed) {
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
        } else {
          console.log("Could not parse any valid JSON from OpenAI response")
          return NextResponse.json({ 
            error: 'Could not parse food data from AI response. Please try again or rephrase your input.' 
          }, { status: 500 })
        }
      }
    } catch (e) {
      console.log("Error parsing JSON:", e)
      return NextResponse.json({ 
        error: 'Failed to parse AI response. Please try again.' 
      }, { status: 500 })
    }

    if (!foods.length) {
      return NextResponse.json({ error: 'No foods found in response' }, { status: 500 })
    }

    return NextResponse.json(foods)
  } catch (err) {
    return NextResponse.json({ error: 'Server error', details: err instanceof Error ? err.message : err }, { status: 500 })
  }
} 