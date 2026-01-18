import { prisma } from '@/app/lib/prisma'
import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'
import { redirect } from 'next/navigation'
import Link from "next/link";

export default async function Dashboard() {
    const cookieStore = await cookies()
    const token = cookieStore.get('session')?.value

    if (!token) {
        redirect('/login')
    }

    try {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'secret-diploma-key')
        await jwtVerify(token, secret)
    } catch (err) {
        redirect('/login')
    }

    const totalUsers = await prisma.user.count()
    const totalLogs = await prisma.log.count()

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Панель керування</h1>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <h2 className="text-gray-500 font-medium">Всього користувачів</h2>
                        <p className="text-4xl font-bold text-blue-600 mt-2">{totalUsers}</p>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <h2 className="text-gray-500 font-medium">Записів у журналі</h2>
                        <p className="text-4xl font-bold text-purple-600 mt-2">{totalLogs}</p>
                    </div>
                </div>

                <div className="mt-8 flex gap-4">
                    <Link
                        href="/dashboard/users"
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-semibold shadow-md flex items-center gap-2"
                    >
                        👥 Керування користувачами
                    </Link>

                    <Link
                        href="/dashboard/logs"
                        className="bg-white text-gray-700 border border-gray-300 px-6 py-3 rounded-lg hover:bg-gray-50 font-semibold shadow-sm"
                    >
                        📋 Журнал подій (Логи)
                    </Link>
                </div>
            </div>
        </div>
    )
}