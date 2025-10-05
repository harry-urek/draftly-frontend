'use client'

import { useAppStore } from '@/lib/store'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Mail, LogOut } from 'lucide-react'
import Image from 'next/image'
import InboxMessages from '@/components/InboxMessages'
import Sidebar from '@/components/Sidebar'
import EmailDetail from '@/components/EmailDetail'
import { getIdToken } from '@/lib/firebase'

export default function InboxPage() {
    const { user, setUser, selectedEmail, setSelectedEmail } = useAppStore()
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

    // Refresh user profile after OAuth redirect
    useEffect(() => {
        const refreshUserProfile = async () => {
            if (user && !user.accessToken) {
                try {
                    const idToken = await getIdToken();
                    if (idToken) {
                        const response = await fetch(`${API_BASE_URL}/auth/me`, {
                            headers: { 'Authorization': `Bearer ${idToken}` }
                        });
                        if (response.ok) {
                            const data = await response.json();
                            if (data.user.accessToken) {
                                setUser({ ...user, accessToken: data.user.accessToken });
                            }
                        }
                    }
                } catch (error) {
                    console.error('Failed to refresh user profile:', error);
                }
            }
        };
        refreshUserProfile();
    }, [user, setUser, API_BASE_URL])

    const handleLogout = async () => {
        try {
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
                {user.accessToken ? (
                    <>
                        {/* Sidebar */}
                        <Sidebar />

                        {/* Main Content Area */}
                        {selectedEmail ? (
                            <EmailDetail
                                email={selectedEmail}
                                onClose={() => setSelectedEmail(null)}
                            />
                        ) : (
                            <InboxMessages />
                        )}
                    </>
                ) : (
                    <div className="flex items-center justify-center h-full w-full">
                        <div className="text-center bg-white rounded-lg border border-border p-8 shadow-sm max-w-md">
                            <h2 className="text-xl font-semibold mb-3 text-foreground" style={{ fontFamily: 'var(--font-geist-sans)' }}>Connect your Gmail</h2>
                            <p className="mb-6 text-muted-foreground text-sm" style={{ fontFamily: 'var(--font-geist-sans)' }}>Connect your Gmail account to start using Draftly.</p>
                            <button
                                onClick={handleConnectGmail}
                                className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all font-semibold shadow-sm w-full"
                                style={{ fontFamily: 'var(--font-geist-sans)' }}
                            >
                                Connect Gmail
                            </button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    )
}
