'use client'

import React, { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'
import { Sun, Moon } from 'lucide-react'

export default function Header() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])
  return (
    <header className="w-full flex items-center justify-between px-6 py-3 border-b bg-background">
      <h1 className="text-2xl font-bold">CodeType</h1>
      {mounted && (
        <button
          aria-label="Toggle Dark Mode"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-2 rounded-full border border-input bg-background hover:bg-muted transition-colors"
          type="button"
        >
          {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>
      )}
    </header>
  )
} 