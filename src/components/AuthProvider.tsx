'use client'

import { useAppStore } from '@/lib/store'
import { onAuthChange, AuthUser } from '@/lib/firebase'
import { api } from '@/lib/api'
import { useEffect } from 'react'

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const { setUser, setLoading } = useAppStore()

    useEffect(() => {
        setLoading(true)

        const unsubscribe = onAuthChange(async (firebaseUser: AuthUser | null) => {
            if (firebaseUser) {
                // Convert Firebase user to our user format
                try {
                    // Ensure backend user record exists and capture initial onboarding state
                    const registerResponse = await api.post(api.register())
                    // Ask backend for auth status to know Gmail connection and onboarding state
                    const status = await api.get(api.session())
                    setUser({
                        id: firebaseUser.uid,
                        email: firebaseUser.email || '',
                        name: firebaseUser.displayName || '',
                        picture: firebaseUser.photoURL || undefined,
                        hasValidGmailAuth: Boolean(status.hasValidGmailAuth),
                        needsGmailAuth: Boolean(
                            status.needsGmailAuth ?? registerResponse?.needsGmailAuth
                        ),
                        needsOnboarding: Boolean(
                            status.needsOnboarding ?? registerResponse?.needsOnboarding
                        ),
                        onboardingStatus:
                            status.onboardingStatus ?? registerResponse?.onboardingStatus,
                        redirectToInbox: Boolean(
                            status.redirectToInbox ?? registerResponse?.redirectToInbox
                        ),
                    })
                } catch {
                    // Fallback to minimal user if status fetch fails
                    setUser({
                        id: firebaseUser.uid,
                        email: firebaseUser.email || '',
                        name: firebaseUser.displayName || '',
                        picture: firebaseUser.photoURL || undefined,
                    })
                }
            } else {
                setUser(null)
            }
            setLoading(false)
        })

        return () => unsubscribe()
    }, [setUser, setLoading])

    return (
        <div>
            {children}
        </div>
    )
}