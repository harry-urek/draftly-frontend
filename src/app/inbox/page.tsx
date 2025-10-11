'use client'

import { useAppStore } from '@/lib/store'
import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Mail, LogOut } from 'lucide-react'
import Image from 'next/image'
import InboxMessages from '@/components/InboxMessages'
import Sidebar from '@/components/Sidebar'
import EmailDetail from '@/components/EmailDetail'
import { api } from '@/lib/api'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import RichTextEditor, { isHtmlEmpty, sanitizeHtml, plainTextToHtml } from '@/components/RichTextEditor'

export default function InboxPage() {
    const { user, setUser, selectedEmail, selectedThread, setSelectedEmail, setSelectedThread } = useAppStore()
    const [activeFolder, setActiveFolder] = React.useState<'inbox' | 'drafts' | 'sent' | 'archive' | 'trash' | 'starred'>('inbox')
    const [showCompose, setShowCompose] = React.useState(false)
    const [composeTo, setComposeTo] = React.useState('')
    const [composeSubject, setComposeSubject] = React.useState('')
    const [composeBody, setComposeBody] = React.useState('')
    const [sending, setSending] = React.useState(false)
    const router = useRouter()
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

    useEffect(() => {
        if (!user) {
            console.log('No user found on inbox page, redirecting to home')
            router.push('/')
        } else {
            console.log('User successfully reached inbox page:', user.id)
        }
    }, [user, router])

    // Refresh Gmail auth flag after OAuth redirect
    useEffect(() => {
        const refreshUserProfile = async () => {
            if (user && !user.hasValidGmailAuth) {
                try {
                    // Ask /auth/status for latest Gmail connection
                    const status = await api.get(api.session())
                    setUser({
                        ...user,
                        hasValidGmailAuth: Boolean(status.hasValidGmailAuth),
                        needsGmailAuth: Boolean(status.needsGmailAuth),
                        needsOnboarding: Boolean(status.needsOnboarding),
                        onboardingStatus: status.onboardingStatus,
                        redirectToInbox: Boolean(status.redirectToInbox),
                    })
                } catch (error) {
                    console.error('Failed to refresh user profile:', error);
                }
            }
        };
        refreshUserProfile();
    }, [user, setUser, API_BASE_URL])

    const handleLogout = async () => {
        try {
            await api.post(api.logout());
            setSelectedEmail(null);
            setSelectedThread(null);
            setUser(null)
            router.push('/')
        } catch (error) {
            console.error('Logout failed:', error)
        }
    }

    const handleConnectGmail = () => {
        if (!user) return;
        // Pass the firebaseUid as state to link tokens after OAuth
        window.location.href = `${API_BASE_URL}/auth/oauth/google/start?state=${user.id}`;
    };

    if (!user) {
        return null
    }

    return (
        <div className="h-screen flex flex-col bg-background text-foreground overflow-hidden">
            {/* Minimal Header */}
            <header className="border-b border-border flex-shrink-0 bg-white">
                <div className="flex justify-between items-center px-6 py-3">
                    <div className="flex items-center gap-2">
                        <Mail className="h-5 w-5 text-primary" />
                        <span className="text-base font-semibold text-foreground" style={{ fontFamily: 'var(--font-geist-sans)' }}>
                            Draftly
                        </span>
                    </div>
                    <div className="flex items-center gap-3">
                        {user.picture && (
                            <Image
                                src={user.picture}
                                alt="Profile"
                                width={32}
                                height={32}
                                className="rounded-full"
                            />
                        )}
                        <button
                            onClick={handleLogout}
                            className="text-muted-foreground hover:text-foreground transition-colors p-1.5 hover:bg-hover-bg rounded"
                            title="Logout"
                        >
                            <LogOut className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </header>

            {/* Fullscreen Main Content with Sidebar */}
            <main className="flex-1 overflow-hidden flex">
                {user.hasValidGmailAuth ? (
                    <>
                        {/* Sidebar */}
                        <Sidebar active={activeFolder} onSelect={(key) => setActiveFolder(key)} onCompose={() => setShowCompose(true)} />
                        {/* Main Content Area */}
                        {selectedEmail ? (
                            <EmailDetail
                                email={selectedEmail}
                                thread={selectedThread || undefined}
                                onClose={() => { setSelectedEmail(null); setSelectedThread(null); }}
                            />
                        ) : (
                            <div className="flex-1 flex">
                                <div className="flex-1">
                                    <InboxMessages />
                                </div>
                                {showCompose && (
                                    <div className="w-full max-w-xl border-l border-border bg-white flex flex-col">
                                        <div className="p-3 border-b border-border flex items-center justify-between">
                                            <h3 className="text-sm font-semibold">New message</h3>
                                            <button className="text-xs text-muted-foreground hover:text-foreground" onClick={() => setShowCompose(false)}>Close</button>
                                        </div>
                                        <div className="p-3 space-y-2">
                                            <input value={composeTo} onChange={(e) => setComposeTo(e.target.value)} placeholder="To" className="w-full text-sm border border-border rounded px-2 py-1" />
                                            <input value={composeSubject} onChange={(e) => setComposeSubject(e.target.value)} placeholder="Subject" className="w-full text-sm border border-border rounded px-2 py-1" />
                                            <RichTextEditor value={composeBody} onChange={setComposeBody} placeholder="Write your message…" />
                                        </div>
                                        <div className="p-3 border-t border-border flex items-center justify-between">
                                            <Button size="sm" onClick={async () => {
                                                if (!composeTo || !composeSubject || isHtmlEmpty(composeBody)) return;
                                                try {
                                                    setSending(true);
                                                    const bodyHtml = sanitizeHtml(composeBody) || plainTextToHtml(composeBody);
                                                    await api.post(api.sendNewEmail(), { to: composeTo, subject: composeSubject, body: bodyHtml });
                                                    setComposeTo(''); setComposeSubject(''); setComposeBody(''); setShowCompose(false);
                                                } finally { setSending(false); }
                                            }} disabled={sending || !composeTo || !composeSubject || isHtmlEmpty(composeBody)}>Send</Button>
                                            <button className="text-xs text-muted-foreground hover:text-foreground" onClick={() => setShowCompose(false)}>Discard</button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                ) : (
                    <div className="flex items-center justify-center h-full w-full p-4">
                        <Card className="max-w-md w-full text-center">
                            <CardContent className="p-8">
                                <h2 className="text-xl font-semibold mb-2 text-foreground" style={{ fontFamily: 'var(--font-geist-sans)' }}>Connect your Gmail</h2>
                                <p className="mb-6 text-muted-foreground text-sm" style={{ fontFamily: 'var(--font-geist-sans)' }}>
                                    Connect your Gmail account to start using Draftly.
                                </p>
                                <Button onClick={handleConnectGmail} className="w-full">Connect Gmail</Button>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </main>
        </div>
    )
}
