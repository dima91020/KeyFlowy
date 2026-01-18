'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Users, FileText, Settings, LogOut, Radio } from 'lucide-react'
import clsx from 'clsx'
import { logoutAction } from '../login/actions'

export const menuItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Users', href: '/dashboard/users', icon: Users },
    { name: 'Access Logs', href: '/dashboard/logs', icon: FileText },
    { name: 'Remote Control', href: '/dashboard/remote', icon: Radio },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
]

export function Sidebar() {
    const pathname = usePathname()

    return (
        <aside className="w-64 bg-dark-800 border-r border-dark-700 flex flex-col h-screen fixed left-0 top-0 z-40 hidden md:flex">

            <Link href="/" className="p-6 flex items-center gap-3">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center font-bold text-white">
                    A
                </div>
                <span className="text-xl font-bold tracking-wide">ACS System</span>
            </Link>

            {/* Меню */}
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                {menuItems.map((item) => {
                    const isActive = pathname === item.href

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
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
        </aside>
    )
}