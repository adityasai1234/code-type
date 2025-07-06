"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { codeSnippets } from "@/lib/code-snippets"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { Keyboard, RefreshCw, Timer, BarChart2, Sparkles, Loader2, Save } from "lucide-react"
import { useUser } from "@clerk/nextjs"
import CodeDisplay from "./code-display"
import ResultsDisplay from "./results-display"
import HistoryDisplay from "./history-display"
import CustomSnippetGenerator from "./custom-snippet-generator"

export default function CodeTypingTest() {
  const [language, setLanguage] = useState("javascript")
  const [difficulty, setDifficulty] = useState("medium")
  const [currentSnippet, setCurrentSnippet] = useState("")
  const [currentSnippetInfo, setCurrentSnippetInfo] = useState<any>(null)
  const [typedText, setTypedText] = useState("")
  const [isStarted, setIsStarted] = useState(false)
  const [isFinished, setIsFinished] = useState(false)
  const [startTime, setStartTime] = useState<number | null>(null)
  const [endTime, setEndTime] = useState<number | null>(null)
  const [progress, setProgress] = useState(0)
  const [results, setResults] = useState<{
    wpm: number
    cpm: number
    accuracy: number
    time: number
    errors: number
  } | null>(null)
  const [history, setHistory] = useState<
    Array<{
      language: string
      difficulty: string
      wpm: number
      accuracy: number
      date: string
    }>
  >([])
  const [activeTab, setActiveTab] = useState("test")
  const [isGeneratingSnippet, setIsGeneratingSnippet] = useState(false)
  const [generatedSnippets, setGeneratedSnippets] = useState<any[]>([])
  const [isSavingResult, setIsSavingResult] = useState(false)

  const inputRef = useRef<HTMLTextAreaElement>(null)
  const { toast } = useToast()
  const { user, isSignedIn } = useUser()

  // Sync user data on mount
  useEffect(() => {
    if (isSignedIn && user) {
      fetch("/api/user/sync", { method: "POST" }).catch(console.error)
    }
  }, [isSignedIn, user])

  // Load history from localStorage and API
  useEffect(() => {
    const loadHistory = async () => {
      // Load from localStorage first
      const savedHistory = localStorage.getItem("codeTypeHistory")
      if (savedHistory) {
        try {
          setHistory(JSON.parse(savedHistory))
        } catch (e) {
          console.error("Failed to parse history from localStorage")
        }
      }

      // If signed in, load from API
      if (isSignedIn) {
        try {
          const response = await fetch("/api/history")
          const data = await response.json()
          if (data.success) {
            setHistory(data.history)
          }
        } catch (error) {
          console.error("Failed to load history from API:", error)
        }
      }
    }

    loadHistory()
  }, [isSignedIn])

  // Get a random snippet based on language and difficulty
  const getRandomSnippet = () => {
    // First try to get from generated snippets
    const availableGenerated = generatedSnippets.filter((s) => s.language === language && s.difficulty === difficulty)

    if (availableGenerated.length > 0) {
      const randomIndex = Math.floor(Math.random() * availableGenerated.length)
      const snippet = availableGenerated[randomIndex]
      setCurrentSnippetInfo(snippet)
      return snippet.code
    }

    // Fallback to predefined snippets
    const snippets = codeSnippets[language][difficulty]
    const randomIndex = Math.floor(Math.random() * snippets.length)
    setCurrentSnippetInfo(null)
    return snippets[randomIndex]
  }

  // Generate new snippet using Gemini API
  const generateNewSnippet = async () => {
    setIsGeneratingSnippet(true)
    try {
      const response = await fetch("/api/snippets/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          language,
          difficulty,
          count: 1,
        }),
      })

      const data = await response.json()

      if (data.success && data.snippets.length > 0) {
        const newSnippet = data.snippets[0]
        setGeneratedSnippets((prev) => [...prev, newSnippet])
        setCurrentSnippet(newSnippet.code)
        setCurrentSnippetInfo(newSnippet)

        toast({
          title: "New snippet generated!",
          description: newSnippet.description || "AI-generated code snippet ready for practice",
        })
      } else {
        throw new Error(data.message || "Failed to generate snippet")
      }
    } catch (error) {
      toast({
        title: "Failed to generate snippet",
        description: error instanceof Error ? error.message : "Using default snippet instead",
        variant: "destructive",
      })
      // Fallback to regular snippet
      const snippet = getRandomSnippet()
      setCurrentSnippet(snippet)
    } finally {
      setIsGeneratingSnippet(false)
    }
  }

  // Handle custom snippet generation
  const handleCustomSnippetGenerated = (snippet: any) => {
    setGeneratedSnippets((prev) => [...prev, snippet])
    setCurrentSnippet(snippet.code)
    setCurrentSnippetInfo(snippet)
  }

  // Save result to API
  const saveResultToAPI = async (resultData: any) => {
    if (!isSignedIn) return

    setIsSavingResult(true)
    try {
      const response = await fetch("/api/history", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          language,
          difficulty,
          wpm: resultData.wpm,
          cpm: resultData.cpm,
          accuracy: resultData.accuracy,
          snippetId: currentSnippetInfo?.id || `snippet-${Date.now()}`,
        }),
      })

      const data = await response.json()
      if (!data.success) {
        throw new Error(data.message)
      }
    } catch (error) {
      console.error("Failed to save result to API:", error)
      toast({
        title: "Failed to save result",
        description: "Result saved locally but not synced to cloud",
        variant: "destructive",
      })
    } finally {
      setIsSavingResult(false)
    }
  }

  // Start a new test
  const startTest = () => {
    const snippet = getRandomSnippet()
    setCurrentSnippet(snippet)
    setTypedText("")
    setIsStarted(true)
    setIsFinished(false)
    setStartTime(Date.now())
    setEndTime(null)
    setProgress(0)
    setResults(null)

    // Focus the input field
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus()
      }
    }, 0)
  }

  // Reset the test
  const resetTest = () => {
    setIsStarted(false)
    setIsFinished(false)
    setTypedText("")
    setStartTime(null)
    setEndTime(null)
    setProgress(0)
    setResults(null)
    setCurrentSnippetInfo(null)
  }

  // Handle typing in the textarea
  const handleTyping = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!isStarted || isFinished) return

    const newText = e.target.value
    setTypedText(newText)

    // Calculate progress
    const newProgress = Math.min(100, Math.floor((newText.length / currentSnippet.length) * 100))
    setProgress(newProgress)

    // Check if test is complete
    if (newText.length >= currentSnippet.length) {
      finishTest(newText)
    }
  }

  // Calculate results when test is finished
  const finishTest = async (finalText: string) => {
    const endTimeValue = Date.now()
    setEndTime(endTimeValue)
    setIsFinished(true)

    // Calculate time taken in seconds
    const timeTaken = (endTimeValue - (startTime || 0)) / 1000

    // Calculate errors
    let errors = 0
    for (let i = 0; i < finalText.length; i++) {
      if (i >= currentSnippet.length || finalText[i] !== currentSnippet[i]) {
        errors++
      }
    }

    // Calculate accuracy
    const accuracy = Math.max(0, Math.round(((finalText.length - errors) / finalText.length) * 100))

    // Calculate WPM (words per minute)
    // Assuming average word length of 5 characters
    const words = finalText.length / 5
    const wpm = Math.round(words / (timeTaken / 60))

    // Calculate CPM (characters per minute)
    const cpm = Math.round(finalText.length / (timeTaken / 60))

    const newResults = {
      wpm,
      cpm,
      accuracy,
      time: Math.round(timeTaken),
      errors,
    }

    setResults(newResults)

    // Save to history
    const historyEntry = {
      language,
      difficulty,
      wpm,
      accuracy,
      date: new Date().toISOString(),
    }

    const updatedHistory = [historyEntry, ...history].slice(0, 10) // Keep only last 10 entries
    setHistory(updatedHistory)
    localStorage.setItem("codeTypeHistory", JSON.stringify(updatedHistory))

    // Save to API if signed in
    await saveResultToAPI(newResults)

    toast({
      title: "Test completed!",
      description: `WPM: ${wpm}, Accuracy: ${accuracy}%${isSignedIn ? " (Saved to cloud)" : ""}`,
    })
  }

  return (
    <div className="w-full max-w-4xl">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="test" className="flex items-center gap-2">
            <Keyboard className="h-4 w-4" />
            <span>Test</span>
          </TabsTrigger>
          <TabsTrigger value="results" className="flex items-center gap-2">
            <BarChart2 className="h-4 w-4" />
            <span>Results</span>
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <Timer className="h-4 w-4" />
            <span>History</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="test" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col gap-6">
                {!isStarted ? (
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="flex-1">
                        <label className="text-sm font-medium mb-2 block">Language</label>
                        <Select value={language} onValueChange={setLanguage}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select language" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="javascript">JavaScript</SelectItem>
                            <SelectItem value="python">Python</SelectItem>
                            <SelectItem value="java">Java</SelectItem>
                            <SelectItem value="csharp">C#</SelectItem>
                            <SelectItem value="typescript">TypeScript</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex-1">
                        <label className="text-sm font-medium mb-2 block">Difficulty</label>
                        <Select value={difficulty} onValueChange={setDifficulty}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select difficulty" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="easy">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                Easy - Simple syntax and basic concepts
                              </div>
                            </SelectItem>
                            <SelectItem value="medium">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                                Medium - Moderate complexity with logic
                              </div>
                            </SelectItem>
                            <SelectItem value="hard">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                                Hard - Complex algorithms and patterns
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button onClick={startTest} className="flex-1">
                        Start Typing Test
                      </Button>
                      <Button
                        onClick={generateNewSnippet}
                        variant="outline"
                        disabled={isGeneratingSnippet}
                        className="flex items-center gap-2 bg-transparent"
                      >
                        {isGeneratingSnippet ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Sparkles className="h-4 w-4" />
                        )}
                        {isGeneratingSnippet ? "Generating..." : "AI Snippet"}
                      </Button>
                    </div>

                    <div className="border-t pt-4">
                      <CustomSnippetGenerator onSnippetGenerated={handleCustomSnippetGenerated} />
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="text-sm font-medium">
                          {language} - {difficulty}
                        </span>
                        {currentSnippetInfo?.customPrompt && (
                          <div className="text-xs text-muted-foreground mt-1">
                            Custom: {currentSnippetInfo.customPrompt}
                          </div>
                        )}
                        {isSavingResult && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                            <Save className="h-3 w-3" />
                            Saving...
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={resetTest}
                          className="flex items-center gap-1 bg-transparent"
                        >
                          <RefreshCw className="h-4 w-4" />
                          Reset
                        </Button>
                      </div>
                    </div>

                    <Progress value={progress} className="h-2" />

                    <CodeDisplay code={currentSnippet} typedText={typedText} language={language} />

                    <textarea
                      ref={inputRef}
                      value={typedText}
                      onChange={handleTyping}
                      className={cn(
                        "w-full h-32 p-4 border rounded-md font-mono text-sm resize-none",
                        "focus:outline-none focus:ring-2 focus:ring-primary",
                        "bg-background border-input",
                      )}
                      placeholder="Start typing here..."
                      disabled={isFinished}
                      autoComplete="off"
                      autoCorrect="off"
                      spellCheck="false"
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results" className="mt-4">
          <ResultsDisplay results={results} language={language} difficulty={difficulty} onRetry={startTest} />
        </TabsContent>

        <TabsContent value="history" className="mt-4">
          <HistoryDisplay history={history} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
