import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/database"

export async function GET() {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        typingHistory: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    })

    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 })
    }

    // Calculate additional stats
    const totalTests = user.typingHistory.length
    const avgWpm =
      totalTests > 0 ? Math.round(user.typingHistory.reduce((sum, test) => sum + test.wpm, 0) / totalTests) : 0
    const avgAccuracy =
      totalTests > 0 ? Math.round(user.typingHistory.reduce((sum, test) => sum + test.accuracy, 0) / totalTests) : 0
    const bestWpm = totalTests > 0 ? Math.max(...user.typingHistory.map((test) => test.wpm)) : 0

    return NextResponse.json({
      success: true,
      stats: {
        currentStreak: user.currentStreak,
        longestStreak: user.longestStreak,
        totalLogins: user.totalLogins,
        totalTests,
        avgWpm,
        avgAccuracy,
        bestWpm,
        lastLoginDate: user.lastLoginDate,
      },
    })
  } catch (error) {
    console.error("Error fetching user stats:", error)
    return NextResponse.json({ success: false, message: "Failed to fetch stats" }, { status: 500 })
  }
}
