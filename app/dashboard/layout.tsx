import { Sidebar } from './sidebar'
import { MobileSidebar } from './mobile-sidebar'
import { redirect } from 'next/navigation'
import { prisma } from '@/app/lib/prisma'
import { verifySession } from '@/app/lib/session'
import { ShieldCheckIcon, ArrowRightStartOnRectangleIcon } from '@heroicons/react/24/outline'
import { logoutAction } from '../login/actions'

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

    // 1. ADMIN LAYOUT (with left sidebar)
    if (user.role === 'ADMIN') {
        return (
            <div className="min-h-screen bg-slate-50 text-slate-900 flex">
                <Sidebar />

                <div className="md:ml-60 w-full min-h-screen flex flex-col">
                    <header className="h-14 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-30">
                        <MobileSidebar />

                        <div className="md:hidden font-bold text-sm text-slate-900 absolute left-1/2 -translate-x-1/2">
                            Smart ACS
                        </div>

                        <div className="flex items-center gap-3 ml-auto">
                            <div className="text-right hidden sm:block leading-tight">
                                <p className="text-xs font-semibold text-slate-900">
                                    {user.name ?? 'Administrator'}
                                </p>
                                <p className="text-[10px] text-slate-500 font-medium">{user.role}</p>
                            </div>
                            <div className="w-8 h-8 bg-slate-100 border border-slate-200 rounded-full flex items-center justify-center text-slate-800 font-bold text-xs">
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

    // 2. EMPLOYEE LAYOUT (clean top bar)
    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
            <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-30">
                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-slate-900 rounded-lg flex items-center justify-center text-white">
                        <ShieldCheckIcon className="w-4 h-4" />
                    </div>
                    <span className="font-bold text-sm text-slate-900 tracking-tight">Smart ACS</span>
                </div>

                <div className="flex items-center gap-4 ml-auto">
                    <div className="text-right hidden sm:block leading-tight">
                        <p className="text-xs font-semibold text-slate-900">
                            {user.name}
                        </p>
                        <p className="text-[10px] text-slate-500">Employee Portal</p>
                    </div>
                    <div className="w-8 h-8 bg-slate-100 border border-slate-200 rounded-full flex items-center justify-center text-slate-800 font-bold text-xs">
                        {(user.name ?? 'E').charAt(0).toUpperCase()}
                    </div>

                    <div className="h-5 w-px bg-slate-200"></div>

                    <form action={logoutAction}>
                        <button
                            type="submit"
                            className="text-slate-500 hover:text-slate-900 flex items-center gap-1 text-xs font-medium py-1 px-2 rounded-md hover:bg-slate-100 transition-colors"
                        >
                            <ArrowRightStartOnRectangleIcon className="w-3.5 h-3.5" />
                            <span>Sign Out</span>
                        </button>
                    </form>
                </div>
            </header>

            <main className="flex-1">
                {children}
            </main>
        </div>
    )
}