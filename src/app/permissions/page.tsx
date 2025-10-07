'use client'

import { useAppStore } from '@/lib/store'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { PermissionScreen } from '@/components/PermissionScreen'

export default function PermissionsPage() {
    const { user } = useAppStore()
    const router = useRouter()

    useEffect(() => {
        if (!user) {
            router.push('/')
        }
    }, [user, router])

    if (!user) {
        return null
    }

    return <PermissionScreen />
}