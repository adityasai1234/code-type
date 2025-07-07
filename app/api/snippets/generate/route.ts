import { NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"
import { prisma } from "@/lib/database"
import { auth } from "@clerk/nextjs/server"

// Use the new API key provided by the user
const GEMINI_API_KEY = "AIzaSyCGw5mhkJYeE_wdGOotsK6r-iZceIquag8"
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY)

export async function POST(request: Request) {
  try {
    const { userId } = await auth()
    const { language, difficulty, count = 1, customPrompt } = await request.json()

    if (!language || !difficulty) {
      return NextResponse.json({ success: false, message: "Language and difficulty are required" }, { status: 400 })
    }

    const model = genAI.getGenerativeModel({ model: "gemini-pro" })

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

For ${difficulty} difficulty:
- Easy: Simple functions, basic syntax, minimal complexity
- Medium: Multiple functions, some logic, moderate complexity  
- Hard: Complex algorithms, advanced patterns, higher complexity

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
Count: ${count}`
    } else {
      // Default generation
      prompt = `Generate ${count} unique ${difficulty} level ${language} code snippets for a typing practice application. Each snippet should be:

1. ${difficulty} difficulty level appropriate for coding practice
2. Between 50-200 characters long
3. Syntactically correct ${language} code
4. Include common programming patterns like functions, loops, conditionals, or data structures
5. Be practical and educational

For ${difficulty} difficulty:
- Easy: Simple functions, basic syntax, minimal complexity
- Medium: Multiple functions, some logic, moderate complexity  
- Hard: Complex algorithms, advanced patterns, higher complexity

Return the response as a JSON array of objects with this structure:
[
  {
    "code": "the actual code snippet",
    "description": "brief description of what the code does",
    "concepts": ["array of programming concepts used"]
  }
]

Language: ${language}
Difficulty: ${difficulty}
Count: ${count}`
    }

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    // Try to parse the JSON response
    let snippets
    try {
      // Remove any markdown formatting if present
      const cleanText = text.replace(/```json\n?|\n?```/g, "").trim()
      snippets = JSON.parse(cleanText)
    } catch (parseError) {
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
    return NextResponse.json(
      {
        success: false,
        message: "Failed to generate code snippets. Please check your API key and try again.",
      },
      { status: 500 },
    )
  }
}
