import { prisma } from '@/app/lib/prisma'
import { notFound } from 'next/navigation'
import { ChevronLeftIcon, ClockIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import { EditUserForm } from './edit-form'
import { verifySession } from '@/app/lib/session'
import { Badge } from '@/app/ui/badge'

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
        <div className="max-w-4xl mx-auto p-6 md:p-8 space-y-6">
            <Link
                href="/dashboard/users"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors"
            >
                <ChevronLeftIcon className="w-3.5 h-3.5" /> Back to Users
            </Link>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-slate-200">
                <h1 className="text-xl font-bold text-slate-900">
                    Edit Profile: <span className="font-semibold text-slate-700">{user.name}</span>
                </h1>

                <Badge variant={user.isActive ? 'success' : 'danger'} dot>
                    {user.isActive ? 'Active Access' : 'Access Blocked'}
                </Badge>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                    <EditUserForm user={user} currentUserId={currentUserId} />
                </div>

                <div className="space-y-6">
                    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                            <ClockIcon className="w-4 h-4 text-slate-400" /> Recent Passes
                        </h3>

                        <div className="space-y-3">
                            {user.logs.length === 0 ? (
                                <p className="text-slate-400 text-xs">No activity recorded yet.</p>
                            ) : (
                                user.logs.map(log => (
                                    <div key={log.id} className="text-xs pb-2.5 border-b border-slate-100 last:border-0 last:pb-0 space-y-0.5">
                                        <div className="flex items-center justify-between">
                                            <Badge size="sm" variant={log.accessGranted ? 'success' : 'danger'} dot>
                                                {log.accessGranted ? 'Granted' : 'Denied'}
                                            </Badge>
                                            <span className="text-slate-400 font-mono">
                                                {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                        <p className="text-slate-500 truncate">
                                            {log.device?.name || 'Unknown Device'}
                                        </p>
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