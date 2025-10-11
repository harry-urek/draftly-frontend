'use client'

import { useAppStore } from '@/lib/store'
import { AuthButton } from '@/components/AuthButton'
import { Mail, ShieldCheck, Wand2, TimerReset, Inbox, Lock, ArrowRight } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Disclosure } from '@headlessui/react'

export default function Home() {
  const { user } = useAppStore()
  const router = useRouter()

  useEffect(() => {
    if (!user) {
      return
    }

    const status = user.onboardingStatus

    if (user.redirectToInbox || status === 'COMPLETED_INIT_PROFILE' || status === 'PROFILE_DONE' || status === 'ACTIVE') {
      router.push('/inbox')
      return
    }

    if (user.needsGmailAuth || status === 'NOT_STARTED') {
      router.push('/permissions')
      return
    }

    if (status === 'PROFILE_GENERATING') {
      router.push('/onboarding/processing')
      return
    }

    if (user.needsOnboarding || status === 'GMAIL_CONNECTED' || status === 'QUESTIONNAIRE_IN_PROGRESS' || status === 'QUESTIONNAIRE_COMPLETED') {
      router.push('/onboarding')
    }
  }, [user, router])

  if (user) {
    return null // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-30 backdrop-blur supports-[backdrop-filter]:bg-white/60 bg-white/80 border-b border-slate-200">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Mail className="h-6 w-6 text-primary" />
              <span className="ml-2 text-xl font-semibold">Draftly</span>
            </div>
            <div className="flex items-center gap-3">
              <Badge>Private Beta</Badge>
              <AuthButton />
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-10">
        <div className="grid lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-600">
              <Wand2 className="h-3.5 w-3.5 text-primary" />
              Learns your writing style in minutes
            </div>
            <h1 className="mt-4 text-4xl md:text-6xl font-bold tracking-tight">
              AI email replies that sound exactly like you
            </h1>
            <p className="mt-4 text-lg text-slate-600 max-w-2xl">
              Draftly analyzes your recent emails and a short questionnaire to build a personal style profile.
              Generate thoughtful replies with your tone, structure, and preferences — then review and send.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <AuthButton />
              <a href="#how-it-works" className="inline-flex items-center text-slate-700 hover:text-slate-900">
                See how it works <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </div>
            <div className="mt-6 flex items-center gap-4 text-sm text-slate-600">
              <div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4" /> Your data stays private</div>
              <div className="flex items-center gap-2"><Lock className="h-4 w-4" /> Secure OAuth with Google</div>
            </div>
          </div>
          <div className="lg:col-span-5">
            <Card className="overflow-hidden">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-800"><Inbox className="h-5 w-5 text-primary" /> Inbox Preview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="rounded-md border border-slate-200 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Project update — timeline confirmation</p>
                      <p className="text-sm text-slate-600">From: Taylor (3h ago)</p>
                    </div>
                    <Button size="sm">Reply</Button>
                  </div>
                </div>
                <div className="rounded-md border border-slate-200 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Follow up: meeting notes & action items</p>
                      <p className="text-sm text-slate-600">From: Jordan (1d ago)</p>
                    </div>
                    <Button size="sm" variant="secondary">Reply</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="how-it-works" className="container mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-primary" /> Connect securely</CardTitle>
            </CardHeader>
            <CardContent className="text-slate-600">
              Sign in with Google and grant read/send permissions. Your Gmail data is processed securely and never stored permanently.
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><TimerReset className="h-5 w-5 text-primary" /> Learn your style</CardTitle>
            </CardHeader>
            <CardContent className="text-slate-600">
              We analyze a few recent emails plus a short questionnaire to build a personal writing profile in under a minute.
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Wand2 className="h-5 w-5 text-primary" /> Draft better replies</CardTitle>
            </CardHeader>
            <CardContent className="text-slate-600">
              Generate context-aware replies that match your tone, structure, and preferences. Review, tweak, and send.
            </CardContent>
          </Card>
        </div>
      </section>

      {/* FAQ */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-semibold mb-4">Frequently asked questions</h2>
          <div className="divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white">
            {[{
              q: 'How does Draftly learn my style?',
              a: 'We combine a short questionnaire with a small sample of your recent emails to create a private style profile used only for generation.'
            }, {
              q: 'Is my data safe?',
              a: 'Yes. Authentication happens via Google OAuth. Email content is processed transiently and never stored longer than needed for generation.'
            }, {
              q: 'Can I change the tone of replies?',
              a: 'Absolutely. You can adjust tone, length, and specifics before sending, and your profile improves over time.'
            }].map((item, idx) => (
              <Disclosure key={idx}>
                {({ open }) => (
                  <div className="px-4">
                    <Disclosure.Button className="flex w-full items-center justify-between py-4 text-left">
                      <span className="font-medium">{item.q}</span>
                      <ArrowRight className={`h-4 w-4 transition-transform ${open ? 'rotate-90' : ''}`} />
                    </Disclosure.Button>
                    <Disclosure.Panel className="pb-4 text-slate-600">
                      {item.a}
                    </Disclosure.Panel>
                  </div>
                )}
              </Disclosure>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 mt-10">
        <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between text-slate-600">
            <div className="flex items-center">
              <Mail className="h-5 w-5 text-primary" />
              <span className="ml-2 text-base font-semibold">Draftly</span>
            </div>
            <div className="text-xs">© {new Date().getFullYear()} Draftly. All rights reserved.</div>
          </div>
        </div>
      </footer>
    </div>
  )
}
