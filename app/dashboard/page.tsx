import { prisma } from '@/app/lib/prisma'
import { verifySession } from '@/app/lib/session'
import { redirect } from 'next/navigation'
import Link from "next/link"
import {
    UsersIcon,
    DocumentTextIcon,
    ArrowRightIcon,
    CpuChipIcon
} from '@heroicons/react/24/outline'
import { RecentActivityWrapper } from './recent-activity-wrapper'
import { getRecentLogsAction, getWeeklyStatsAction, getPeakHoursAction, getSecurityStatsAction, LogWithDetails } from './actions'
import { WeeklyChart } from '@/app/ui/dashboard/weekly-chart'
import { PeakHoursChart } from '@/app/ui/dashboard/peak-hours-chart'
import { SecurityChart } from '@/app/ui/dashboard/security-chart'
import { EmployeePortal } from '@/app/ui/dashboard/employee-portal'
import { LiveDevices } from '@/app/ui/dashboard/live-devices'

export default async function Dashboard() {
    const userId = await verifySession()
    if (!userId) redirect('/login')

    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { allowedDevices: true }
    })

    if (!user) redirect('/login')

    if (user.role === 'ADMIN') {
        const totalUsers = await prisma.user.count({ where: { adminId: user.id } })
        const activeSystems = await prisma.device.count({ where: { adminId: user.id, isOnline: true } })
        const totalLogs = await prisma.log.count({
            where: { device: { adminId: user.id } }
        })

        const devices = await prisma.device.findMany({
            where: { adminId: user.id },
            orderBy: { name: 'asc' },
            select: {
                id: true,
                name: true,
                macAddress: true,
                isOnline: true
            }
        })

        const initialLogs: LogWithDetails[] = await getRecentLogsAction(user.id)
        const weeklyStats = await getWeeklyStatsAction(user.id)
        const peakHours = await getPeakHoursAction(user.id)
        const securityStats = await getSecurityStatsAction(user.id)

        return (
            <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-200">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Overview</h1>
                        <p className="text-slate-500 text-sm mt-0.5">
                            Welcome back, <span className="text-slate-900 font-medium">{user.name ?? 'Administrator'}</span>
                        </p>
                    </div>
                    <div className="text-xs text-slate-500 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm font-medium">
                        {new Date().toLocaleDateString('en-GB', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                    </div>
                </div>

                {/* Key Metric Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                        <div className="flex items-center justify-between text-slate-500 mb-2">
                            <span className="text-xs font-medium uppercase tracking-wider">Total Employees</span>
                            <UsersIcon className="w-4 h-4 text-slate-400" />
                        </div>
                        <p className="text-3xl font-bold text-slate-900 tracking-tight">{totalUsers}</p>
                    </div>

                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                        <div className="flex items-center justify-between text-slate-500 mb-2">
                            <span className="text-xs font-medium uppercase tracking-wider">Access Logs</span>
                            <DocumentTextIcon className="w-4 h-4 text-slate-400" />
                        </div>
                        <p className="text-3xl font-bold text-slate-900 tracking-tight">{totalLogs}</p>
                    </div>

                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                        <div className="flex items-center justify-between text-slate-500 mb-2">
                            <span className="text-xs font-medium uppercase tracking-wider">Active Devices</span>
                            <CpuChipIcon className="w-4 h-4 text-slate-400" />
                        </div>
                        <div className="flex items-baseline gap-2">
                            <p className="text-3xl font-bold text-slate-900 tracking-tight">{activeSystems}</p>
                            <span className="text-xs text-slate-500 font-medium">online</span>
                        </div>
                    </div>
                </div>

                {/* Live Devices Status */}
                <LiveDevices initialDevices={devices} />

                {/* Weekly Traffic Chart */}
                <WeeklyChart data={weeklyStats} />

                {/* Secondary Charts: Peak Hours + Security Breakdown */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                    <div className="lg:col-span-2">
                        <PeakHoursChart data={peakHours} />
                    </div>
                    <div className="lg:col-span-1">
                        <SecurityChart data={securityStats} />
                    </div>
                </div>

                {/* Recent Activity & Quick Navigation */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                    <div className="lg:col-span-2">
                        <RecentActivityWrapper initialLogs={initialLogs} adminId={user.id} />
                    </div>

                    <div className="space-y-4">
                        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
                            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Quick Actions</h3>

                            <Link
                                href="/dashboard/users"
                                className="flex items-center justify-between p-3 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors group"
                            >
                                <div>
                                    <p className="text-sm font-semibold text-slate-900">Manage Users</p>
                                    <p className="text-xs text-slate-500">Add, edit, or revoke credentials</p>
                                </div>
                                <ArrowRightIcon className="w-4 h-4 text-slate-400 group-hover:text-slate-900 transition-colors" />
                            </Link>

                            <Link
                                href="/dashboard/devices"
                                className="flex items-center justify-between p-3 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors group"
                            >
                                <div>
                                    <p className="text-sm font-semibold text-slate-900">Manage Devices</p>
                                    <p className="text-xs text-slate-500">Configure relays & unlock doors</p>
                                </div>
                                <ArrowRightIcon className="w-4 h-4 text-slate-400 group-hover:text-slate-900 transition-colors" />
                            </Link>

                            <Link
                                href="/dashboard/logs"
                                className="flex items-center justify-between p-3 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors group"
                            >
                                <div>
                                    <p className="text-sm font-semibold text-slate-900">View Full Logs</p>
                                    <p className="text-xs text-slate-500">Audit trail and CSV exports</p>
                                </div>
                                <ArrowRightIcon className="w-4 h-4 text-slate-400 group-hover:text-slate-900 transition-colors" />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return <EmployeePortal user={{
        ...user,
        name: user.name ?? 'Employee'
    }} />
}