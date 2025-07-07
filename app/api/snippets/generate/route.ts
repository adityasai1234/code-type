import { NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"
import { prisma } from "@/lib/database"
import { auth } from "@clerk/nextjs/server"

export const dynamic = 'force-dynamic'

// Use environment variable for API key
const GEMINI_API_KEY = process.env.GEMINI_API_KEY

if (!GEMINI_API_KEY) {
  console.error("GEMINI_API_KEY environment variable is not set")
}

const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null

export async function POST(request: Request) {
  try {
    const { userId } = await auth()
    const { language, difficulty, count = 1, customPrompt } = await request.json()

    if (!userId) {
      return NextResponse.json({ success: false, message: "Authentication required" }, { status: 401 })
    }

    if (!language || !difficulty) {
      return NextResponse.json({ success: false, message: "Language and difficulty are required" }, { status: 400 })
    }

    if (!GEMINI_API_KEY || !genAI) {
      console.error("Gemini API key not configured")
      return NextResponse.json(
        { success: false, message: "AI service not configured. Please check your API key." },
        { status: 500 }
      )
    }

    // Use the correct Gemini model name
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

    let prompt = ""

    if (customPrompt && customPrompt.trim()) {
      // Custom prompt-based generation
      prompt = `Generate ${count} unique ${difficulty} level ${language} code snippets based on this user request: "${customPrompt}"

Each snippet should be:
1. ${difficulty} difficulty level appropriate for coding practice
2. Between 50-200 characters long
3. Syntactically correct ${language} code
4. Related to the user's request: "${customPrompt}"
5. Be practical and educational
6. Use different programming patterns and approaches
7. Include varied syntax and structures
8. Be creative and unique - avoid repetitive patterns

For ${difficulty} difficulty:
- Easy: Simple functions, basic syntax, minimal complexity, variable declarations, basic operations
- Medium: Multiple functions, some logic, moderate complexity, loops, conditionals, basic data structures
- Hard: Complex algorithms, advanced patterns, higher complexity, recursion, advanced data structures, design patterns

Programming patterns to include (vary these):
- Functions and methods
- Loops (for, while, forEach, map, filter)
- Conditionals (if/else, switch, ternary)
- Data structures (arrays, objects, maps, sets)
- Error handling (try/catch, null checks)
- String manipulation
- Mathematical operations
- Date/time operations
- File/API operations (where applicable)

Return the response as a JSON array of objects with this structure:
[
  {
    "code": "the actual code snippet",
    "description": "brief description of what the code does and how it relates to the request",
    "concepts": ["array of programming concepts used"]
  }
]

User Request: ${customPrompt}
Language: ${language}
Difficulty: ${difficulty}
Count: ${count}

Make each snippet unique and different from the others!`
    } else {
      // Default generation with enhanced variety
      prompt = `Generate ${count} unique ${difficulty} level ${language} code snippets for a typing practice application. Each snippet should be:

1. ${difficulty} difficulty level appropriate for coding practice
2. Between 50-200 characters long
3. Syntactically correct ${language} code
4. Include diverse programming patterns like functions, loops, conditionals, data structures, error handling, string manipulation, mathematical operations, date/time operations, and more
5. Be practical and educational
6. Use different approaches and syntax patterns
7. Be creative and unique - avoid repetitive patterns
8. Include real-world scenarios and use cases

For ${difficulty} difficulty:
- Easy: Simple functions, basic syntax, minimal complexity, variable declarations, basic operations, string manipulation, simple calculations
- Medium: Multiple functions, some logic, moderate complexity, loops, conditionals, basic data structures, error handling, array methods, object manipulation
- Hard: Complex algorithms, advanced patterns, higher complexity, recursion, advanced data structures, design patterns, async operations, functional programming concepts

Programming patterns to include (vary these extensively):
- Functions and methods (arrow functions, regular functions, methods)
- Loops (for, while, forEach, map, filter, reduce, some, every)
- Conditionals (if/else, switch, ternary, logical operators)
- Data structures (arrays, objects, maps, sets, stacks, queues)
- Error handling (try/catch, null checks, optional chaining)
- String manipulation (template literals, methods, regex)
- Mathematical operations (Math functions, calculations, algorithms)
- Date/time operations (Date objects, formatting, calculations)
- File/API operations (fetch, async/await, promises)
- Object-oriented concepts (classes, inheritance, encapsulation)
- Functional programming (pure functions, immutability, composition)
- Modern language features (destructuring, spread operator, rest parameters)

Real-world scenarios to include:
- Data processing and transformation
- User input validation
- API responses handling
- File operations
- Database queries
- UI interactions
- Game logic
- Business logic
- Utility functions
- Configuration management

Return the response as a JSON array of objects with this structure:
[
  {
    "code": "the actual code snippet",
    "description": "brief description of what the code does and its real-world application",
    "concepts": ["array of programming concepts used"]
  }
]

Language: ${language}
Difficulty: ${difficulty}
Count: ${count}

IMPORTANT: Make each snippet completely unique and different from the others. Use different programming patterns, syntax styles, and real-world scenarios. Avoid repetitive structures!`
    }

    console.log("Sending request to Gemini API...")
    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()
    
    console.log("Received response from Gemini:", text.substring(0, 200) + "...")

    // Try to parse the JSON response
    let snippets
    try {
      // Remove any markdown formatting if present
      const cleanText = text.replace(/```json\n?|\n?```/g, "").trim()
      snippets = JSON.parse(cleanText)
    } catch (parseError) {
      console.error("Failed to parse JSON response:", parseError)
      console.log("Raw response:", text)
      
      // If JSON parsing fails, create a fallback response
      snippets = [
        {
          code: text.substring(0, 200),
          description: customPrompt
            ? `Generated ${language} code snippet for: ${customPrompt}`
            : `Generated ${language} code snippet`,
          concepts: [language, difficulty],
        },
      ]
    }

    // Ensure snippets is an array
    if (!Array.isArray(snippets)) {
      snippets = [snippets]
    }

    // Validate and clean snippets, then save to database
    const validSnippets = []

    for (let i = 0; i < Math.min(snippets.length, count); i++) {
      const snippet = snippets[i]

      try {
        // Save to database
        const savedSnippet = await prisma.generatedSnippet.create({
          data: {
            language,
            difficulty,
            code: snippet.code || snippet.text || text.substring(0, 200),
            description:
              snippet.description ||
              (customPrompt ? `Generated ${language} snippet for: ${customPrompt}` : `Generated ${language} snippet`),
            concepts: JSON.stringify(Array.isArray(snippet.concepts) ? snippet.concepts : [language, difficulty]),
            prompt: customPrompt || null,
          },
        })

        validSnippets.push({
          id: `generated-${savedSnippet.id}`,
          code: savedSnippet.code,
          description: savedSnippet.description,
          concepts: JSON.parse(savedSnippet.concepts || "[]"),
          language,
          difficulty,
          generated: true,
          customPrompt: customPrompt || null,
          timestamp: savedSnippet.createdAt.toISOString(),
        })
      } catch (dbError) {
        console.error("Database error:", dbError)
        
        // Fallback: return snippet without saving to database
        validSnippets.push({
          id: `generated-${Date.now()}-${i}`,
          code: snippet.code || snippet.text || text.substring(0, 200),
          description:
            snippet.description ||
            (customPrompt ? `Generated ${language} snippet for: ${customPrompt}` : `Generated ${language} snippet`),
          concepts: Array.isArray(snippet.concepts) ? snippet.concepts : [language, difficulty],
          language,
          difficulty,
          generated: true,
          customPrompt: customPrompt || null,
          timestamp: new Date().toISOString(),
        })
      }
    }

    return NextResponse.json({
      success: true,
      snippets: validSnippets,
      message: customPrompt
        ? `Generated ${validSnippets.length} code snippets for: "${customPrompt}"`
        : `Generated ${validSnippets.length} code snippets`,
    })
  } catch (error) {
    console.error("Error generating snippets:", error)
    
    // More detailed error logging
    if (error instanceof Error) {
      console.error("Error message:", error.message)
      console.error("Error stack:", error.stack)
    }
    
    return NextResponse.json(
      {
        success: false,
        message: "Failed to generate code snippets. Please check your API key and try again.",
        error: process.env.NODE_ENV === 'development' && error instanceof Error ? error.message : undefined
      },
      { status: 500 },
    )
  }
}
