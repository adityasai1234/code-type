import { NextResponse } from "next/server"
import { prisma } from "@/lib/database"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const language = searchParams.get("language")
    const difficulty = searchParams.get("difficulty")

    const where: any = {}
    if (language) where.language = language
    if (difficulty) where.difficulty = difficulty

    const snippets = await prisma.generatedSnippet.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 50,
    })

    const snippetsList = snippets.map((snippet) => ({
      id: snippet.id,
      language: snippet.language,
      difficulty: snippet.difficulty,
      code: snippet.code,
      description: snippet.description,
      concepts: snippet.concepts ? JSON.parse(snippet.concepts) : [],
      createdAt: snippet.createdAt.toISOString(),
    }))

    return NextResponse.json({
      success: true,
      snippets: snippetsList,
    })
  } catch (error) {
    console.error("Error fetching generated snippets:", error)
    return NextResponse.json({ success: false, message: "Failed to fetch snippets" }, { status: 500 })
  }
}
