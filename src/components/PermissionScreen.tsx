'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Mail, Shield, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function PermissionScreen() {
    const router = useRouter()
    const [isConnecting, setIsConnecting] = useState(false)

    const handleConnect = async () => {
        setIsConnecting(true)
        // Add your email connection logic here
        // For now, just redirect to inbox
        setTimeout(() => {
            router.push('/inbox')
        }, 1000)
    }

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <div className="max-w-md w-full space-y-8 text-center">
                <div>
                    <div className="mx-auto h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center">
                        <Shield className="h-8 w-8 text-primary" />
                    </div>
                    <h2 className="mt-6 text-3xl font-bold tracking-tight">
                        Email Permissions
                    </h2>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Connect your email to start using Draftly&apos;s AI-powered reply assistant
                    </p>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center space-x-3 p-4 border rounded-lg">
                        <Mail className="h-5 w-5 text-muted-foreground" />
                        <div className="flex-1 text-left">
                            <p className="text-sm font-medium">Read your emails</p>
                            <p className="text-xs text-muted-foreground">
                                Access inbox to analyze and generate replies
                            </p>
                        </div>
                        <Check className="h-5 w-5 text-green-500" />
                    </div>

                    <div className="flex items-center space-x-3 p-4 border rounded-lg">
                        <Mail className="h-5 w-5 text-muted-foreground" />
                        <div className="flex-1 text-left">
                            <p className="text-sm font-medium">Send emails on your behalf</p>
                            <p className="text-xs text-muted-foreground">
                                Send AI-generated replies after your approval
                            </p>
                        </div>
                        <Check className="h-5 w-5 text-green-500" />
                    </div>
                </div>

                <Button 
                    onClick={handleConnect}
                    disabled={isConnecting}
                    className="w-full"
                >
                    {isConnecting ? 'Connecting...' : 'Grant Permissions'}
                </Button>

                <p className="text-xs text-muted-foreground">
                    Your email data is processed securely and never stored permanently
                </p>
            </div>
        </div>
    )
}