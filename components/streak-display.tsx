"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Flame, Trophy, Calendar, Target } from "lucide-react"
import { useEffect, useState } from "react"
import { useUser } from "@clerk/nextjs"

interface UserStats {
  currentStreak: number
  longestStreak: number
  totalLogins: number
  totalTests: number
  avgWpm: number
  avgAccuracy: number
  bestWpm: number
  lastLoginDate: string | null
}

export default function StreakDisplay() {
  const [stats, setStats] = useState<UserStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { isSignedIn } = useUser()

  useEffect(() => {
    const fetchStats = async () => {
      if (!isSignedIn) {
        setIsLoading(false)
        return
      }

      try {
        const response = await fetch("/api/user/stats")
        const data = await response.json()
        if (data.success) {
          setStats(data.stats)
        }
      } catch (error) {
        console.error("Failed to fetch user stats:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [isSignedIn])

  if (!isSignedIn) {
    return (
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">
            <Calendar className="h-8 w-8 mx-auto mb-2" />
            <p>Sign in to track your daily streak and progress!</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (isLoading) {
    return (
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="text-center">Loading your stats...</div>
        </CardContent>
      </Card>
    )
  }

  if (!stats) {
    return null
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Flame className="h-5 w-5 text-orange-500" />
          Your Progress
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex flex-col items-center p-3 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950 dark:to-red-950 rounded-lg border">
            <div className="flex items-center gap-1 mb-1">
              <Flame className="h-4 w-4 text-orange-500" />
              <span className="text-2xl font-bold text-orange-600 dark:text-orange-400">{stats.currentStreak}</span>
            </div>
            <span className="text-xs text-muted-foreground text-center">Current Streak</span>
            {stats.currentStreak > 0 && (
              <Badge variant="secondary" className="mt-1 text-xs">
                🔥 On fire!
              </Badge>
            )}
          </div>

          <div className="flex flex-col items-center p-3 bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-950 dark:to-amber-950 rounded-lg border">
            <div className="flex items-center gap-1 mb-1">
              <Trophy className="h-4 w-4 text-yellow-500" />
              <span className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.longestStreak}</span>
            </div>
            <span className="text-xs text-muted-foreground text-center">Best Streak</span>
          </div>

          <div className="flex flex-col items-center p-3 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 rounded-lg border">
            <div className="flex items-center gap-1 mb-1">
              <Calendar className="h-4 w-4 text-blue-500" />
              <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.totalLogins}</span>
            </div>
            <span className="text-xs text-muted-foreground text-center">Total Logins</span>
          </div>

          <div className="flex flex-col items-center p-3 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 rounded-lg border">
            <div className="flex items-center gap-1 mb-1">
              <Target className="h-4 w-4 text-green-500" />
              <span className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.bestWpm}</span>
            </div>
            <span className="text-xs text-muted-foreground text-center">Best WPM</span>
          </div>
        </div>

        {stats.totalTests > 0 && (
          <div className="mt-4 pt-4 border-t">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-lg font-semibold">{stats.totalTests}</div>
                <div className="text-xs text-muted-foreground">Tests Completed</div>
              </div>
              <div>
                <div className="text-lg font-semibold">{stats.avgWpm}</div>
                <div className="text-xs text-muted-foreground">Average WPM</div>
              </div>
              <div>
                <div className="text-lg font-semibold">{stats.avgAccuracy}%</div>
                <div className="text-xs text-muted-foreground">Average Accuracy</div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
