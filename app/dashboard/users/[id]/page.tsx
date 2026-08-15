import { verifySession } from '@/app/lib/session'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
    ChevronLeftIcon,
    UserIcon,
    BriefcaseIcon,
    CreditCardIcon,
    ClockIcon,
    PencilSquareIcon
} from '@heroicons/react/24/outline'
import { getUserProfileStatsAction } from '@/app/dashboard/actions'
import { WeeklyChart } from '@/app/ui/dashboard/weekly-chart'
import { LogCard } from '@/app/ui/logs/log-card'
import { formatGuestTimeRemaining } from '@/app/lib/access-control'
import { Badge } from '@/app/ui/badge'

export default async function UserProfilePage({ params }: { params: Promise<{ id: string }> }) {
    const currentUserId = await verifySession()
    if (!currentUserId) redirect('/login')

    const resolvedParams = await params;
    const profileData = await getUserProfileStatsAction(resolvedParams.id)

    if (!profileData) {
        return (
            <div className="p-8 text-center text-slate-900">
                <h1 className="text-xl font-bold">User not found</h1>
                <Link href="/dashboard/users" className="text-slate-600 hover:underline text-sm mt-2 inline-block">
                    ← Back to users
                </Link>
            </div>
        )
    }

    const { user, recentLogs, weeklyStats, avgWorkHours } = profileData

    const now = new Date();
    const validUntil = user.validUntil ? new Date(user.validUntil) : null;
    const isExpired = validUntil ? now.getTime() > validUntil.getTime() : false;
    const isActuallyActive = user.isActive && !isExpired;
    const timeLeftString = user.role === 'GUEST' ? formatGuestTimeRemaining(validUntil, now) : null;

    return (
        <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
                <Link
                    href="/dashboard/users"
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors"
                >
                    <ChevronLeftIcon className="w-3.5 h-3.5" /> Back to Users
                </Link>

                <Link
                    href={`/dashboard/users/${user.id}/edit`}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
                >
                    <PencilSquareIcon className="w-3.5 h-3.5" /> Edit Profile
                </Link>
            </div>

            {/* Profile Overview Card */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center border border-slate-200 text-slate-600 font-bold text-base overflow-hidden shrink-0">
                        {user.image ? (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img src={user.image} alt={user.name || 'User'} className="w-full h-full object-cover" />
                        ) : (
                            <UserIcon className="w-7 h-7 text-slate-400" />
                        )}
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-slate-900">{user.name}</h1>
                        <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-slate-500">
                            <span className="flex items-center gap-1"><BriefcaseIcon className="w-3.5 h-3.5 text-slate-400" /> {user.jobTitle || user.role}</span>
                            <span className="flex items-center gap-1"><CreditCardIcon className="w-3.5 h-3.5 text-slate-400" /> UID: <strong className="font-mono text-slate-800">{user.cardUid || 'None'}</strong></span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs">
                    <Badge
                        variant={!user.isActive ? 'danger' : isExpired ? 'warning' : 'success'}
                        dot
                    >
                        {!user.isActive ? 'Blocked' : isExpired ? 'Expired' : 'Active'}
                    </Badge>

                    {timeLeftString && (
                        <Badge variant="warning" dot icon={<ClockIcon className="w-3.5 h-3.5" />}>
                            {timeLeftString}
                        </Badge>
                    )}

                    <Badge variant="neutral" dot>
                        {user.isInside ? 'Inside Facility' : 'Outside'}
                    </Badge>

                    {user.role !== 'GUEST' && (
                        <Badge variant="neutral" icon={<ClockIcon className="w-3.5 h-3.5 text-slate-400" />}>
                            Avg: {avgWorkHours}h / day
                        </Badge>
                    )}
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <WeeklyChart data={weeklyStats} showWorkHours={true} />
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col">
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">
                        Recent Access Logs
                    </h3>

                    <div className="space-y-2.5 overflow-y-auto flex-1 max-h-[340px]">
                        {recentLogs.length === 0 ? (
                            <div className="text-center py-10 text-xs text-slate-400 border border-dashed border-slate-200 rounded-lg">
                                No activity recorded.
                            </div>
                        ) : (
                            recentLogs.map((log) => (
                                <LogCard key={log.id} log={log} />
                            ))
                        )}
                    </div>

                    <Link
                        href={`/dashboard/logs?query=${encodeURIComponent(user.name || '')}`}
                        className="mt-3 w-full py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-center text-xs font-medium text-slate-700 transition-colors"
                    >
                        View Full Filtered Logs →
                    </Link>
                </div>
            </div>
        </div>
    )
}