'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Menu, X, LogOut } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import clsx from 'clsx'
import { menuItems } from './sidebar'
import { logoutAction } from '../login/actions'

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
            <button className="md:hidden text-dark-muted p-2 -ml-2">
                <Menu size={24} />
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
                    <span className="text-xl font-bold text-white tracking-tight">SecurePass</span>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="text-dark-muted hover:text-white transition-colors"
                    >
                        <X size={24} />
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
                                    "flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all",
                                    isActive
                                        ? "bg-primary text-white shadow-lg shadow-blue-500/20"
                                        : "text-dark-muted hover:bg-dark-700 hover:text-white"
                                )}
                            >
                                <item.icon size={20} />
                                {item.name}
                            </Link>
                        )
                    })}
                </nav>

                <div className="p-4 border-t border-dark-700">
                    <form action={logoutAction}>
                        <button
                            type="submit"
                            className="flex items-center gap-3 px-4 py-3 w-full text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-xl transition-colors"
                        >
                            <LogOut size={20} />
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
                className="md:hidden text-dark-muted hover:text-white p-2 -ml-2 transition-colors"
            >
                <Menu size={24} />
            </button>

            {isOpen && createPortal(sidebarContent, document.body)}
        </>
    )
}