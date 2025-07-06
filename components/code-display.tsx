"use client"

import { useEffect, useRef } from "react"
import { cn } from "@/lib/utils"
import Prism from "prismjs"
import "prismjs/themes/prism.css"
import "prismjs/components/prism-javascript"
import "prismjs/components/prism-typescript"
import "prismjs/components/prism-python"
import "prismjs/components/prism-java"
import "prismjs/components/prism-csharp"

interface CodeDisplayProps {
  code: string
  typedText: string
  language: string
}

export default function CodeDisplay({ code, typedText, language }: CodeDisplayProps) {
  const codeRef = useRef<HTMLDivElement>(null)

  // Highlight code with Prism.js
  useEffect(() => {
    if (codeRef.current) {
      Prism.highlightElement(codeRef.current)
    }
  }, [code, language])

  // Prevent copy, cut, and context menu
  const handleCopy = (e: React.ClipboardEvent) => {
    e.preventDefault()
    return false
  }

  const handleCut = (e: React.ClipboardEvent) => {
    e.preventDefault()
    return false
  }

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    return false
  }

  // Create an array of character status (correct, incorrect, or not typed yet)
  const characters = code.split("").map((char, index) => {
    if (index >= typedText.length) {
      return { char, status: "not-typed" }
    } else if (char === typedText[index]) {
      return { char, status: "correct" }
    } else {
      return { char, status: "incorrect" }
    }
  })

  return (
    <div className="relative">
      {/* Small indicator that text is not selectable */}
      <div className="absolute top-2 right-2 z-10">
        <div className="bg-muted/80 text-muted-foreground text-xs px-2 py-1 rounded-md no-select">
          Type to practice
        </div>
      </div>
      
      <pre 
        className="rounded-md p-4 bg-muted overflow-auto max-h-[400px] no-select no-copy"
        onCopy={handleCopy}
        onCut={handleCut}
        onContextMenu={handleContextMenu}
      >
        <code 
          ref={codeRef} 
          className={`language-${language} font-mono text-sm no-select no-copy`}
        >
          {characters.map((char, index) => (
            <span
              key={index}
              className={cn(
                char.status === "correct" && "bg-green-500/20",
                char.status === "incorrect" && "bg-red-500/20 border-b-2 border-red-500",
                char.status === "not-typed" && "",
                "relative no-select no-copy",
              )}
            >
              {char.char}
            </span>
          ))}
        </code>
      </pre>
    </div>
  )
}
