import {
    TrashIcon,
    UserIcon,
    PencilSquareIcon,
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import { deleteUserAction } from '@/app/dashboard/users/actions'
import { Badge } from '@/app/ui/badge'

export function UserCard({ user, currentUserId }: { user: any; currentUserId: string }) {
    const isCurrentUser = user.id === currentUserId;

    const now = new Date();
    const validUntil = user.validUntil ? new Date(user.validUntil) : null;
    const isExpired = validUntil ? now.getTime() > validUntil.getTime() : false;
    const isActuallyActive = user.isActive && !isExpired;

    let timeLeftString = null;
    if (user.role === 'GUEST' && validUntil && !isExpired) {
        const diffMs = validUntil.getTime() - now.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const hours = Math.floor(diffMins / 60);
        const mins = diffMins % 60;
        const days = Math.floor(hours / 24);

        if (days > 0) timeLeftString = `${days}d left`;
        else if (hours > 0) timeLeftString = `${hours}h ${mins}m`;
        else timeLeftString = `${mins}m`;
    }

    return (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:border-slate-300 transition-colors flex flex-col justify-between">
            <div>
                <div className="flex items-start justify-between mb-3.5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 font-semibold text-xs overflow-hidden shrink-0">
                            {user.image ? (
                                /* eslint-disable-next-line @next/next/no-img-element */
                                <img src={user.image} alt={user.name || 'User'} className="w-full h-full object-cover" />
                            ) : (
                                <UserIcon className="w-5 h-5 text-slate-400" />
                            )}
                        </div>

                        <div>
                            <h3 className="font-semibold text-slate-900 text-sm leading-snug flex items-center gap-1.5">
                                {user.name || 'Unnamed'}
                                {isCurrentUser && (
                                    <span className="text-[10px] text-slate-400 font-normal">(You)</span>
                                )}
                            </h3>
                            <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                                {user.jobTitle || (user.role === 'GUEST' ? 'Guest Visitor' : 'Staff Member')}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                        {user.role === 'ADMIN' && (
                            <Badge size="sm" variant="info">
                                Admin
                            </Badge>
                        )}

                        {user.role === 'GUEST' && (
                            <Badge size="sm" variant={isExpired ? 'danger' : 'warning'} dot>
                                {isExpired ? 'Expired' : `Guest (${timeLeftString})`}
                            </Badge>
                        )}

                        {!user.isActive ? (
                            <Badge size="sm" variant="danger" dot>
                                Blocked
                            </Badge>
                        ) : (
                            <Badge size="sm" variant="success" dot>
                                Active
                            </Badge>
                        )}
                    </div>
                </div>

                <div className="bg-slate-50 rounded-lg p-3 border border-slate-200 space-y-1.5 text-xs mb-4">
                    <div className="flex justify-between">
                        <span className="text-slate-500">Badge UID:</span>
                        <span className="font-mono text-slate-800 font-medium">{user.cardUid || 'None'}</span>
                    </div>

                    {user.role !== 'GUEST' && user.email && (
                        <div className="flex justify-between">
                            <span className="text-slate-500">Email:</span>
                            <span className="text-slate-700 truncate max-w-[170px]">{user.email}</span>
                        </div>
                    )}

                    <div className="flex justify-between pt-1 border-t border-slate-200/60">
                        <span className="text-slate-500">Location:</span>
                        <span className="text-slate-800 font-medium">
                            {isActuallyActive ? (user.isInside ? 'Inside Facility' : 'Outside') : 'Access Denied'}
                        </span>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
                <Link
                    href={`/dashboard/users/${user.id}`}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 py-1.5 px-3 rounded-lg text-xs font-medium transition-colors text-center"
                >
                    View Stats
                </Link>

                <Link
                    href={`/dashboard/users/${user.id}/edit`}
                    className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors"
                    title="Edit User"
                >
                    <PencilSquareIcon className="w-4 h-4" />
                </Link>

                {!isCurrentUser && (
                    <form action={deleteUserAction}>
                        <input type="hidden" name="id" value={user.id} />
                        <button
                            type="submit"
                            className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Delete User"
                        >
                            <TrashIcon className="w-4 h-4" />
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}