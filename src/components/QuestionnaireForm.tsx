'use client'

import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'

type Profession = 'Software Developer' | 'HR Professional' | 'Legal Counsel' | 'Finance Analyst' | 'Marketing Professional'

interface FoundationalAnswers {
    goal: 'Task-Oriented' | 'Person-Oriented' | 'Analytical' | ''
    formality: 1 | 2 | 3 | 4 | 5 | 0
    fragmentChoice: 'A' | 'B' | 'C' | ''
    // Only for Marketing Professional
    marketingVoice?: 'Authoritative' | 'Friendly' | 'Playful' | 'Minimalist' | ''
    greetingPreference?: 'Hi {FirstName}' | 'Hello {FirstName}' | 'Hey {FirstName}' | 'Dear {Name}' | 'No greeting' | ''
    // New writing style preference fields
    writingStylePreferences?: Array<'Concise' | 'Warm' | 'Direct' | 'Formal' | 'Diplomatic' | 'Detailed' | 'Action-oriented' | 'Storytelling' | 'Data-driven'>
    sentenceComplexity?: 'Simple' | 'Moderate' | 'Complex' | ''
    paragraphLength?: 'Short (1-2 sentences)' | 'Medium (3-4 sentences)' | 'Long (5+ sentences)' | ''
    closingPreference?: 'Best' | 'Regards' | 'Thanks' | 'Sincerely' | 'Cheers' | 'No sign-off' | ''
    emojiUsage?: 'Never' | 'Rare' | 'Occasional' | 'Frequent' | ''
    prefersBulletPoints?: 'Yes' | 'No' | ''
}

interface Scenario {
    id: string
    title: string
    description: string
    testsFor: string
}

interface QuestionnairePayload {
    protocolVersion: 'v2'
    profession: Profession
    foundational: FoundationalAnswers
    scenarios: Array<{ id: string; prompt: string; response: string }>
}

interface QuestionnaireFormProps {
    onSubmit: (data: QuestionnairePayload) => Promise<void>
    isSubmitting: boolean
}

