'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { QuestionnaireForm } from '@/components/QuestionnaireForm'

interface QuestionnaireData {
    writingTone: string[]
    formalityLevel: string
    emailLength: string
    greetingStyle: string
    urgentRequestResponse: string
    meetingScheduleResponse: string
    feedbackResponse: string
    commonPhrases: string[]
    avoidPhrases: string[]
    signOffStyle: string
    emojiUsage: string
    punctuationStyle: string
}

export default function OnboardingPage() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [onboardingStatus, setOnboardingStatus] = useState<string | null>(null)
    const [authChecked, setAuthChecked] = useState(false)

    useEffect(() => {
        // Wait for Firebase auth to initialize
        const checkAuth = async () => {
            const { auth } = await import('@/lib/firebase')

            // Wait for auth state to be determined
            const unsubscribe = auth.onAuthStateChanged((user) => {
                if (user) {
                    setAuthChecked(true)
                    checkOnboardingStatus()
                } else {
                    // Not authenticated, redirect to login
                    router.push('/')
                }
            })

            return unsubscribe
        }

        checkAuth()
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
            } else if (status === 'GMAIL_CONNECTED') {
                // Ensure background email fetch begins when we hit this page
                try {
                    await api.post(api.onboarding.start())
                } catch {
                    // Non-blocking; ignore errors here
                }
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

    const handleSubmitQuestionnaire = async (data: QuestionnaireData) => {
        setIsSubmitting(true)
        try {
            // Transform frontend data structure to match backend expectations
            const backendPayload = {
                userId: '', // Will be filled by backend from auth token
                submissionTimestamp: new Date().toISOString(),
                stylePreferences: {
                    greeting: data.greetingStyle,
                    formalityScale: mapFormalityToScale(data.formalityLevel),
                    requestStyle: data.emailLength,
                    emojiFrequency: data.emojiUsage,
                },
                scenarioResponses: [
                    {
                        scenarioId: 'urgent_request',
                        responseText: data.urgentRequestResponse,
                    },
                    {
                        scenarioId: 'meeting_schedule',
                        responseText: data.meetingScheduleResponse,
                    },
                    {
                        scenarioId: 'feedback',
                        responseText: data.feedbackResponse,
                    },
                ],
                stylisticNuances: {
                    commonSignOffs: [data.signOffStyle],
                    commonPhrases: data.commonPhrases,
                    petPeeve: data.avoidPhrases.join(', '),
                    writingTone: data.writingTone,
                    punctuationStyle: data.punctuationStyle,
                },
            }

            await api.post(api.onboarding.submit(), backendPayload)
            router.push('/onboarding/processing')
        } catch (error) {
            console.error('Failed to submit questionnaire:', error)
            alert('Failed to submit questionnaire. Please try again.')
            setIsSubmitting(false)
        }
    }

    // Helper function to map formality level to numeric scale
    const mapFormalityToScale = (level: string): number => {
        const mapping: Record<string, number> = {
            'very-formal': 5,
            'formal': 4,
            'neutral': 3,
            'casual': 2,
        }
        return mapping[level] || 3
    }

    if (isLoading || !authChecked) {
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
            <div className="max-w-4xl mx-auto px-4">
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <h1 className="text-3xl font-bold mb-2">Discover Your AI Writing Style</h1>
                    <p className="text-gray-600 mb-8">
                        Help us understand your unique communication style. While you answer these questions, we&apos;re analyzing
                        your recent emails in the background.
                    </p>
                    <QuestionnaireForm onSubmit={handleSubmitQuestionnaire} isSubmitting={isSubmitting} />
                </div>
            </div>
        </div>
    )
}
