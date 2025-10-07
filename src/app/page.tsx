'use client'

import { useAppStore } from '@/lib/store'
import { AuthButton } from '@/components/AuthButton'
import { Mail } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function Home() {
  const { user } = useAppStore()
  const router = useRouter()

  useEffect(() => {
    if (user) {
      router.push('/inbox')
    }
  }, [user, router])

  if (user) {
    return null // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Mail className="h-8 w-8 text-primary" />
              <span className="ml-3 text-2xl font-bold">Draftly</span>
            </div>
            <AuthButton />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-4xl tracking-tight font-extrabold sm:text-5xl md:text-6xl">
            <span className="block">AI-Powered Email</span>
            <span className="block text-primary">Reply Assistant</span>
          </h1>
          <p className="mt-4 max-w-md mx-auto text-lg text-muted-foreground sm:text-xl md:mt-6 md:max-w-3xl">
            Draftly learns your writing style and generates professional email replies.
            Review, approve, and send with confidence.
          </p>
          <div className="mt-8 max-w-md mx-auto sm:flex sm:justify-center">
            <AuthButton />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-20">
        <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center text-muted-foreground">
            <Mail className="h-6 w-6 text-primary" />
            <span className="ml-2 text-lg font-semibold">Draftly</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