export function QuestionnaireForm({ onSubmit, isSubmitting }: QuestionnaireFormProps) {
    const [step, setStep] = useState<1 | 2 | 3>(1)
    const [profession, setProfession] = useState<Profession>('Software Developer')
    const [foundational, setFoundational] = useState<FoundationalAnswers>({
        goal: '',
        formality: 0,
        fragmentChoice: '',
        greetingPreference: '',
        writingStylePreferences: [],
        sentenceComplexity: '',
        paragraphLength: '',
        closingPreference: '',
        emojiUsage: '',
        prefersBulletPoints: ''
    })
    const [responses, setResponses] = useState<Record<string, string>>({})

    const scenarios = useMemo<Scenario[]>(() => {
        if (profession === 'Software Developer') {
            return [
                {
                    id: 'dev_vague_bug',
                    title: 'Scenario 1: The Vague Bug Report',
                    description: 'PM: "Hey, the new feature is acting weird on the staging server. Can you look into it?"',
                    testsFor: 'Handling ambiguity, technical clarity, problem-solving approach.'
                },
                {
                    id: 'dev_code_review',
                    title: 'Scenario 2: The Code Review Disagreement',
                    description: 'A junior suggests a significant architectural change you believe is inefficient. Reply in the code review.',
                    testsFor: 'Tone in debate, mentorship style, directness vs. diplomacy.'
                },
                {
                    id: 'dev_prod_outage',
                    title: 'Scenario 3: The Urgent Production Outage',
                    description: 'Lead: "I see the alert. What\'s the status?" It\'s 9 PM and a critical failure in production occurred.',
                    testsFor: 'Communication under pressure, conciseness, conveying technical status.'
                }
            ]
        }
        if (profession === 'HR Professional') {
            return [
                { id: 'hr_sensitive', title: 'Scenario 1: The Sensitive Employee Complaint', description: 'Employee: "I\'m having issues with my manager\'s communication style. It\'s creating a stressful environment for me. Can we talk?"', testsFor: 'Empathy, trust, process, confidentiality.' },
                { id: 'hr_bad_news', title: 'Scenario 2: Delivering Bad News to a Candidate', description: 'Email the candidate who reached finals that the company chose another finalist.', testsFor: 'Diplomacy, brand tone, emotion.' },
                { id: 'hr_policy', title: 'Scenario 3: Announcing a New, Unpopular Policy', description: 'Company-wide email about a return-to-office policy likely to be unpopular.', testsFor: 'Clarity, tone, anticipating concerns, formality.' }
            ]
        }
        if (profession === 'Legal Counsel') {
            return [
                { id: 'legal_vague', title: 'Scenario 1: The Vague Request for Advice', description: 'Marketing: "We\'re thinking of running a new contest on social media. Any legal issues?"', testsFor: 'Precision, ambiguity management, risk guidance.' },
                { id: 'legal_opposing', title: 'Scenario 2: The Aggressive Opposing Counsel', description: 'Opposing counsel email misinterprets facts and ends with unreasonable demand. Reply.', testsFor: 'Formality, assertiveness, professionalism, strategy.' },
                { id: 'legal_contract', title: 'Scenario 3: Clarifying a Contract for a Client', description: 'Client is confused about a clause and worried it puts them at a disadvantage. Reassure and clarify.', testsFor: 'Simplify complex terms, trust, reassurance tone.' }
            ]
        }
        if (profession === 'Marketing Professional') {
            return [
                { id: 'mkt_campaign_brief', title: 'Scenario 1: Responding to a Campaign Brief', description: 'Sales asks for a quick go-to-market blurb for a product update going live next week. Provide a concise reply with your approach and next steps.', testsFor: 'Clarity, brevity, stakeholder alignment, CTA framing.' },
                { id: 'mkt_negative_feedback', title: 'Scenario 2: Handling Negative Social Feedback', description: 'A customer posted a public complaint on social media about a recent campaign. Draft an email to the customer support lead with your proposed response and next actions.', testsFor: 'Tone control, empathy, brand safety, escalation path.' },
                { id: 'mkt_influencer_outreach', title: 'Scenario 3: Influencer Partnership Outreach', description: 'Write an outreach email to a mid-tier influencer inviting them to collaborate on a limited campaign. Include value proposition and expected deliverables.', testsFor: 'Value articulation, persuasion, brand voice consistency.' }
            ]
        }
        return [
            { id: 'fin_expense', title: 'Scenario 1: The Questionable Expense Report', description: 'Large, vague "client entertainment" expenses over policy limits. Email inquiry.', testsFor: 'Directness, fact-based, professional tone with enforcement.' },
            { id: 'fin_budget_cut', title: 'Scenario 2: Explaining a Budget Cut', description: 'Inform a department head their budget is reduced by 15% and ask for revised budget.', testsFor: 'Data-backed explanation, clarity, next steps.' },
            { id: 'fin_urgent', title: 'Scenario 3: Urgent Data Request from Leadership', description: 'Senior exec: "I need the latest revenue forecast for the board meeting tomorrow morning. ASAP." Data is ready.', testsFor: 'Efficiency, hierarchy responsiveness, data focus.' }
        ]
    }, [profession])

    const marketingExtraOk = profession !== 'Marketing Professional' || (foundational.marketingVoice ?? '') !== ''
    const greetingOk = (foundational.greetingPreference ?? '') !== ''
    const stylePrefsOk = (foundational.writingStylePreferences ?? []).length > 0
    const canContinueFoundational = foundational.goal !== '' && foundational.formality !== 0 && foundational.fragmentChoice !== '' && greetingOk && stylePrefsOk && marketingExtraOk
    const canContinueScenarios = scenarios.every(s => (responses[s.id] || '').trim().length > 0)

    const handleSubmit = async () => {
        if (step < 3) {
            setStep((step + 1) as 2 | 3)
            return
        }

        const payload: QuestionnairePayload = {
            protocolVersion: 'v2',
            profession,
            foundational,
            scenarios: scenarios.map(s => ({ id: s.id, prompt: `${s.title}: ${s.description}`, response: responses[s.id] || '' }))
        }

        await onSubmit(payload)
    }

    return (
        <div className="max-w-3xl mx-auto p-6">
            <div className="mb-8">
                <h2 className="text-2xl font-bold mb-2">Welcome! Let&apos;s Create Your AI Writing Persona.</h2>
                <p className="text-gray-600">Your responses will teach the AI your personal &quot;writeprint&quot;—your tone, structure, and vocabulary. The more authentically you respond, the better your AI assistant will be.</p>
            </div>

            {/* Progress */}
            <div className="mb-6">
                <div className="flex justify-between text-sm mb-2">
                    <span>Step {step} of 3</span>
                    <span>{Math.round((step / 3) * 100)}% Complete</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full transition-all duration-300" style={{ width: `${(step / 3) * 100}%` }} />
                </div>
            </div>

            {/* Step 1: Choose Profession */}
            {step === 1 && (
                <div className="space-y-6">
                    <h3 className="text-xl font-semibold">Choose your professional field</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {(['Software Developer', 'HR Professional', 'Legal Counsel', 'Finance Analyst', 'Marketing Professional'] as Profession[]).map(p => (
                            <button key={p} type="button" onClick={() => setProfession(p)} className={`p-3 border-2 rounded-lg text-left transition-all ${profession === p ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>{p}</button>
                        ))}
                    </div>

                    <h3 className="text-xl font-semibold pt-4">Section A: Foundational Communication Style</h3>
                    {/* Q1 */}
                    <div>
                        <label className="block text-sm font-medium mb-2">1. When communicating professionally, which is your primary goal?</label>
                        <div className="space-y-2">
                            <button className={`w-full p-3 border-2 rounded-lg text-left ${foundational.goal === 'Task-Oriented' ? 'border-blue-600 bg-blue-50' : 'border-gray-200'}`} onClick={() => setFoundational({ ...foundational, goal: 'Task-Oriented' })}>
                                (A) To be as efficient and direct as possible. (Task-Oriented)
                            </button>
                            <button className={`w-full p-3 border-2 rounded-lg text-left ${foundational.goal === 'Person-Oriented' ? 'border-blue-600 bg-blue-50' : 'border-gray-200'}`} onClick={() => setFoundational({ ...foundational, goal: 'Person-Oriented' })}>
                                (B) To build a personal connection and rapport. (Person-Oriented)
                            </button>
                            <button className={`w-full p-3 border-2 rounded-lg text-left ${foundational.goal === 'Analytical' ? 'border-blue-600 bg-blue-50' : 'border-gray-200'}`} onClick={() => setFoundational({ ...foundational, goal: 'Analytical' })}>
                                (C) To provide detailed, factual, and accurate information. (Analytical)
                            </button>
                        </div>
                    </div>

                    {/* Q2 */}
                    <div>
                        <label className="block text-sm font-medium mb-2">2. Typical email formality (1 = Very Casual, 5 = Very Formal)</label>
                        <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map(n => (
                                <button key={n} type="button" onClick={() => setFoundational({ ...foundational, formality: n as 1 | 2 | 3 | 4 | 5 })} className={`px-3 py-2 border-2 rounded ${foundational.formality === n ? 'border-blue-600 bg-blue-50' : 'border-gray-200'}`}>{n}</button>
                            ))}
                        </div>
                    </div>

                    {/* Q3 */}
                    <div>
                        <label className="block text-sm font-medium mb-2">3. Which fragment sounds most like you?</label>
                        <div className="space-y-2">
                            <button className={`w-full p-3 border-2 rounded-lg text-left ${foundational.fragmentChoice === 'A' ? 'border-blue-600 bg-blue-50' : 'border-gray-200'}`} onClick={() => setFoundational({ ...foundational, fragmentChoice: 'A' })}>
                                (A) &quot;Got it. Will do.&quot;
                            </button>
                            <button className={`w-full p-3 border-2 rounded-lg text-left ${foundational.fragmentChoice === 'B' ? 'border-blue-600 bg-blue-50' : 'border-gray-200'}`} onClick={() => setFoundational({ ...foundational, fragmentChoice: 'B' })}>
                                (B) &quot;Thanks for the update! I&apos;ll get on that right away.&quot;
                            </button>
                            <button className={`w-full p-3 border-2 rounded-lg text-left ${foundational.fragmentChoice === 'C' ? 'border-blue-600 bg-blue-50' : 'border-gray-200'}`} onClick={() => setFoundational({ ...foundational, fragmentChoice: 'C' })}>
                                (C) &quot;I have received and reviewed the document. I will proceed with the necessary actions as outlined.&quot;
                            </button>
                        </div>
                    </div>

                    {/* Q4 */}
                    <div>
                        <label className="block text-sm font-medium mb-2">4. Preferred greeting style</label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {(['Hi {FirstName}', 'Hello {FirstName}', 'Hey {FirstName}', 'Dear {Name}', 'No greeting'] as const).map(v => (
                                <button key={v} type="button" className={`p-3 border-2 rounded-lg text-left ${foundational.greetingPreference === v ? 'border-blue-600 bg-blue-50' : 'border-gray-200'}`} onClick={() => setFoundational({ ...foundational, greetingPreference: v })}>
                                    {v}
                                </button>
                            ))}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">We&apos;ll use this to guide how your emails start (e.g., Hi Sarah, Hello Alex, Dear Dr. Patel, or no greeting).</p>
                    </div>

                    {/* Q5 */}
                    <div>
                        <label className="block text-sm font-medium mb-2">5. Select your writing style preferences (choose all that apply)</label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {(['Concise', 'Warm', 'Direct', 'Formal', 'Diplomatic', 'Detailed', 'Action-oriented', 'Storytelling', 'Data-driven'] as const).map(v => {
                                const selected = (foundational.writingStylePreferences ?? []).includes(v)
                                return (
                                    <button
                                        key={v}
                                        type="button"
                                        className={`p-3 border-2 rounded-lg text-left ${selected ? 'border-blue-600 bg-blue-50' : 'border-gray-200'}`}
                                        onClick={() => {
                                            const curr = new Set(foundational.writingStylePreferences ?? [])
                                            if (curr.has(v)) curr.delete(v); else curr.add(v)
                                            setFoundational({ ...foundational, writingStylePreferences: Array.from(curr) as NonNullable<FoundationalAnswers['writingStylePreferences']> })
                                        }}
                                    >
                                        {v}
                                    </button>
                                )
                            })}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">We&apos;ll prioritize these preferences when drafting emails.</p>
                    </div>

                    {/* Q6 */}
                    <div>
                        <label className="block text-sm font-medium mb-2">6. Typical sentence complexity</label>
                        <div className="flex flex-wrap gap-2">
                            {(['Simple', 'Moderate', 'Complex'] as const).map(v => (
                                <button key={v} type="button" className={`px-3 py-2 border-2 rounded ${foundational.sentenceComplexity === v ? 'border-blue-600 bg-blue-50' : 'border-gray-200'}`} onClick={() => setFoundational({ ...foundational, sentenceComplexity: v })}>{v}</button>
                            ))}
                        </div>
                    </div>

                    {/* Q7 */}
                    <div>
                        <label className="block text-sm font-medium mb-2">7. Preferred paragraph length</label>
                        <div className="flex flex-wrap gap-2">
                            {(['Short (1-2 sentences)', 'Medium (3-4 sentences)', 'Long (5+ sentences)'] as const).map(v => (
                                <button key={v} type="button" className={`px-3 py-2 border-2 rounded ${foundational.paragraphLength === v ? 'border-blue-600 bg-blue-50' : 'border-gray-200'}`} onClick={() => setFoundational({ ...foundational, paragraphLength: v })}>{v}</button>
                            ))}
                        </div>
                    </div>

                    {/* Q8 */}
                    <div>
                        <label className="block text-sm font-medium mb-2">8. Preferred sign-off (closing)</label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {(['Best', 'Regards', 'Thanks', 'Sincerely', 'Cheers', 'No sign-off'] as const).map(v => (
                                <button key={v} type="button" className={`p-3 border-2 rounded-lg text-left ${foundational.closingPreference === v ? 'border-blue-600 bg-blue-50' : 'border-gray-200'}`} onClick={() => setFoundational({ ...foundational, closingPreference: v })}>{v}</button>
                            ))}
                        </div>
                    </div>

                    {/* Q9 */}
                    <div>
                        <label className="block text-sm font-medium mb-2">9. Emoji usage</label>
                        <div className="flex flex-wrap gap-2">
                            {(['Never', 'Rare', 'Occasional', 'Frequent'] as const).map(v => (
                                <button key={v} type="button" className={`px-3 py-2 border-2 rounded ${foundational.emojiUsage === v ? 'border-blue-600 bg-blue-50' : 'border-gray-200'}`} onClick={() => setFoundational({ ...foundational, emojiUsage: v })}>{v}</button>
                            ))}
                        </div>
                    </div>

                    {/* Q10 */}
                    <div>
                        <label className="block text-sm font-medium mb-2">10. Use bullet points when possible?</label>
                        <div className="flex flex-wrap gap-2">
                            {(['Yes', 'No'] as const).map(v => (
                                <button key={v} type="button" className={`px-3 py-2 border-2 rounded ${foundational.prefersBulletPoints === v ? 'border-blue-600 bg-blue-50' : 'border-gray-200'}`} onClick={() => setFoundational({ ...foundational, prefersBulletPoints: v })}>{v}</button>
                            ))}
                        </div>
                    </div>

                    {/* Marketing-specific extra field */}
                    {profession === 'Marketing Professional' && (
                        <div>
                            <label className="block text-sm font-medium mb-2">11. Which best describes your brand voice?</label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {(['Authoritative', 'Friendly', 'Playful', 'Minimalist'] as const).map(v => (
                                    <button key={v} type="button" className={`p-3 border-2 rounded-lg text-left ${foundational.marketingVoice === v ? 'border-blue-600 bg-blue-50' : 'border-gray-200'}`} onClick={() => setFoundational({ ...foundational, marketingVoice: v })}>
                                        {v}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end pt-4">
                        <Button type="button" disabled={!canContinueFoundational || isSubmitting} onClick={() => setStep(2)}>Next</Button>
                    </div>
                </div>
            )}

            {/* Step 2: Profession-specific Scenarios */}
            {step === 2 && (
                <div className="space-y-6">
                    <h3 className="text-xl font-semibold">Section B: Profession-Specific Scenarios</h3>
                    <p className="text-gray-600">Write a reply for each scenario exactly as you would in a real situation.</p>
                    {scenarios.map(s => (
                        <div key={s.id} className="border rounded-lg p-4 space-y-2">
                            <div className="font-medium">{s.title}</div>
                            <div className="text-sm text-gray-600">{s.description}</div>
                            <div className="text-xs text-gray-500">Tests for: {s.testsFor}</div>
                            <textarea className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-600 focus:outline-none min-h-[120px]" placeholder="Write your reply..." value={responses[s.id] || ''} onChange={(e) => setResponses(prev => ({ ...prev, [s.id]: e.target.value }))} />
                        </div>
                    ))}
                    <div className="flex justify-between pt-4">
                        <button type="button" className="px-4 py-2 border-2 border-gray-300 rounded-lg hover:bg-gray-50" onClick={() => setStep(1)}>Back</button>
                        <Button type="button" disabled={!canContinueScenarios || isSubmitting} onClick={() => setStep(3)}>Next</Button>
                    </div>
                </div>
            )}

            {/* Step 3: Review & Submit */}
            {step === 3 && (
                <div className="space-y-6">
                    <h3 className="text-xl font-semibold">Review & Submit</h3>
                    <p className="text-gray-600">We&apos;ll now generate your persona using an iterative, research-backed pipeline and save it to your profile.</p>
                    <ul className="text-sm list-disc pl-5 text-gray-700">
                        <li>Initial stylometry on your samples</li>
                        <li>Generate-compare-refine loops (PROSE-inspired)</li>
                        <li>Consistency checks across scenarios</li>
                        <li>Final writeprint saved to your account</li>
                    </ul>
                    <div className="flex justify-between pt-4">
                        <button type="button" className="px-4 py-2 border-2 border-gray-300 rounded-lg hover:bg-gray-50" onClick={() => setStep(2)}>Back</button>
                        <Button type="button" disabled={isSubmitting} onClick={handleSubmit}>{isSubmitting ? 'Submitting...' : 'Generate My Persona'}</Button>
                    </div>
                </div>
            )}
        </div>
    )
}
