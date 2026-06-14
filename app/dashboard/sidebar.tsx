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
    { name: 'Users', href: '/dashboard/users', icon: UsersIcon },
    { name: 'Access Logs', href: '/dashboard/logs', icon: DocumentTextIcon },
    { name: 'Settings', href: '/dashboard/settings', icon: Cog8ToothIcon },
]

export function Sidebar() {
    const pathname = usePathname()

    return (
        <aside className="w-64 bg-dark-800 border-r border-dark-700 flex flex-col h-screen fixed left-0 top-0 z-40 hidden md:flex">

            <Link
                href="/"
                className="p-6 flex items-center gap-3 group outline-none focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 [-webkit-tap-highlight-color:transparent]"
            >
                <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/40 transition-shadow">
                    <ShieldCheckIcon className="text-white w-6 h-6" />
                </div>
                <span className="text-xl font-bold tracking-tight text-white group-hover:text-primary transition-colors">Smart ACS</span>
            </Link>

            <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
                {menuItems.map((item) => {
                    const isActive = pathname === item.href

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={clsx(
                                "flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl select-none outline-none focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 [-webkit-tap-highlight-color:transparent]",
                                isActive
                                    ? "bg-primary text-white shadow-lg shadow-blue-500/20"
                                    : "text-dark-muted hover:bg-dark-700 hover:text-white"
                            )}
                        >
                            <item.icon className="w-5 h-5" />
                            {item.name}
                        </Link>
                    )
                })}
            </nav>

            <div className="p-4 border-t border-dark-700 mt-2">
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
        </aside>
    )
}