"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"

interface ResultsDisplayProps {
  results: {
    wpm: number
    cpm: number
    accuracy: number
    time: number
    errors: number
  } | null
  language: string
  difficulty: string
  onRetry: () => void
}

export default function ResultsDisplay({ results, language, difficulty, onRetry }: ResultsDisplayProps) {
  if (!results) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Results</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">Complete a typing test to see your results</p>
          <Button onClick={onRetry} className="w-full">
            Start Test
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Results</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="flex flex-col items-center p-4 bg-muted rounded-lg">
            <span className="text-3xl font-bold">{results.wpm}</span>
            <span className="text-sm text-muted-foreground">WPM</span>
          </div>
          <div className="flex flex-col items-center p-4 bg-muted rounded-lg">
            <span className="text-3xl font-bold">{results.cpm}</span>
            <span className="text-sm text-muted-foreground">CPM</span>
          </div>
          <div className="flex flex-col items-center p-4 bg-muted rounded-lg">
            <span className="text-3xl font-bold">{results.accuracy}%</span>
            <span className="text-sm text-muted-foreground">Accuracy</span>
          </div>
          <div className="flex flex-col items-center p-4 bg-muted rounded-lg">
            <span className="text-3xl font-bold">{results.time}s</span>
            <span className="text-sm text-muted-foreground">Time</span>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-medium mb-2">Details</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>Language:</div>
            <div className="font-medium">{language}</div>
            <div>Difficulty:</div>
            <div className="font-medium">{difficulty}</div>
            <div>Errors:</div>
            <div className="font-medium">{results.errors}</div>
          </div>
        </div>

        <Button onClick={onRetry} className="w-full flex items-center justify-center gap-2">
          <RefreshCw className="h-4 w-4" />
          Try Again
        </Button>
      </CardContent>
    </Card>
  )
}
