import { prisma } from '@/app/lib/prisma'
import { PlusIcon, UserIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import { verifySession } from '@/app/lib/session'
import { redirect } from 'next/navigation'
import { Search } from '@/app/ui/users/search'
import { LiveListener } from './live-listener'
import { DeviceFilter } from '@/app/ui/device/device-filter'
import { Prisma } from '@prisma/client'
import { UserCard } from '@/app/ui/users/user-card'

async function getUsers(adminId: string, query: string, deviceId: string) {
    const where: Prisma.UserWhereInput = {
        OR: [
            { adminId: adminId },
            { id: adminId }
        ]
    };

    const andConditions: Prisma.UserWhereInput[] = [];

    if (query) {
        andConditions.push({
            OR: [
                { name: { contains: query, mode: 'insensitive' } },
                { email: { contains: query, mode: 'insensitive' } },
                { cardUid: { contains: query, mode: 'insensitive' } },
                { jobTitle: { contains: query, mode: 'insensitive' } },
            ]
        });
    }

    if (deviceId) {
        andConditions.push({
            allowedDevices: {
                some: { id: deviceId }
            }
        });
    }

    if (andConditions.length > 0) {
        where.AND = andConditions;
    }

    return await prisma.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: {
            logs: {
                where: {
                    direction: 'ENTRY',
                    accessGranted: true
                },
                orderBy: { timestamp: 'desc' },
                take: 1,
                include: { device: true }
            }
        }
    });
}

async function getAdminDevices(adminId: string) {
    return await prisma.device.findMany({
        where: { adminId },
        select: { id: true, name: true },
        orderBy: { name: 'asc' }
    })
}

export default async function UsersPage({
    searchParams,
}: {
    searchParams?: Promise<{ query?: string; device?: string }>;
}) {
    const currentUserId = await verifySession()
    if (!currentUserId) redirect('/login')

    const params = await searchParams;
    const query = params?.query || '';
    const deviceId = params?.device || '';

    const [users, devices] = await Promise.all([
        getUsers(currentUserId, query, deviceId),
        getAdminDevices(currentUserId)
    ])

    return (
        <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
            <LiveListener />

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-200">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Users & Access</h1>
                    <p className="text-slate-500 text-sm mt-0.5">Manage personnel, guest visitors, and RFID credentials.</p>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <span className="text-xs font-medium text-slate-500 bg-white px-3 py-2 rounded-lg border border-slate-200 shadow-sm hidden sm:inline-block">
                        Total: <strong className="text-slate-900">{users.length}</strong>
                    </span>

                    <Link
                        href="/dashboard/users/new"
                        className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-colors shadow-sm w-full sm:w-auto justify-center"
                    >
                        <PlusIcon className="w-4 h-4" />
                        Add Person
                    </Link>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-3 w-full bg-white p-3 rounded-xl border border-slate-200 items-center shadow-sm">
                <div className="flex-1 w-full">
                    <Search placeholder="Search by name, role or card UID..." />
                </div>
                {devices.length > 0 && (
                    <div className="w-full md:w-auto">
                        <DeviceFilter devices={devices} />
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {users.map((user) => (
                    <UserCard key={user.id} user={user} currentUserId={currentUserId} />
                ))}
            </div>

            {users.length === 0 && (
                <div className="text-center py-16 text-slate-500 border border-dashed border-slate-200 rounded-xl bg-white p-8">
                    <UserIcon className="w-10 h-10 mx-auto mb-3 text-slate-300" />
                    <h3 className="text-base font-semibold text-slate-900 mb-1">No users found</h3>
                    <p className="text-xs text-slate-500">Try adjusting your search query or device filter.</p>
                </div>
            )}
        </div>
    )
}