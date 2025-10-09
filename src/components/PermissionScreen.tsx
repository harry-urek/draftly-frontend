'use client'

import { useState } from 'react'
import { useAppStore } from '@/lib/store'
import { Mail, Shield, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function PermissionScreen() {
    const { user } = useAppStore()
    const [isConnecting, setIsConnecting] = useState(false)
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

    const handleConnect = async () => {
        try {
            setIsConnecting(true)
            // Start OAuth flow; backend will redirect back to /onboarding after success
            const state = user?.id ? `?state=${encodeURIComponent(user.id)}` : ''
            window.location.href = `${API_BASE_URL}/auth/oauth/google/start${state}`
        } finally {
            // Let navigation take over; no-op
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center p-6">
            <Card className="max-w-xl w-full">
                <CardHeader>
                    <div className="mx-auto h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center">
                        <Shield className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle className="text-center mt-4">Email Permissions</CardTitle>
                    <p className="text-center text-sm text-muted-foreground">Connect your Gmail to start using Draftly’s AI-powered reply assistant.</p>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="flex items-center space-x-3 p-4 border rounded-lg bg-white">
                            <Mail className="h-5 w-5 text-muted-foreground" />
                            <div className="flex-1 text-left">
                                <p className="text-sm font-medium">Read your emails</p>
                                <p className="text-xs text-muted-foreground">Analyze inbox to understand context and tone</p>
                            </div>
                            <Check className="h-5 w-5 text-green-500" />
                        </div>
                        <div className="flex items-center space-x-3 p-4 border rounded-lg bg-white">
                            <Mail className="h-5 w-5 text-muted-foreground" />
                            <div className="flex-1 text-left">
                                <p className="text-sm font-medium">Send emails on your behalf</p>
                                <p className="text-xs text-muted-foreground">Send AI-generated replies after your approval</p>
                            </div>
                            <Check className="h-5 w-5 text-green-500" />
                        </div>
                    </div>
                    <Button onClick={handleConnect} disabled={isConnecting} className="w-full mt-6">
                        {isConnecting ? 'Connecting…' : 'Grant Permissions'}
                    </Button>
                    <p className="text-xs text-muted-foreground text-center mt-3">Your email data is processed securely and never stored permanently.</p>
                </CardContent>
            </Card>
        </div>
    )
}