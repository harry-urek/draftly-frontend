'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'

export default function ProcessingPage() {
  const router = useRouter()
  const [status, setStatus] = useState<string>('PROFILE_GENERATING')
  const [dots, setDots] = useState('')

  useEffect(() => {
    // Animated dots
    const dotsInterval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? '' : prev + '.'))
    }, 500)

    // Poll for status
    const statusInterval = setInterval(async () => {
      try {
        const response = await api.get(api.onboarding.status())
        const newStatus = response.status

        setStatus(newStatus)

        if (newStatus === 'ACTIVE') {
          clearInterval(statusInterval)
          clearInterval(dotsInterval)
          router.push('/inbox')
        }
      } catch (error) {
        console.error('Failed to check status:', error)
      }
    }, 3000)

    return () => {
      clearInterval(dotsInterval)
      clearInterval(statusInterval)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-2xl text-center">
        <div className="mb-8">
          <div className="relative mx-auto w-24 h-24 mb-6">
            <div className="absolute inset-0 border-4 border-blue-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
          </div>
          <h1 className="text-3xl font-bold mb-4">Creating Your AI Writing Profile{dots}</h1>
          <p className="text-gray-600 mb-4">
            Our AI is analyzing your responses and learning your unique writing style. This usually takes 30-60 seconds.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
            <p className="text-sm text-blue-900">
              💡 <strong>What&apos;s happening:</strong> We&apos;re using advanced language models to understand your tone,
              formality, common phrases, and communication patterns. This profile will help Draftly write emails that
              sound exactly like you.
            </p>
          </div>
        </div>

        <div className="space-y-3 text-left max-w-md mx-auto">
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div>
              <p className="font-medium">Questionnaire responses saved</p>
              <p className="text-sm text-gray-500">Your answers are securely stored</p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div>
              <p className="font-medium">Recent emails analyzed</p>
              <p className="text-sm text-gray-500">Fetched your last 10 sent emails for context</p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5 animate-pulse">
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
            <div>
              <p className="font-medium">Generating AI profile</p>
              <p className="text-sm text-gray-500">
                {status === 'PROFILE_GENERATING'
                  ? 'AI is analyzing your unique writing style...'
                  : 'Almost done...'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
