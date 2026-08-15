'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import clsx from 'clsx'
import { logoutAction } from '../login/actions'
import {
    Squares2X2Icon,
    CpuChipIcon,
    UsersIcon,
    DocumentTextIcon,
    Cog8ToothIcon,
    ArrowRightStartOnRectangleIcon,
    ShieldCheckIcon
} from '@heroicons/react/24/outline'

export const menuItems = [
    { name: 'Dashboard', href: '/dashboard', icon: Squares2X2Icon },
    { name: 'Devices', href: '/dashboard/devices', icon: CpuChipIcon },
    { name: 'Users & Access', href: '/dashboard/users', icon: UsersIcon },
    { name: 'Access Logs', href: '/dashboard/logs', icon: DocumentTextIcon },
    { name: 'Settings', href: '/dashboard/settings', icon: Cog8ToothIcon },
]

export function Sidebar() {
    const pathname = usePathname()

    return (
        <aside className="w-60 bg-white border-r border-slate-200 flex flex-col h-screen fixed left-0 top-0 z-40 hidden md:flex">
            <Link
                href="/"
                className="h-14 px-5 flex items-center gap-2.5 border-b border-slate-100 group outline-none"
            >
                <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white">
                    <ShieldCheckIcon className="w-5 h-5" />
                </div>
                <span className="text-base font-bold tracking-tight text-slate-900">KeyFlowy</span>
            </Link>

            <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
                {menuItems.map((item) => {
                    const isActive = pathname === item.href

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
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
        </aside>
    )
}