import React from 'react'
import clsx from 'clsx'

export type BadgeVariant = 'success' | 'warning' | 'danger' | 'neutral' | 'info'
export type BadgeSize = 'sm' | 'md'

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
    variant?: BadgeVariant
    size?: BadgeSize
    dot?: boolean
    pulse?: boolean
    icon?: React.ReactNode
    children: React.ReactNode
}

const dotColorMap: Record<BadgeVariant, string> = {
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    danger: 'bg-rose-500',
    neutral: 'bg-slate-400',
    info: 'bg-sky-500'
}

export function Badge({
    variant = 'neutral',
    size = 'md',
    dot = false,
    pulse = false,
    icon,
    children,
    className,
    ...props
}: BadgeProps) {
    return (
        <span
            className={clsx(
                "inline-flex items-center font-medium border transition-colors select-none",
                // Size variants
                size === 'sm'
                    ? "text-[11px] px-2 py-0.5 gap-1.5 rounded-full"
                    : "text-xs px-2.5 py-1 gap-1.5 rounded-full",
                // Visual style: clean, refined, minimalist neutral background with subtle border
                "bg-slate-50 border-slate-200/90 text-slate-700 shadow-[0_1px_2px_rgba(0,0,0,0.02)]",
                className
            )}
            {...props}
        >
            {dot && (
                <span className="relative flex h-1.5 w-1.5 shrink-0">
                    {pulse && (
                        <span
                            className={clsx(
                                "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
                                dotColorMap[variant]
                            )}
                        />
                    )}
                    <span className={clsx("relative inline-flex rounded-full h-1.5 w-1.5", dotColorMap[variant])} />
                </span>
            )}
            {icon && <span className="shrink-0 text-slate-500">{icon}</span>}
            <span className="leading-none">{children}</span>
        </span>
    )
}
