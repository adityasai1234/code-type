"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Play, Pause, RotateCcw, Clock } from "lucide-react"
import { cn } from "@/lib/utils"

interface TimerProps {
  className?: string
}

export default function Timer({ className }: TimerProps) {
  // Timer settings
  const [hours, setHours] = useState<number>(0)
  const [minutes, setMinutes] = useState<number>(0)
  const [seconds, setSeconds] = useState<number>(0)

  // Timer state
  const [isRunning, setIsRunning] = useState<boolean>(false)
  const [timeLeft, setTimeLeft] = useState<number>(0)
  const [totalDuration, setTotalDuration] = useState<number>(0)
  const [progress, setProgress] = useState<number>(100)

  // Refs
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Format time as HH:MM:SS
  const formatTime = (timeInSeconds: number): string => {
    const h = Math.floor(timeInSeconds / 3600)
    const m = Math.floor((timeInSeconds % 3600) / 60)
    const s = Math.floor(timeInSeconds % 60)

    return [h.toString().padStart(2, "0"), m.toString().padStart(2, "0"), s.toString().padStart(2, "0")].join(":")
  }

  // Start the timer
  const startTimer = () => {
    if (timeLeft <= 0) {
      // If timer is not set or has ended, set it first
      const newDuration = hours * 3600 + minutes * 60 + seconds
      if (newDuration <= 0) return

      setTotalDuration(newDuration)
      setTimeLeft(newDuration)
    }

    setIsRunning(true)
  }

  // Stop the timer
  const stopTimer = () => {
    setIsRunning(false)
  }

  // Reset the timer
  const resetTimer = () => {
    stopTimer()
    setTimeLeft(0)
    setProgress(100)
  }

  // Handle input changes
  const handleHoursChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number.parseInt(e.target.value) || 0
    setHours(Math.max(0, Math.min(99, value)))
  }

  const handleMinutesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number.parseInt(e.target.value) || 0
    setMinutes(Math.max(0, Math.min(59, value)))
  }

  const handleSecondsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number.parseInt(e.target.value) || 0
    setSeconds(Math.max(0, Math.min(59, value)))
  }

  // Update timer every second
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(intervalRef.current as NodeJS.Timeout)
            setIsRunning(false)
            return 0
          }
          return prevTime - 1
        })
      }, 1000)
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isRunning])

  // Update progress bar
  useEffect(() => {
    if (totalDuration > 0) {
      setProgress(Math.round((timeLeft / totalDuration) * 100))
    }
  }, [timeLeft, totalDuration])

  // Play alarm sound when timer ends
  useEffect(() => {
    if (timeLeft === 0 && totalDuration > 0) {
      // You could add a sound effect here
      // For example: new Audio('/alarm.mp3').play();
    }
  }, [timeLeft, totalDuration])

  return (
    <Card className={cn("w-full max-w-md mx-auto", className)}>
      <CardHeader>
        <CardTitle className="flex items-center justify-center gap-2">
          <Clock className="h-5 w-5" />
          <span>Timer</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Timer Display */}
          <div className="text-center">
            <div className="text-6xl font-bold font-mono tracking-wider">{formatTime(timeLeft)}</div>
            <Progress value={progress} className="h-2 mt-4" />
          </div>

          {/* Timer Controls */}
          <div className="flex justify-center gap-2">
            <Button
              onClick={isRunning ? stopTimer : startTimer}
              variant={isRunning ? "destructive" : "default"}
              className="w-24"
            >
              {isRunning ? (
                <>
                  <Pause className="mr-2 h-4 w-4" /> Pause
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" /> Start
                </>
              )}
            </Button>
            <Button onClick={resetTimer} variant="outline" className="w-24">
              <RotateCcw className="mr-2 h-4 w-4" /> Reset
            </Button>
          </div>

          {/* Timer Settings */}
          {!isRunning && timeLeft === 0 && (
            <div className="grid grid-cols-3 gap-2">
              <div>
                <Label htmlFor="hours">Hours</Label>
                <Input id="hours" type="number" min="0" max="99" value={hours} onChange={handleHoursChange} />
              </div>
              <div>
                <Label htmlFor="minutes">Minutes</Label>
                <Input id="minutes" type="number" min="0" max="59" value={minutes} onChange={handleMinutesChange} />
              </div>
              <div>
                <Label htmlFor="seconds">Seconds</Label>
                <Input id="seconds" type="number" min="0" max="59" value={seconds} onChange={handleSecondsChange} />
              </div>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-center text-sm text-muted-foreground">
        {isRunning ? "Timer is running" : timeLeft > 0 ? "Timer is paused" : "Set timer duration"}
      </CardFooter>
    </Card>
  )
}