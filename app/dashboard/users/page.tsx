import { prisma } from '@/app/lib/prisma'
import { revalidatePath } from 'next/cache'
import { Search, Plus, Edit2, Trash2, MoreVertical } from 'lucide-react'

export default async function UsersPage() {
    const users = await prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        where: { role: 'USER' }
    })

    async function deleteUser(formData: FormData) {
        'use server'
        const id = formData.get('id') as string

        try {
            await prisma.log.deleteMany({ where: { userId: id } })
            await prisma.user.delete({ where: { id } })
            revalidatePath('/dashboard/users')
        } catch (e) {
            console.error("Помилка видалення:", e)
        }
    }

    return (
        <div className="space-y-6">

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h1 className="text-2xl font-bold text-white">Users List</h1>

                <button className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-blue-500/20 font-medium">
                    <Plus size={18} />
                    <span>Invite User</span>
                </button>
            </div>

            <div className="bg-dark-800 p-4 rounded-xl border border-dark-700 flex gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-muted" size={18} />
                    <input
                        type="text"
                        placeholder="Search users..."
                        className="w-full bg-dark-900 border border-dark-700 text-white rounded-lg pl-10 pr-4 py-2 focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    />
                </div>
            </div>

            <div className="bg-dark-800 rounded-xl border border-dark-700 overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                        <tr className="border-b border-dark-700 text-dark-muted text-sm uppercase tracking-wider">
                            <th className="p-4 font-medium">User Name</th>
                            <th className="p-4 font-medium">Email</th>
                            <th className="p-4 font-medium">Card UID</th>
                            <th className="p-4 font-medium">Status</th>
                            <th className="p-4 font-medium text-right">Action</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-dark-700">
                        {users.map((user) => (
                            <tr key={user.id} className="group hover:bg-dark-700/50 transition-colors">

                                <td className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                                            {user.name?.substring(0, 2).toUpperCase()}
                                        </div>
                                        <span className="font-medium text-white">{user.name}</span>
                                    </div>
                                </td>

                                <td className="p-4 text-dark-muted">
                                    {user.email || '—'}
                                </td>

                                <td className="p-4 font-mono text-primary bg-primary/10 px-2 py-1 rounded w-fit text-sm">
                                    {user.cardUid}
                                </td>

                                <td className="p-4">
                                    {user.isActive ? (
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                        Active
                      </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
                        Inactive
                      </span>
                                    )}
                                </td>

                                <td className="p-4 text-right">
                                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">

                                        <button className="p-2 text-blue-400 hover:bg-blue-400/10 rounded-lg transition-colors">
                                            <Edit2 size={16} />
                                        </button>

                                        <form action={deleteUser}>
                                            <input type="hidden" name="id" value={user.id} />
                                            <button type="submit" className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors">
                                                <Trash2 size={16} />
                                            </button>
                                        </form>

                                    </div>
                                </td>
                            </tr>
                        ))}

                        {users.length === 0 && (
                            <tr>
                                <td colSpan={5} className="p-8 text-center text-dark-muted">
                                    {`Користувачів не знайдено. Натисніть "Invite User", щоб додати.`}
                                </td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}