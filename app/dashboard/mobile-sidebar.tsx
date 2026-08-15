'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import clsx from 'clsx'
import { menuItems } from './sidebar'
import { logoutAction } from '../login/actions'
import { Bars3Icon, XMarkIcon, ArrowRightStartOnRectangleIcon, ShieldCheckIcon } from '@heroicons/react/24/outline'

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
            <button className="md:hidden text-slate-500 p-2 -ml-2">
                <Bars3Icon className="w-5 h-5" />
            </button>
        )
    }

    const sidebarContent = (
        <>
            <div
                className="fixed inset-0 bg-slate-900/40 z-[9999] backdrop-blur-xs md:hidden"
                onClick={() => setIsOpen(false)}
            />

            <div className={clsx(
                "fixed top-0 left-0 h-full w-64 bg-white border-r border-slate-200 z-[10000] transform transition-transform duration-200 ease-in-out md:hidden flex flex-col shadow-xl",
                isOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="h-14 flex items-center justify-between px-5 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-slate-900 rounded-lg flex items-center justify-center text-white">
                            <ShieldCheckIcon className="w-4 h-4" />
                        </div>
                        <span className="text-base font-bold text-slate-900 tracking-tight">Smart ACS</span>
                    </div>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="text-slate-400 hover:text-slate-700 p-1"
                    >
                        <XMarkIcon className="w-5 h-5" />
                    </button>
                </div>

                <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
                    {menuItems.map((item) => {
                        const isActive = pathname === item.href
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setIsOpen(false)}
                                className={clsx(
                                    "flex items-center gap-2.5 px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                                    isActive
                                        ? "bg-slate-900 text-white"
                                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                                )}
                            >
                                <item.icon className="w-4 h-4 shrink-0" />
                                {item.name}
                            </Link>
                        )
                    })}
                </nav>

                <div className="p-3 border-t border-slate-100">
                    <form action={logoutAction}>
                        <button
                            type="submit"
                            className="flex items-center gap-2.5 px-3 py-2 w-full text-sm font-medium text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        >
                            <ArrowRightStartOnRectangleIcon className="w-4 h-4" />
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
                className="md:hidden text-slate-500 hover:text-slate-900 p-1.5 -ml-2 transition-colors"
            >
                <Bars3Icon className="w-5 h-5" />
            </button>

            {isOpen && createPortal(sidebarContent, document.body)}
        </>
    )
}