import { prisma } from '@/app/lib/prisma' // Виправив шлях імпорту
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from "next/link"
import { Users, FileText, Activity, ArrowRight, ShieldCheck } from 'lucide-react'

export default async function Dashboard() {
    const cookieStore = await cookies()
    const userId = cookieStore.get('session')?.value

    if (!userId) {
        redirect('/login')
    }

    const user = await prisma.user.findUnique({
        where: { id: userId }
    })

    if (!user) {
        redirect('/login')
    }

    const totalUsers = await prisma.user.count()
    const totalLogs = await prisma.log.count()

    const recentLogs = await prisma.log.findMany({
        take: 5,
        orderBy: { timestamp: 'desc' },
        include: { user: true }
    })

    return (
        <div className="p-6 space-y-8 text-white">

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Dashboard</h1>
                    <p className="text-dark-muted mt-1">
                        Welcome back, <span className="text-white font-medium">{user.name ?? 'Administrator'}</span>
                    </p>
                </div>
                <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 px-4 py-2 rounded-full text-green-400 text-sm font-medium">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    System Online
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                <div className="bg-dark-800 p-6 rounded-2xl border border-dark-700 shadow-lg relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Users size={80} />
                    </div>
                    <h2 className="text-dark-muted font-medium flex items-center gap-2">
                        <Users size={18} /> Total Users
                    </h2>
                    <p className="text-4xl font-bold text-white mt-4">{totalUsers}</p>
                </div>

                <div className="bg-dark-800 p-6 rounded-2xl border border-dark-700 shadow-lg relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <FileText size={80} />
                    </div>
                    <h2 className="text-dark-muted font-medium flex items-center gap-2">
                        <FileText size={18} /> Access Logs
                    </h2>
                    <p className="text-4xl font-bold text-white mt-4">{totalLogs}</p>
                </div>

                <div className="bg-dark-800 p-6 rounded-2xl border border-dark-700 shadow-lg relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <ShieldCheck size={80} />
                    </div>
                    <h2 className="text-dark-muted font-medium flex items-center gap-2">
                        <ShieldCheck size={18} /> Security Level
                    </h2>
                    <p className="text-4xl font-bold text-green-400 mt-4">High</p>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">

                <div className="lg:col-span-2 bg-dark-800 border border-dark-700 rounded-2xl p-6 shadow-lg">
                    <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <Activity size={20} className="text-primary" />
                        Recent Activity
                    </h3>

                    <div className="space-y-4">
                        {recentLogs.length > 0 ? (
                            recentLogs.map((log) => (
                                <div key={log.id} className="flex items-center justify-between p-4 bg-dark-900/50 rounded-xl border border-dark-700/50">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-2 h-2 rounded-full ${log.accessGranted ? 'bg-green-500' : 'bg-red-500'}`} />
                                        <div>
                                            <p className="font-medium text-sm">
                                                {log.user?.name ?? 'Unknown User'}
                                            </p>
                                            <p className="text-xs text-dark-muted">UID: {log.cardUid}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className={`text-xs font-bold px-2 py-1 rounded ${log.accessGranted ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                                            {log.accessGranted ? 'GRANTED' : 'DENIED'}
                                        </span>
                                        <p className="text-xs text-dark-muted mt-1">
                                            {new Date(log.timestamp).toLocaleTimeString()}
                                        </p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-dark-muted text-center py-4">No activity recorded yet.</p>
                        )}
                    </div>
                </div>

                <div className="space-y-4">
                    <h3 className="text-xl font-bold mb-6 px-1">Quick Actions</h3>

                    <Link
                        href="/dashboard/users"
                        className="block bg-primary hover:bg-primary-hover p-4 rounded-xl shadow-lg shadow-blue-500/20 transition-all group"
                    >
                        <div className="flex justify-between items-center">
                            <span className="font-bold text-lg">Manage Users</span>
                            <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                        </div>
                        <p className="text-blue-100/80 text-sm mt-1">Add, edit or remove access.</p>
                    </Link>

                    <Link
                        href="/dashboard/logs"
                        className="block bg-dark-700 hover:bg-dark-600 border border-dark-600 p-4 rounded-xl transition-all group"
                    >
                        <div className="flex justify-between items-center">
                            <span className="font-bold text-lg text-gray-200">View Full Logs</span>
                            <ArrowRight className="text-gray-400 group-hover:translate-x-1 transition-transform" />
                        </div>
                        <p className="text-dark-muted text-sm mt-1">Check history and exports.</p>
                    </Link>
                </div>
            </div>
        </div>
    )
}