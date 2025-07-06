import { NextResponse } from "next/server"
import { auth, currentUser } from "@clerk/nextjs/server"
import { prisma } from "@/lib/database"

export async function POST() {
  try {
    const { userId } = await auth()
    const user = await currentUser()

    if (!userId || !user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Get existing user data
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    })

    let currentStreak = 0
    let longestStreak = 0
    let totalLogins = 1

    if (existingUser) {
      const lastLogin = existingUser.lastLoginDate
      totalLogins = existingUser.totalLogins + 1

      if (lastLogin) {
        const lastLoginDate = new Date(lastLogin)
        lastLoginDate.setHours(0, 0, 0, 0)

        const daysDifference = Math.floor((today.getTime() - lastLoginDate.getTime()) / (1000 * 60 * 60 * 24))

        if (daysDifference === 0) {
          // Same day login - don't increment streak
          currentStreak = existingUser.currentStreak
          longestStreak = existingUser.longestStreak
          totalLogins = existingUser.totalLogins // Don't increment for same day
        } else if (daysDifference === 1) {
          // Consecutive day login - increment streak
          currentStreak = existingUser.currentStreak + 1
          longestStreak = Math.max(existingUser.longestStreak, currentStreak)
        } else {
          // Streak broken - reset to 1
          currentStreak = 1
          longestStreak = existingUser.longestStreak
        }
      } else {
        // First time setting last login date
        currentStreak = 1
        longestStreak = Math.max(existingUser.longestStreak, 1)
      }
    } else {
      // New user
      currentStreak = 1
      longestStreak = 1
    }

    // Sync user data with database
    const updatedUser = await prisma.user.upsert({
      where: { id: userId },
      update: {
        email: user.emailAddresses[0]?.emailAddress || "",
        username: user.username || user.firstName || "",
        lastLoginDate: new Date(),
        currentStreak,
        longestStreak,
        totalLogins,
      },
      create: {
        id: userId,
        email: user.emailAddresses[0]?.emailAddress || "",
        username: user.username || user.firstName || "",
        lastLoginDate: new Date(),
        currentStreak,
        longestStreak,
        totalLogins,
      },
    })

    return NextResponse.json({
      success: true,
      message: "User synced successfully",
      streak: {
        current: updatedUser.currentStreak,
        longest: updatedUser.longestStreak,
        totalLogins: updatedUser.totalLogins,
        isNewStreak: currentStreak > (existingUser?.currentStreak || 0),
      },
    })
  } catch (error) {
    console.error("Error syncing user:", error)
    return NextResponse.json({ success: false, message: "Failed to sync user" }, { status: 500 })
  }
}
