'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

interface QuestionnaireData {
    // Part 1: Style Preferences
    writingTone: string[]
    formalityLevel: string
    emailLength: string
    greetingStyle: string

    // Part 2: Scenario Responses
    urgentRequestResponse: string
    meetingScheduleResponse: string
    feedbackResponse: string

    // Part 3: Personal Nuances
    commonPhrases: string[]
    avoidPhrases: string[]
    signOffStyle: string
    emojiUsage: string
    punctuationStyle: string
}

interface QuestionnaireFormProps {
    onSubmit: (data: QuestionnaireData) => Promise<void>
    isSubmitting: boolean
}

export function QuestionnaireForm({ onSubmit, isSubmitting }: QuestionnaireFormProps) {
    const [currentPart, setCurrentPart] = useState(1)
    const [formData, setFormData] = useState<QuestionnaireData>({
        writingTone: [],
        formalityLevel: '',
        emailLength: '',
        greetingStyle: '',
        urgentRequestResponse: '',
        meetingScheduleResponse: '',
        feedbackResponse: '',
        commonPhrases: [],
        avoidPhrases: [],
        signOffStyle: '',
        emojiUsage: '',
        punctuationStyle: '',
    })

    const handleMultiSelect = (field: keyof QuestionnaireData, value: string) => {
        const currentValues = formData[field] as string[]
        const newValues = currentValues.includes(value)
            ? currentValues.filter(v => v !== value)
            : [...currentValues, value]

        setFormData({ ...formData, [field]: newValues })
    }

    const handleTextChange = (field: keyof QuestionnaireData, value: string) => {
        setFormData({ ...formData, [field]: value })
    }

    const handleArrayInput = (field: keyof QuestionnaireData, value: string) => {
        const items = value.split(',').map(item => item.trim()).filter(item => item)
        setFormData({ ...formData, [field]: items })
    }

    const canProceed = () => {
        if (currentPart === 1) {
            return formData.writingTone.length > 0 && formData.formalityLevel && formData.emailLength && formData.greetingStyle
        }
        if (currentPart === 2) {
            return formData.urgentRequestResponse && formData.meetingScheduleResponse && formData.feedbackResponse
        }
        if (currentPart === 3) {
            return formData.signOffStyle && formData.emojiUsage && formData.punctuationStyle
        }
        return false
    }

    const handleSubmit = async () => {
        if (currentPart < 3) {
            setCurrentPart(currentPart + 1)
        } else {
            await onSubmit(formData)
        }
    }

    return (
        <div className="max-w-3xl mx-auto p-6">
            {/* Progress Indicator */}
            <div className="mb-8">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Part {currentPart} of 3</span>
                    <span className="text-sm text-gray-500">{Math.round((currentPart / 3) * 100)}% Complete</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(currentPart / 3) * 100}%` }}
                    />
                </div>
            </div>

            {/* Part 1: Style Preferences */}
            {currentPart === 1 && (
                <div className="space-y-6">
                    <h2 className="text-2xl font-bold mb-4">Tell us about your writing style</h2>

                    {/* Writing Tone */}
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            What tone(s) do you typically use? (Select all that apply)
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            {['Professional', 'Friendly', 'Direct', 'Warm', 'Casual', 'Formal'].map(tone => (
                                <button
                                    key={tone}
                                    type="button"
                                    onClick={() => handleMultiSelect('writingTone', tone)}
                                    className={`p-3 border-2 rounded-lg text-left transition-all ${formData.writingTone.includes(tone)
                                            ? 'border-blue-600 bg-blue-50'
                                            : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                >
                                    {tone}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Formality Level */}
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            How formal are your emails usually?
                        </label>
                        <div className="space-y-2">
                            {[
                                { value: 'very-formal', label: 'Very Formal (e.g., "Dear Sir/Madam")' },
                                { value: 'formal', label: 'Formal (e.g., "Hello [Name]")' },
                                { value: 'neutral', label: 'Neutral (e.g., "Hi [Name]")' },
                                { value: 'casual', label: 'Casual (e.g., "Hey [Name]")' },
                            ].map(option => (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => handleTextChange('formalityLevel', option.value)}
                                    className={`w-full p-3 border-2 rounded-lg text-left transition-all ${formData.formalityLevel === option.value
                                            ? 'border-blue-600 bg-blue-50'
                                            : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Email Length */}
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            How long are your emails typically?
                        </label>
                        <div className="space-y-2">
                            {[
                                { value: 'brief', label: 'Brief (2-3 sentences)' },
                                { value: 'moderate', label: 'Moderate (1 paragraph)' },
                                { value: 'detailed', label: 'Detailed (2-3 paragraphs)' },
                                { value: 'comprehensive', label: 'Comprehensive (Multiple paragraphs)' },
                            ].map(option => (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => handleTextChange('emailLength', option.value)}
                                    className={`w-full p-3 border-2 rounded-lg text-left transition-all ${formData.emailLength === option.value
                                            ? 'border-blue-600 bg-blue-50'
                                            : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Greeting Style */}
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            How do you usually greet recipients?
                        </label>
                        <div className="space-y-2">
                            {[
                                { value: 'formal', label: 'Formal (Dear [Name])' },
                                { value: 'standard', label: 'Standard (Hello [Name])' },
                                { value: 'friendly', label: 'Friendly (Hi [Name])' },
                                { value: 'casual', label: 'Casual (Hey [Name])' },
                                { value: 'direct', label: 'Direct (Jump right into content)' },
                            ].map(option => (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => handleTextChange('greetingStyle', option.value)}
                                    className={`w-full p-3 border-2 rounded-lg text-left transition-all ${formData.greetingStyle === option.value
                                            ? 'border-blue-600 bg-blue-50'
                                            : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Part 2: Scenario Responses */}
            {currentPart === 2 && (
                <div className="space-y-6">
                    <h2 className="text-2xl font-bold mb-4">How would you respond to these scenarios?</h2>
                    <p className="text-gray-600 mb-6">
                        Write how you would typically respond to help us understand your communication style.
                    </p>

                    {/* Urgent Request */}
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Scenario 1: A colleague asks for an urgent document
                        </label>
                        <p className="text-sm text-gray-600 mb-2">
                            &quot;Can you send me the Q4 report by end of day? It&apos;s urgent for tomorrow&apos;s meeting.&quot;
                        </p>
                        <textarea
                            value={formData.urgentRequestResponse}
                            onChange={(e) => handleTextChange('urgentRequestResponse', e.target.value)}
                            placeholder="Write your typical response..."
                            className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-600 focus:outline-none min-h-[120px]"
                        />
                    </div>

                    {/* Meeting Schedule */}
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Scenario 2: Scheduling a meeting with multiple people
                        </label>
                        <p className="text-sm text-gray-600 mb-2">
                            You need to coordinate a project kickoff meeting with 5 team members.
                        </p>
                        <textarea
                            value={formData.meetingScheduleResponse}
                            onChange={(e) => handleTextChange('meetingScheduleResponse', e.target.value)}
                            placeholder="Write your typical response..."
                            className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-600 focus:outline-none min-h-[120px]"
                        />
                    </div>

                    {/* Feedback Response */}
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Scenario 3: Providing feedback on a colleague&apos;s work
                        </label>
                        <p className="text-sm text-gray-600 mb-2">
                            A team member submitted good work but there are a few areas that need improvement.
                        </p>
                        <textarea
                            value={formData.feedbackResponse}
                            onChange={(e) => handleTextChange('feedbackResponse', e.target.value)}
                            placeholder="Write your typical response..."
                            className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-600 focus:outline-none min-h-[120px]"
                        />
                    </div>
                </div>
            )}

            {/* Part 3: Personal Nuances */}
            {currentPart === 3 && (
                <div className="space-y-6">
                    <h2 className="text-2xl font-bold mb-4">Final touches: Your personal style</h2>

                    {/* Common Phrases */}
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Phrases or words you commonly use (comma-separated)
                        </label>
                        <input
                            type="text"
                            onChange={(e) => handleArrayInput('commonPhrases', e.target.value)}
                            placeholder="e.g., Thanks so much, I appreciate, Looking forward"
                            className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-600 focus:outline-none"
                        />
                    </div>

                    {/* Avoid Phrases */}
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Phrases or words you avoid (comma-separated)
                        </label>
                        <input
                            type="text"
                            onChange={(e) => handleArrayInput('avoidPhrases', e.target.value)}
                            placeholder="e.g., ASAP, Touch base, Circle back"
                            className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-600 focus:outline-none"
                        />
                    </div>

                    {/* Sign-off Style */}
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            How do you typically sign off?
                        </label>
                        <div className="space-y-2">
                            {[
                                { value: 'best', label: 'Best / Best regards' },
                                { value: 'thanks', label: 'Thanks / Thank you' },
                                { value: 'sincerely', label: 'Sincerely' },
                                { value: 'cheers', label: 'Cheers' },
                                { value: 'none', label: 'No sign-off (just name)' },
                            ].map(option => (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => handleTextChange('signOffStyle', option.value)}
                                    className={`w-full p-3 border-2 rounded-lg text-left transition-all ${formData.signOffStyle === option.value
                                            ? 'border-blue-600 bg-blue-50'
                                            : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Emoji Usage */}
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Do you use emojis in professional emails?
                        </label>
                        <div className="space-y-2">
                            {[
                                { value: 'never', label: 'Never' },
                                { value: 'rarely', label: 'Rarely (only with close colleagues)' },
                                { value: 'sometimes', label: 'Sometimes (when appropriate)' },
                                { value: 'often', label: 'Often' },
                            ].map(option => (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => handleTextChange('emojiUsage', option.value)}
                                    className={`w-full p-3 border-2 rounded-lg text-left transition-all ${formData.emojiUsage === option.value
                                            ? 'border-blue-600 bg-blue-50'
                                            : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Punctuation Style */}
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Your punctuation style
                        </label>
                        <div className="space-y-2">
                            {[
                                { value: 'formal', label: 'Formal (Full sentences, proper punctuation)' },
                                { value: 'standard', label: 'Standard (Mostly complete sentences)' },
                                { value: 'casual', label: 'Casual (Sometimes skip periods, use dashes)' },
                                { value: 'minimal', label: 'Minimal (Brief, bullet points)' },
                            ].map(option => (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => handleTextChange('punctuationStyle', option.value)}
                                    className={`w-full p-3 border-2 rounded-lg text-left transition-all ${formData.punctuationStyle === option.value
                                            ? 'border-blue-600 bg-blue-50'
                                            : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8 pt-6 border-t">
                {currentPart > 1 && (
                    <button
                        type="button"
                        onClick={() => setCurrentPart(currentPart - 1)}
                        disabled={isSubmitting}
                        className="px-4 py-2 border-2 border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                    >
                        Back
                    </button>
                )}
                <div className={currentPart === 1 ? 'ml-auto' : ''}>
                    <Button
                        type="button"
                        onClick={handleSubmit}
                        disabled={!canProceed() || isSubmitting}
                    >
                        {isSubmitting ? 'Submitting...' : currentPart === 3 ? 'Complete Setup' : 'Next'}
                    </Button>
                </div>
            </div>
        </div>
    )
}
