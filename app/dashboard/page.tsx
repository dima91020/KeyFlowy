import { prisma } from '@/app/lib/prisma'
import { verifySession } from '@/app/lib/session'
import { redirect } from 'next/navigation'
import Link from "next/link"
import {
    UsersIcon,
    DocumentTextIcon,
    ArrowRightIcon,
    ComputerDesktopIcon
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
            <div className="p-6 space-y-8 text-white max-w-[1600px] mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                        <p className="text-dark-muted mt-1">
                            Welcome back, <span className="text-white font-medium">{user.name ?? 'Administrator'}</span>
                        </p>
                    </div>
                    <div className="text-sm text-dark-muted font-mono bg-dark-800 px-3 py-1 rounded-lg border border-dark-700">
                        {new Date().toLocaleDateString('en-EN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-dark-800 p-6 rounded-2xl border border-dark-700 shadow-lg relative overflow-hidden group hover:border-dark-600 transition-all">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <UsersIcon className="w-20 h-20" />
                        </div>
                        <h2 className="text-dark-muted font-medium flex items-center gap-2">
                            <UsersIcon className="w-5 h-5" /> Total Employees
                        </h2>
                        <p className="text-4xl font-bold text-white mt-4">{totalUsers}</p>
                    </div>

                    <div className="bg-dark-800 p-6 rounded-2xl border border-dark-700 shadow-lg relative overflow-hidden group hover:border-dark-600 transition-all">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <DocumentTextIcon className="w-20 h-20" />
                        </div>
                        <h2 className="text-dark-muted font-medium flex items-center gap-2">
                            <DocumentTextIcon className="w-5 h-5" /> Access Logs
                        </h2>
                        <p className="text-4xl font-bold text-white mt-4">{totalLogs}</p>
                    </div>

                    <div className="bg-dark-800 p-6 rounded-2xl border border-dark-700 shadow-lg relative overflow-hidden group hover:border-green-500/30 transition-all">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-green-500">
                            <ComputerDesktopIcon className="w-20 h-20" />
                        </div>
                        <h2 className="text-dark-muted font-medium flex items-center gap-2">
                            <ComputerDesktopIcon className="w-5 h-5" /> Active Systems
                        </h2>
                        <div className="flex items-end gap-3 mt-4">
                            <p className={`text-4xl font-bold ${activeSystems > 0 ? 'text-green-400' : 'text-dark-muted'}`}>{activeSystems}</p>
                            <span className="text-sm text-dark-muted mb-1.5">devices online</span>
                        </div>
                    </div>
                </div>

                <LiveDevices initialDevices={devices} />

                <div className="w-full">
                    <WeeklyChart data={weeklyStats} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                        <PeakHoursChart data={peakHours} />
                    </div>
                    <div className="lg:col-span-1">
                        <SecurityChart data={securityStats} />
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    <RecentActivityWrapper initialLogs={initialLogs} adminId={user.id} />

                    <div className="space-y-4">
                        <h3 className="text-xl font-bold mb-6 px-1">Quick Actions</h3>
                        <Link href="/dashboard/users" className="block bg-primary hover:bg-primary-hover p-4 rounded-xl shadow-lg shadow-blue-500/20 transition-all group relative overflow-hidden">
                            <div className="relative z-10 flex justify-between items-center">
                                <span className="font-bold text-lg">Manage Users</span>
                                <ArrowRightIcon className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                            </div>
                            <p className="relative z-10 text-blue-100/80 text-sm mt-1">Add, edit or block employees.</p>
                            <div className="absolute -bottom-4 -right-4 bg-white/10 w-24 h-24 rounded-full blur-xl group-hover:bg-white/20 transition-all" />
                        </Link>
                        <Link href="/dashboard/logs" className="block bg-dark-800 hover:bg-dark-700 border border-dark-700 p-4 rounded-xl transition-all group">
                            <div className="flex justify-between items-center">
                                <span className="font-bold text-lg">View Full Logs</span>
                                <ArrowRightIcon className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                            </div>
                            <p className="text-dark-muted text-sm mt-1">Check full history and exports.</p>
                        </Link>
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