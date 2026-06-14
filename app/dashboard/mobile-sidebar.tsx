'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import clsx from 'clsx'
import { menuItems } from './sidebar'
import { logoutAction } from '../login/actions'
import { Bars3Icon, XMarkIcon, ArrowRightStartOnRectangleIcon } from '@heroicons/react/24/outline'

export function MobileSidebar() {
    const [isOpen, setIsOpen] = useState(false)
    const [mounted, setMounted] = useState(false)
    const pathname = usePathname()

    useEffect(() => {
        setMounted(true)
    }, [])

    useEffect(() => {
        if (isOpen) setIsOpen(false)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pathname])

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = 'unset'
        }
        return () => { document.body.style.overflow = 'unset' }
    }, [isOpen])

    if (!mounted) {
        return (
            <button className="md:hidden text-dark-muted p-2 -ml-2 outline-none focus:outline-none focus:ring-0 [-webkit-tap-highlight-color:transparent]">
                <Bars3Icon className="w-6 h-6" />
            </button>
        )
    }

    const sidebarContent = (
        <>
            <div
                className="fixed inset-0 bg-black/60 z-[9999] backdrop-blur-sm md:hidden animate-fade-in"
                onClick={() => setIsOpen(false)}
            />

            <div className={clsx(
                "fixed top-0 left-0 h-full w-72 bg-dark-800 border-r border-dark-700 z-[10000] transform transition-transform duration-300 ease-in-out md:hidden flex flex-col shadow-2xl",
                isOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="h-16 flex items-center justify-between px-6 border-b border-dark-700">
                    <span className="text-xl font-bold text-white tracking-tight">Smart ACS</span>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="text-dark-muted hover:text-white transition-colors outline-none focus:outline-none focus:ring-0 [-webkit-tap-highlight-color:transparent]"
                    >
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>

                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    {menuItems.map((item) => {
                        const isActive = pathname === item.href
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setIsOpen(false)}
                                className={clsx(
                                    "flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl select-none outline-none focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 [-webkit-tap-highlight-color:transparent]",
                                    isActive
                                        ? "bg-primary text-white shadow-lg shadow-blue-500/20"
                                        : "text-dark-muted hover:bg-dark-700 hover:text-white"
                                )}
                            >
                                {/* Змінили size={20} на className="w-5 h-5" для сумісності з Heroicons */}
                                <item.icon className="w-5 h-5" />
                                {item.name}
                            </Link>
                        )
                    })}
                </nav>

                <div className="p-4 border-t border-dark-700">
                    <form action={logoutAction}>
                        <button
                            type="submit"
                            className="flex items-center gap-3 px-4 py-3 w-full text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-xl outline-none focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 [-webkit-tap-highlight-color:transparent]"
                        >
                            <ArrowRightStartOnRectangleIcon className="w-5 h-5" />
                            Sign Out
                        </button>
                    </form>
                </div>
            </div>
        </>
    )

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="md:hidden text-dark-muted hover:text-white p-2 -ml-2 transition-colors outline-none focus:outline-none focus:ring-0 [-webkit-tap-highlight-color:transparent]"
            >
                <Bars3Icon className="w-6 h-6" />
            </button>

            {isOpen && createPortal(sidebarContent, document.body)}
        </>
    )
}