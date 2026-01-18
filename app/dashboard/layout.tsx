import Link from 'next/link'
import { LayoutDashboard, Users, FileText, Bell, Settings, LogOut } from 'lucide-react'

export default function DashboardLayout({
                                            children,
                                        }: {
    children: React.ReactNode
}) {
    return (
        <div className="flex h-screen bg-dark-900 text-dark-text overflow-hidden">

            <aside className="w-64 bg-dark-800 border-r border-dark-700 flex flex-col hidden md:flex">

                <div className="p-6 flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center font-bold text-white">
                        A
                    </div>
                    <span className="text-xl font-bold tracking-wide">ACS System</span>
                </div>

                <nav className="flex-1 px-4 py-4 space-y-2">
                    <NavItem href="/dashboard" icon={<LayoutDashboard size={20} />} label="Dashboard" active />
                    <NavItem href="/dashboard/users" icon={<Users size={20} />} label="Users" />
                    <NavItem href="/dashboard/logs" icon={<FileText size={20} />} label="Access Logs" />
                    <NavItem href="/dashboard/alerts" icon={<Bell size={20} />} label="Alerts" />
                    <NavItem href="/dashboard/settings" icon={<Settings size={20} />} label="Settings" />
                </nav>

                <div className="p-4 border-t border-dark-700">
                    <button className="flex items-center gap-3 w-full px-4 py-2 text-dark-muted hover:text-white hover:bg-dark-700 rounded-lg transition-colors">
                        <LogOut size={20} />
                        <span>Вийти</span>
                    </button>
                </div>
            </aside>

            <main className="flex-1 overflow-y-auto p-8">
                {children}
            </main>
        </div>
    )
}

// Маленький компонент для кнопок меню
function NavItem({ href, icon, label, active = false }: { href: string, icon: React.ReactNode, label: string, active?: boolean }) {
    return (
        <Link
            href={href}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                active
                    ? 'bg-primary/10 text-primary border border-primary/20'
                    : 'text-dark-muted hover:bg-dark-700 hover:text-white'
            }`}
        >
            {icon}
            <span className="font-medium">{label}</span>
        </Link>
    )
}