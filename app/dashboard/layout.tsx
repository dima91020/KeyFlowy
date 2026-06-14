import { Sidebar } from './sidebar'
import { MobileSidebar } from './mobile-sidebar'
import { redirect } from 'next/navigation'
import { prisma } from '@/app/lib/prisma'
import { verifySession } from '@/app/lib/session'
import { ShieldCheckIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline'

export default async function DashboardLayout({
                                                  children,
                                              }: {
    children: React.ReactNode
}) {
    const userId = await verifySession()

    if (!userId) {
        redirect('/login')
    }

    const user = await prisma.user.findUnique({
        where: { id: userId }
    })

    if (!user) redirect('/login')

    // 1. ЛЕЙАУТ АДМІНІСТРАТОРА (з бічною панеллю)
    if (user.role === 'ADMIN') {
        return (
            <div className="min-h-screen bg-dark-900 text-white flex">
                <Sidebar />

                <div className="md:ml-64 w-full min-h-screen flex flex-col">
                    <header className="h-16 bg-dark-800/50 backdrop-blur border-b border-dark-700 flex items-center justify-between px-6 sticky top-0 z-30">
                        <MobileSidebar />

                        <div className="md:hidden font-bold absolute left-1/2 -translate-x-1/2">
                            ACS
                        </div>

                        <div className="flex items-center gap-3 ml-auto">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-medium text-white">
                                    {user.name ?? 'Administrator'}
                                </p>
                                <p className="text-xs text-dark-muted">{user.role}</p>
                            </div>
                            <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center border border-primary/20 text-primary font-bold">
                                {(user.name ?? 'A').charAt(0).toUpperCase()}
                            </div>
                        </div>
                    </header>

                    <main className="flex-1">
                        {children}
                    </main>
                </div>
            </div>
        )
    }

    // 2. ЛЕЙАУТ ПРАЦІВНИКА (без бічної панелі, на всю ширину)
    return (
        <div className="min-h-screen bg-dark-900 text-white flex flex-col">
            <header className="h-16 bg-dark-800/50 backdrop-blur border-b border-dark-700 flex items-center justify-between px-6 sticky top-0 z-30">
                <div className="flex items-center gap-2">
                    <ShieldCheckIcon className="text-primary w-6 h-6" />
                    <span className="font-bold text-lg hidden sm:inline">ACS</span>
                </div>

                <div className="flex items-center gap-4 ml-auto">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-medium text-white">
                            {user.name}
                        </p>
                        <p className="text-xs text-dark-muted">Employee</p>
                    </div>
                    <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center border border-primary/20 text-primary font-bold">
                        {(user.name ?? 'E').charAt(0).toUpperCase()}
                    </div>

                    <div className="h-8 w-px bg-dark-700 mx-1"></div>

                    {/* Якщо в тебе є окремий Server Action для логауту, можеш огорнути цю кнопку у <form action={logoutAction}> */}
                    <a href="/login" className="text-dark-muted hover:text-red-400 transition-colors flex items-center gap-2 text-sm font-medium bg-dark-900/50 px-3 py-2 rounded-lg border border-dark-700">
                        <ArrowRightOnRectangleIcon className="w-4 h-4" />
                        <span className="hidden sm:inline">Log Out</span>
                    </a>
                </div>
            </header>

            <main className="flex-1">
                {children}
            </main>
        </div>
    )
}