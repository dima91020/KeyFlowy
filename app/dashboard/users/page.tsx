import { prisma } from '@/app/lib/prisma'
import { Plus, Trash2, User as UserIcon, Shield, Ban, MapPin, MapPinOff, Eye, Pencil } from 'lucide-react'
import Link from 'next/link'
import { deleteUserAction } from './actions'
import { verifySession } from '@/app/lib/session'
import { redirect } from 'next/navigation'
import { Search } from '@/app/ui/users/search'
import { LiveListener } from './live-listener'

// Функція для пошуку
async function getUsers(query: string) {
    if (query) {
        return await prisma.user.findMany({
            where: {
                OR: [
                    { name: { contains: query, mode: 'insensitive' } },
                    { email: { contains: query, mode: 'insensitive' } },
                    { cardUid: { contains: query, mode: 'insensitive' } },
                    { jobTitle: { contains: query, mode: 'insensitive' } },
                ]
            },
            orderBy: { createdAt: 'desc' }
        })
    }
    return await prisma.user.findMany({
        orderBy: { createdAt: 'desc' }
    })
}

export default async function UsersPage({
                                            searchParams,
                                        }: {
    searchParams?: Promise<{ query?: string }>;
}) {
    // Перевірка сесії
    const currentUserId = await verifySession()
    if (!currentUserId) redirect('/login')

    // Отримуємо пошуковий запит
    const params = await searchParams;
    const query = params?.query || '';

    // Отримуємо юзерів
    const users = await getUsers(query)

    return (
        <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
            <LiveListener />

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white">Users Management</h1>
                    <p className="text-dark-muted mt-1">Manage employees and their access cards.</p>
                </div>

                <Link
                    href="/dashboard/users/new"
                    className="bg-primary hover:bg-blue-600 text-white px-4 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all shadow-lg shadow-blue-500/20"
                >
                    <Plus size={20} />
                    Add Employee
                </Link>
            </div>

            {/* Пошук */}
            <div className="w-full md:w-1/3">
                <Search placeholder="Search by name, position or card UID..." />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {users.map((user) => {
                    const isCurrentUser = user.id === currentUserId

                    // Стилі картки (темна або червонувата)
                    const cardStyles = user.isActive
                        ? "bg-dark-800 border-dark-700 hover:border-dark-600"
                        : "bg-red-900/10 border-red-900/30 opacity-80"

                    return (
                        <div key={user.id} className={`border rounded-2xl p-5 transition-all group relative flex flex-col ${cardStyles}`}>

                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-4">
                                    {/* Аватарка */}
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center border overflow-hidden shrink-0 ${
                                        user.isActive
                                            ? "bg-dark-700 border-dark-600"
                                            : "bg-dark-800 border-red-900/30 grayscale opacity-60"
                                    }`}>
                                        {user.image ? (
                                            /* eslint-disable-next-line @next/next/no-img-element */
                                            <img src={user.image} alt={user.name || 'User'} className="w-full h-full object-cover" />
                                        ) : (
                                            <UserIcon className="text-dark-muted" size={24} />
                                        )}
                                    </div>

                                    <div>
                                        <h3 className={`font-bold text-lg leading-tight flex flex-wrap items-center gap-2 mb-1 ${!user.isActive ? "text-red-200" : "text-white"}`}>
                                            {user.name || 'Unnamed'}
                                            {isCurrentUser && <span className="text-dark-muted text-xs font-normal border border-dark-700 px-1.5 py-0.5 rounded">(You)</span>}

                                            {/* Бейдж локації */}
                                            {user.isActive && (
                                                user.isInside ? (
                                                    <span className="flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 uppercase tracking-wider">
                                                        <MapPin size={10} /> В офісі
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-dark-700 text-dark-400 border border-dark-600 uppercase tracking-wider">
                                                        <MapPinOff size={10} /> Ззовні
                                                    </span>
                                                )
                                            )}
                                        </h3>
                                        <p className="text-sm text-dark-muted line-clamp-1">
                                            {user.jobTitle || 'No Job Title'}
                                        </p>
                                    </div>
                                </div>

                                {/* Бейджі статусів (Admin, Blocked) */}
                                <div className="flex flex-col items-end gap-1 shrink-0">
                                    {user.role === 'ADMIN' && (
                                        <span className="px-2 py-1 rounded-lg bg-purple-500/10 text-purple-400 text-xs font-bold border border-purple-500/20 flex items-center gap-1">
                                            <Shield size={10} /> ADMIN
                                        </span>
                                    )}

                                    {!user.isActive && (
                                        <span className="px-2 py-1 rounded-lg bg-red-500 text-white text-[10px] font-black tracking-wider uppercase shadow-lg shadow-red-900/50 flex items-center gap-1">
                                            <Ban size={10} /> BLOCKED
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Інфо картки та пошти */}
                            <div className="space-y-2 bg-dark-900/50 p-3 rounded-xl border border-dark-700/50 mb-4 flex-1">
                                <div className="flex justify-between text-sm">
                                    <span className="text-dark-muted">Card UID:</span>
                                    <span className={`font-mono tracking-wider ${!user.isActive ? "text-red-300/50 line-through" : "text-white"}`}>
                                        {user.cardUid || '-'}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-dark-muted">Email:</span>
                                    <span className="text-white truncate max-w-[150px]" title={user.email || ''}>
                                        {user.email || '-'}
                                    </span>
                                </div>
                            </div>

                            {/* Кнопки дій */}
                            <div className="flex gap-2 mt-auto">
                                <Link
                                    href={`/dashboard/users/${user.id}`}
                                    className="flex-1 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 py-2 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2"
                                >
                                    <Eye size={16} />
                                    Stats
                                </Link>

                                <Link
                                    href={`/dashboard/users/${user.id}/edit`}
                                    className="bg-dark-700 hover:bg-dark-600 text-white p-2 rounded-xl transition-colors border border-dark-600 w-10 flex items-center justify-center"
                                    title="Edit User"
                                >
                                    <Pencil size={18} />
                                </Link>

                                {!isCurrentUser && (
                                    <form action={deleteUserAction}>
                                        <input type="hidden" name="id" value={user.id} />
                                        <button
                                            type="submit"
                                            className="bg-red-500/10 hover:bg-red-500/20 text-red-400 p-2 rounded-xl transition-colors border border-red-500/10 h-full w-10 flex items-center justify-center"
                                            title="Delete User"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </form>
                                )}
                            </div>

                        </div>
                    )
                })}
            </div>

            {users.length === 0 && (
                <div className="text-center py-20 text-dark-muted border border-dashed border-dark-700 rounded-2xl">
                    <UserIcon size={48} className="mx-auto mb-3 opacity-20" />
                    <p>No users found matching &quot;{query}&quot;</p>
                </div>
            )}
        </div>
    )
}