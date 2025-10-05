'use client'

import { useAppStore } from '@/lib/store'
import { onAuthChange, AuthUser } from '@/lib/firebase'
import { useEffect } from 'react'

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const { setUser, setLoading } = useAppStore()

    useEffect(() => {
        setLoading(true)
        
        const unsubscribe = onAuthChange((firebaseUser: AuthUser | null) => {
            if (firebaseUser) {
                // Convert Firebase user to our user format
                setUser({
                    id: firebaseUser.uid,
                    email: firebaseUser.email || '',
                    name: firebaseUser.displayName || '',
                    picture: firebaseUser.photoURL || undefined
                })
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