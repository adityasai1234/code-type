"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Sparkles, Loader2, Code, Lightbulb } from "lucide-react"

interface CustomSnippetGeneratorProps {
  onSnippetGenerated: (snippet: any) => void
}

export default function CustomSnippetGenerator({ onSnippetGenerated }: CustomSnippetGeneratorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [prompt, setPrompt] = useState("")
  const [language, setLanguage] = useState("javascript")
  const [difficulty, setDifficulty] = useState("medium")
  const { toast } = useToast()

  const examplePrompts = [
    "Create a function that sorts an array of numbers",
    "Write a class for managing a shopping cart",
    "Implement a binary search algorithm",
    "Create a function to validate email addresses",
    "Write code to fetch data from an API",
    "Implement a simple calculator function",
    "Create a function to reverse a string",
    "Write code for a basic todo list manager",
  ]

  const generateCustomSnippet = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Prompt required",
        description: "Please enter a description of what you want to practice",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)
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
          customPrompt: prompt,
        }),
      })

      const data = await response.json()

      if (data.success && data.snippets.length > 0) {
        const newSnippet = data.snippets[0]
        onSnippetGenerated(newSnippet)
        setIsOpen(false)
        setPrompt("")

        toast({
          title: "Custom snippet generated!",
          description: newSnippet.description || "Your custom code snippet is ready for practice",
        })
      } else {
        throw new Error(data.message || "Failed to generate snippet")
      }
    } catch (error) {
      toast({
        title: "Failed to generate snippet",
        description: error instanceof Error ? error.message : "Please try again with a different prompt",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const useExamplePrompt = (examplePrompt: string) => {
    setPrompt(examplePrompt)
  }

  const handleExamplePromptClick = (example: string) => {
    useExamplePrompt(example)
  }

  if (!isOpen) {
    return (
      <Button onClick={() => setIsOpen(true)} variant="outline" className="flex items-center gap-2 bg-transparent">
        <Code className="h-4 w-4" />
        Custom Prompt
      </Button>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          Generate Custom Code Snippet
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="language">Programming Language</Label>
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
                <SelectItem value="cpp">C++</SelectItem>
                <SelectItem value="go">Go</SelectItem>
                <SelectItem value="rust">Rust</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="difficulty">Difficulty Level</Label>
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

        <div>
          <Label htmlFor="prompt">Describe what you want to practice</Label>
          <Textarea
            id="prompt"
            placeholder="e.g., Create a function that finds the maximum value in an array, Write a class for a simple bank account, Implement a recursive factorial function..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="min-h-[100px]"
          />
        </div>

        <div>
          <Label className="flex items-center gap-2 mb-2">
            <Lightbulb className="h-4 w-4" />
            Example Prompts
          </Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {examplePrompts.map((example, index) => (
              <Button
                key={index}
                variant="ghost"
                size="sm"
                className="text-left justify-start h-auto p-2 text-xs"
                onClick={() => handleExamplePromptClick(example)}
              >
                {example}
              </Button>
            ))}
          </div>
        </div>

        <div className="flex gap-2 pt-4">
          <Button onClick={generateCustomSnippet} disabled={isGenerating || !prompt.trim()} className="flex-1">
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate Snippet
              </>
            )}
          </Button>
          <Button variant="outline" onClick={() => setIsOpen(false)} className="bg-transparent">
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
