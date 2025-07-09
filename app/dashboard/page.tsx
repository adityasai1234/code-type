"use client"

import { useUser } from "@clerk/nextjs"
import { UserButton } from "@clerk/nextjs"
import CodeTypingTest from "@/components/code-typing-test"
import StreakDisplay from "@/components/streak-display"
import FeedbackSystem from "@/components/feedback-system"
import { User, MessageSquare } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

export const dynamic = 'force-dynamic'

export default function DashboardPage() {
  const { user, isLoaded, isSignedIn } = useUser()
  const { toast } = useToast()
  const [streakData, setStreakData] = useState<any>(null)
  const router = useRouter()

  // Redirect if not signed in
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/")
    }
  }, [isLoaded, isSignedIn, router])

  // Sync user and get streak data on mount
  useEffect(() => {
    const syncUser = async () => {
      if (!isLoaded || !user) return

      try {
        const response = await fetch("/api/user/sync", { method: "POST" })
        const data = await response.json()

        if (data.success && data.streak) {
          setStreakData(data.streak)

          // Show streak notification for new streaks
          if (data.streak.isNewStreak && data.streak.current > 1) {
            toast({
              title: `🔥 ${data.streak.current} Day Streak!`,
              description: `You're on fire! Keep it up to beat your record of ${data.streak.longest} days.`,
            })
          } else if (data.streak.current === 1 && data.streak.isNewStreak) {
            toast({
              title: "Welcome back! 🎉",
              description: "Start a new streak by practicing daily!",
            })
          }
        }
      } catch (error) {
        console.error("Failed to sync user:", error)
      }
    }

    syncUser()
  }, [isLoaded, user, toast])

  if (!isLoaded) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-24">
        <div className="z-10 w-full max-w-5xl flex flex-col items-center justify-center">
          <p>Loading...</p>
        </div>
      </main>
    )
  }

  if (!isSignedIn) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-24">
        <div className="z-10 w-full max-w-5xl flex flex-col items-center justify-center">
          <p>Redirecting...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-4 md:p-24">
      <div className="z-10 w-full max-w-5xl flex flex-col">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold">CodeType</h1>
            <p className="text-xl text-muted-foreground">Improve your coding speed and accuracy</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-muted p-2 rounded-md">
              <User className="h-4 w-4" />
              <span>{user?.firstName || user?.username}</span>
            </div>
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>

        <StreakDisplay />
        <CodeTypingTest />
        
        <div className="mt-8">
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare className="h-5 w-5" />
            <h2 className="text-2xl font-semibold">Feedback & Testing</h2>
          </div>
          <FeedbackSystem />
        </div>
      </div>
    </main>
  )
}
