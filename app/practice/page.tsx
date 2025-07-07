"use client"

import { useUser } from "@clerk/nextjs"
import { UserButton } from "@clerk/nextjs"
import CodeTypingTest from "@/components/code-typing-test"
import { User } from "lucide-react"

export const dynamic = 'force-dynamic'

export default function PracticePage() {
  return (
    <main className="flex min-h-screen flex-col items-center p-4 md:p-24">
      <div className="z-10 w-full max-w-5xl flex flex-col">
        <div className="mb-8">
          <h1 className="text-4xl font-bold">CodeType</h1>
          <p className="text-xl text-muted-foreground">Improve your coding speed and accuracy</p>
        </div>
        <CodeTypingTest />
      </div>
    </main>
  )
}
