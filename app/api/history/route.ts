import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/database"

export async function POST(request: Request) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const data = await request.json()
    const { language, difficulty, wpm, cpm, accuracy, snippetId } = data

    // Validate input
    if (
      !language ||
      !difficulty ||
      typeof wpm !== "number" ||
      typeof cpm !== "number" ||
      typeof accuracy !== "number" ||
      !snippetId
    ) {
      return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 })
    }

    // Ensure user exists in database
    await prisma.user.upsert({
      where: { id: userId },
      update: {},
      create: {
        id: userId,
        email: "", // Will be updated when we have access to user data
      },
    })

    // Save typing result
    const result = await prisma.typingHistory.create({
      data: {
        userId,
        language,
        difficulty,
        wpm,
        cpm,
        accuracy,
        snippetId,
      },
    })

    return NextResponse.json({ success: true, message: "Result saved successfully", id: result.id })
  } catch (error) {
    console.error("Error saving typing result:", error)
    return NextResponse.json({ success: false, message: "Failed to save result" }, { status: 500 })
  }
}

export async function GET() {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const history = await prisma.typingHistory.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 50,
    })

    const historyList = history.map((entry) => ({
      language: entry.language,
      difficulty: entry.difficulty,
      wpm: entry.wpm,
      cpm: entry.cpm,
      accuracy: entry.accuracy,
      snippetId: entry.snippetId,
      date: entry.createdAt.toISOString(),
    }))

    return NextResponse.json({ success: true, history: historyList })
  } catch (error) {
    console.error("Error fetching typing history:", error)
    return NextResponse.json({ success: false, message: "Failed to fetch history" }, { status: 500 })
  }
}
