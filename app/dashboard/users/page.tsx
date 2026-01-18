import { prisma } from '@/app/lib/prisma'
import { Plus, Search, Trash2, User as UserIcon, Shield } from 'lucide-react'
import Link from 'next/link'
import { deleteUserAction } from './actions'
import { cookies } from 'next/headers'

export default async function UsersPage() {
    const users = await prisma.user.findMany({
        orderBy: { createdAt: 'desc' }
    })

    const cookieStore = await cookies()
    const currentUserId = cookieStore.get('session')?.value

    return (
        <div className="p-6 space-y-6">

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white">Users Management</h1>
                    <p className="text-dark-muted mt-1">Manage employees and their access cards.</p>
                </div>

                <Link
                    href="/dashboard/users/new"
                    className="bg-primary hover:bg-primary-hover text-white px-4 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all shadow-lg shadow-blue-500/20"
                >
                    <Plus size={20} />
                    Add Employee
                </Link>
            </div>

            <div className="relative">
                <Search className="absolute left-4 top-3.5 text-dark-muted" size={20} />
                <input
                    type="text"
                    placeholder="Search by name, position or card UID..."
                    className="w-full bg-dark-800 border border-dark-700 text-white rounded-xl pl-12 pr-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {users.map((user) => {
                    const isCurrentUser = user.id === currentUserId

                    return (
                        <div key={user.id} className="bg-dark-800 border border-dark-700 rounded-2xl p-5 hover:border-dark-600 transition-all group relative">

                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-dark-700 flex items-center justify-center border border-dark-600 overflow-hidden">
                                        {user.image ? (
                                            <img src={user.image} alt={user.name || 'User'} className="w-full h-full object-cover" />
                                        ) : (
                                            <UserIcon className="text-dark-muted" size={24} />
                                        )}
                                    </div>

                                    <div>
                                        <h3 className="font-bold text-white text-lg leading-tight">
                                            {user.name || 'Unnamed'}
                                            {isCurrentUser && <span className="text-dark-muted text-sm font-normal ml-2">(You)</span>}
                                        </h3>
                                        <p className="text-sm text-dark-muted">
                                            {user.jobTitle || 'No Job Title'}
                                        </p>
                                    </div>
                                </div>

                                {user.role === 'ADMIN' ? (
                                    <span className="px-2 py-1 rounded-lg bg-purple-500/10 text-purple-400 text-xs font-bold border border-purple-500/20 flex items-center gap-1">
                      <Shield size={10} /> ADMIN
                  </span>
                                ) : (
                                    <span className="px-2 py-1 rounded-lg bg-blue-500/10 text-blue-400 text-xs font-bold border border-blue-500/20">
                      EMPLOYEE
                  </span>
                                )}
                            </div>

                            <div className="space-y-2 bg-dark-900/50 p-3 rounded-xl border border-dark-700/50 mb-4">
                                <div className="flex justify-between text-sm">
                                    <span className="text-dark-muted">Card UID:</span>
                                    <span className="font-mono text-white tracking-wider">
                          {user.cardUid || '—'}
                      </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-dark-muted">Email:</span>
                                    <span className="text-white truncate max-w-[150px]">
                          {user.email || '—'}
                      </span>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <Link
                                    href={`/dashboard/users/${user.id}`}
                                    className="flex-1 bg-dark-700 hover:bg-dark-600 text-white py-2 rounded-lg text-sm font-medium transition-colors text-center"
                                >
                                    Edit / View
                                </Link>

                                {!isCurrentUser && (
                                    <form action={deleteUserAction.bind(null, user.id)}>
                                        <button
                                            type="submit"
                                            className="bg-red-500/10 hover:bg-red-500/20 text-red-400 p-2 rounded-lg transition-colors border border-red-500/10"
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
                <div className="text-center py-20 text-dark-muted">
                    No users found. Create your first employee!
                </div>
            )}
        </div>
    )
}