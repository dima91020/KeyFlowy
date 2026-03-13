import { Sidebar } from './sidebar'
import { MobileSidebar } from './mobile-sidebar'
import { redirect } from 'next/navigation'
import { prisma } from '@/app/lib/prisma'
import { verifySession } from '@/app/lib/session'

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

    return (
        <div className="min-h-screen bg-dark-900 text-white flex">

            <Sidebar />

            <div className="md:ml-64 w-full min-h-screen flex flex-col">

                <header className="h-16 bg-dark-800/50 backdrop-blur border-b border-dark-700 flex items-center justify-between px-6 sticky top-0 z-30">

                    <MobileSidebar />

                    <div className="md:hidden font-bold absolute left-1/2 -translate-x-1/2">
                        SecurePass
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