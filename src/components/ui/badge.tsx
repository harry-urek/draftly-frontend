import * as React from 'react'

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
    variant?: 'default' | 'secondary' | 'outline'
}

export function Badge({ className = '', variant = 'default', ...props }: BadgeProps) {
    const variants = {
        default: 'bg-blue-50 text-blue-700 border-blue-200',
        secondary: 'bg-slate-100 text-slate-700 border-slate-200',
        outline: 'bg-transparent text-slate-700 border-slate-300',
    }
    return (
        <span
            className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${variants[variant]} ${className}`}
            {...props}
        />
    )
}
