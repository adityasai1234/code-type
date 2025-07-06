"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { SignInButton, SignUpButton, UserButton, useUser } from "@clerk/nextjs"

export default function Home() {
  const { isLoaded, isSignedIn } = useUser()

  if (!isLoaded) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-24">
        <div className="z-10 w-full max-w-5xl flex flex-col items-center justify-center">
          <h1 className="text-4xl font-bold mb-2 text-center">CodeType</h1>
          <p className="text-xl text-muted-foreground mb-8 text-center">Improve your coding speed and accuracy</p>
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-24">
      <div className="z-10 w-full max-w-5xl flex flex-col items-center justify-center">
        <h1 className="text-4xl font-bold mb-2 text-center">CodeType</h1>
        <p className="text-xl text-muted-foreground mb-8 text-center">Improve your coding speed and accuracy</p>

        {!isSignedIn ? (
          <>
            <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
              <SignInButton mode="modal">
                <Button className="flex-1">Sign In</Button>
              </SignInButton>
              <SignUpButton mode="modal">
                <Button variant="outline" className="flex-1 bg-transparent">
                  Sign Up
                </Button>
              </SignUpButton>
            </div>

            <div className="mt-8">
              <Button asChild variant="ghost">
                <Link href="/practice">Try without an account</Link>
              </Button>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <UserButton afterSignOutUrl="/" />
            <Button asChild>
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
          </div>
        )}
      </div>
    </main>
  )
}
