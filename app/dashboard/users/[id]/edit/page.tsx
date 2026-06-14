import { prisma } from '@/app/lib/prisma'
import { notFound } from 'next/navigation'
import { ChevronLeftIcon, ClockIcon, NoSymbolIcon, CheckCircleIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import { EditUserForm } from './edit-form'
import { verifySession } from '@/app/lib/session'

export default async function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const currentUserId = await verifySession();

    const user = await prisma.user.findUnique({
        where: { id },
        include: {
            logs: {
                take: 5,
                orderBy: { timestamp: 'desc' },
                include: { device: true }
            }
        }
    })

    if (!user) {
        notFound()
    }

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6 md:space-y-8">
            <Link
                href="/dashboard/users"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-dark-muted hover:text-white transition-colors w-fit"
            >
                <ChevronLeftIcon className="w-4 h-4" />
                <span>Back to List</span>
            </Link>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h1 className="text-2xl md:text-3xl font-bold text-white flex flex-col md:flex-row md:items-center gap-2 md:gap-3 break-all">
                    <span>Edit User:</span>
                    <span className="text-primary">{user.name}</span>
                </h1>

                <div className={`shrink-0 px-4 py-2 rounded-xl border flex items-center gap-2 font-bold ${
                    user.isActive
                        ? 'bg-green-500/10 border-green-500/20 text-green-400'
                        : 'bg-red-500/10 border-red-500/20 text-red-400'
                }`}>
                    {user.isActive ? <CheckCircleIcon className="w-5 h-5" /> : <NoSymbolIcon className="w-5 h-5" />}
                    {user.isActive ? 'ACTIVE ACCESS' : 'ACCESS BLOCKED'}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
                <div className="lg:col-span-2 bg-dark-800 border border-dark-700 rounded-2xl p-4 md:p-6">
                    <EditUserForm user={user} currentUserId={currentUserId} />
                </div>

                <div className="space-y-6">
                    <div className="bg-dark-800 border border-dark-700 rounded-2xl p-4 md:p-6">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <ClockIcon className="w-5 h-5 text-primary" /> Recent Access
                        </h3>

                        <div className="space-y-4">
                            {user.logs.length === 0 ? (
                                <p className="text-dark-muted text-sm">No activity recorded yet.</p>
                            ) : (
                                user.logs.map(log => (
                                    <div key={log.id} className="flex items-start gap-3 text-sm pb-3 border-b border-dark-700 last:border-0 last:pb-0">
                                        <div className={`w-2 h-2 mt-1.5 rounded-full shrink-0 ${log.accessGranted ? 'bg-green-500' : 'bg-red-500'}`} />
                                        <div className="overflow-hidden">
                                            <p className="text-white font-medium truncate">
                                                {log.accessGranted ? 'Access Granted' : 'Access Denied'}
                                            </p>
                                            <p className="text-xs text-dark-muted">
                                                {new Date(log.timestamp).toLocaleString()}
                                            </p>
                                            <p className="text-xs text-dark-muted mt-0.5 truncate">
                                                @ {log.device?.name || 'Unknown Device'}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}