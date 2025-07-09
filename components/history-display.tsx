"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface HistoryEntry {
  language: string
  difficulty: string
  wpm: number
  accuracy: number
  date: string
}

interface HistoryDisplayProps {
  history: HistoryEntry[]
}

export default function HistoryDisplay({ history }: HistoryDisplayProps) {
  const [localHistory, setLocalHistory] = useState(history)
  const [selectedLanguage, setSelectedLanguage] = useState<string>("all")
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all")

  // Get unique languages and difficulties from history, always include 'C++'
  const languageSet = new Set(history.map((entry) => entry.language))
  languageSet.add("C++")
  const languageOptions = Array.from(languageSet)
  const difficultyOptions = Array.from(new Set(history.map((entry) => entry.difficulty)))

  // Filter localHistory based on selected filters
  const filteredHistory = localHistory.filter((entry) => {
    const languageMatch = selectedLanguage !== "all" ? entry.language === selectedLanguage : true
    const difficultyMatch = selectedDifficulty !== "all" ? entry.difficulty === selectedDifficulty : true
    return languageMatch && difficultyMatch
  })

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString() + " " + date.toLocaleTimeString()
  }

  const clearHistory = () => {
    localStorage.removeItem("codeTypeHistory")
    setLocalHistory([])
  }

  if (localHistory.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>History</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">
            No history available yet. Complete some typing tests to see your progress.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>History</CardTitle>
        <Button variant="destructive" size="sm" onClick={clearHistory} className="flex items-center gap-1">
          <Trash2 className="h-4 w-4" />
          Clear
        </Button>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-4 mb-4">
          <div>
            <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by Language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Languages</SelectItem>
                {languageOptions.map((lang) => (
                  <SelectItem key={lang} value={lang}>{lang}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by Difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Difficulties</SelectItem>
                {difficultyOptions.map((diff) => (
                  <SelectItem key={diff} value={diff}>{diff.charAt(0).toUpperCase() + diff.slice(1)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Language</TableHead>
                <TableHead>Difficulty</TableHead>
                <TableHead>WPM</TableHead>
                <TableHead>Accuracy</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredHistory.map((entry, index) => (
                <TableRow key={index}>
                  <TableCell>{formatDate(entry.date)}</TableCell>
                  <TableCell>{entry.language}</TableCell>
                  <TableCell className="capitalize">{entry.difficulty}</TableCell>
                  <TableCell>{entry.wpm}</TableCell>
                  <TableCell>{entry.accuracy}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
