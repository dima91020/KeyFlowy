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
        <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
            <LiveListener />

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white">Users Management</h1>
                    <p className="text-dark-muted mt-1">Manage employees and their access cards.</p>
                </div>

                <div className="flex flex-wrap gap-3">
                    <Link
                        href="/dashboard/users/new"
                        className="bg-primary hover:bg-blue-600 text-white px-4 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all shadow-lg shadow-blue-500/20"
                    >
                        <PlusIcon className="w-5 h-5" />
                        Add Employee
                    </Link>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-3 w-full bg-dark-800/50 p-3 rounded-2xl border border-dark-700/50 items-center">
                <div className="flex-1 w-full max-w-md">
                    <Search placeholder="Search by name, position or card UID..." />
                </div>
                {devices.length > 0 && (
                    <div className="w-full md:w-auto">
                        <DeviceFilter devices={devices} />
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {users.map((user) => (
                    <UserCard key={user.id} user={user} currentUserId={currentUserId} />
                ))}
            </div>

            {users.length === 0 && (
                <div className="text-center py-20 text-dark-muted border border-dashed border-dark-700 rounded-2xl bg-dark-800/50">
                    <UserIcon className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <p className="text-lg">No users found</p>
                    <p className="text-sm mt-1">Try adjusting your search or device filters.</p>
                </div>
            )}
        </div>
    )
}