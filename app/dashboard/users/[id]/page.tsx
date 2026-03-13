import { verifySession } from '@/app/lib/session'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, User, Briefcase, CreditCard, Activity, Clock } from 'lucide-react'
import { getUserProfileStatsAction } from '@/app/dashboard/actions'
import { WeeklyChart } from '@/app/ui/dashboard/weekly-chart'
import { LogCard } from '@/app/ui/logs/log-card'

export default async function UserProfilePage({ params }: { params: Promise<{ id: string }> }) {
    const currentUserId = await verifySession()
    if (!currentUserId) redirect('/login')

    const resolvedParams = await params;
    const profileData = await getUserProfileStatsAction(resolvedParams.id)

    if (!profileData) {
        return (
            <div className="p-6 text-center text-white">
                <h1 className="text-2xl font-bold">User not found</h1>
                <Link href="/dashboard/users" className="text-primary hover:underline mt-4 inline-block">
                    Back to users
                </Link>
            </div>
        )
    }

    const { user, recentLogs, weeklyStats, avgWorkHours } = profileData

    return (
        <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
            {/* Кнопка назад */}
            <Link
                href="/dashboard/users"
                className="inline-flex items-center gap-2 text-sm text-dark-muted hover:text-white transition-colors"
            >
                <ChevronLeft size={16} /> Back to Users list
            </Link>

            {/* Карточка інформації про користувача */}
            <div className="bg-dark-800 border border-dark-700 rounded-2xl p-6 shadow-lg flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-dark-700 rounded-full flex items-center justify-center border border-dark-600 overflow-hidden shrink-0">
                        {user.image ? (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img src={user.image} alt={user.name || 'User'} className="w-full h-full object-cover" />
                        ) : (
                            <User size={32} className="text-dark-muted" />
                        )}
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white">{user.name}</h1>
                        <div className="flex items-center gap-4 mt-2 text-sm text-dark-muted">
                            <span className="flex items-center gap-1.5"><Briefcase size={14} /> {user.jobTitle || user.role}</span>
                            <span className="flex items-center gap-1.5"><CreditCard size={14} /> UID: {user.cardUid || 'No card'}</span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-2 min-w-[140px]">
                    <div className={`px-3 py-1.5 rounded-lg border text-center text-xs font-bold tracking-wide uppercase ${
                        user.isActive
                            ? 'bg-green-500/10 text-green-400 border-green-500/20'
                            : 'bg-red-500/10 text-red-400 border-red-500/20'
                    }`}>
                        {user.isActive ? 'Active Account' : 'Blocked'}
                    </div>
                    <div className={`px-3 py-1.5 rounded-lg border text-center text-xs font-bold tracking-wide uppercase ${
                        user.isInside
                            ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                            : 'bg-dark-700/50 text-dark-muted border-dark-600'
                    }`}>
                        {user.isInside ? 'Currently Inside' : 'Outside'}
                    </div>
                    <div className="px-3 py-1.5 rounded-lg border text-center text-xs font-bold tracking-wide uppercase bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-inner">
                        <span className="flex items-center justify-center gap-1.5">
                            <Clock size={12} /> {avgWorkHours}h / day
                        </span>
                    </div>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Персональний графік */}
                <div className="lg:col-span-2">
                    {/* ТУТ ДОДАЄМО showWorkHours */}
                    <WeeklyChart data={weeklyStats} showWorkHours={true} />
                </div>

                {/* Останні проходи */}
                <div className="bg-dark-800 border border-dark-700 rounded-2xl p-6 shadow-lg flex flex-col">
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <Activity size={20} className="text-primary" />
                        Recent Activity
                    </h3>

                    <div className="space-y-3 overflow-y-auto pr-2 custom-scrollbar flex-1">
                        {recentLogs.length === 0 ? (
                            <div className="text-center py-10 text-dark-muted border border-dashed border-dark-700/50 rounded-xl">
                                No recent activity.
                            </div>
                        ) : (
                            recentLogs.map((log) => (
                                /* Тепер TypeScript задоволений на 100% */
                                <LogCard key={log.id} log={log} />
                            ))
                        )}
                    </div>

                    <Link
                        href={`/dashboard/logs?query=${user.name}`}
                        className="mt-4 w-full py-2 bg-dark-900 hover:bg-dark-700 border border-dark-700 rounded-xl text-center text-sm font-medium text-white transition-colors"
                    >
                        View Full History
                    </Link>
                </div>
            </div>
        </div>
    )
}