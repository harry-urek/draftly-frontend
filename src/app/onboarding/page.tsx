'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { QuestionnaireForm } from '@/components/QuestionnaireForm'

export default function OnboardingPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [onboardingStatus, setOnboardingStatus] = useState<string | null>(null)

  useEffect(() => {
    checkOnboardingStatus()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const checkOnboardingStatus = async () => {
    try {
      const response = await api.get(api.onboarding.status())
      const status = response.status

      setOnboardingStatus(status)

      // Redirect based on status
      if (status === 'ACTIVE') {
        router.push('/inbox')
      } else if (status === 'NOT_STARTED') {
        // User hasn't connected Gmail yet
        router.push('/permissions')
      } else if (status === 'PROFILE_GENERATING') {
        router.push('/onboarding/processing')
      }

      setIsLoading(false)
    } catch (error) {
      console.error('Failed to check onboarding status:', error)
      setIsLoading(false)
    }
  }

  const handleStart = async () => {
    try {
      await api.post(api.onboarding.start())
      window.location.reload()
    } catch (error) {
      console.error('Failed to start onboarding:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (onboardingStatus === 'GMAIL_CONNECTED') {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-2xl text-center">
          <h1 className="text-3xl font-bold mb-4">Welcome to Draftly! 🎉</h1>
          <p className="text-gray-600 mb-6">
            Gmail connected successfully. Now let&apos;s teach your AI assistant to write just like you.
          </p>
          <p className="text-sm text-gray-500 mb-8">
            This questionnaire will take about 5-10 minutes. Your responses will be used to create a personalized
            writing style profile.
          </p>
          <button
            onClick={handleStart}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            Start Questionnaire
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h1 className="text-3xl font-bold mb-2">Discover Your AI Writing Style</h1>
          <p className="text-gray-600 mb-8">
            Help us understand your unique communication style. While you answer these questions, we&apos;re analyzing
            your recent emails in the background.
          </p>
          <QuestionnaireForm />
        </div>
      </div>
    </div>
  )
}
