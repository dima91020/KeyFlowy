import {
    TrashIcon,
    UserIcon,
    ShieldCheckIcon,
    NoSymbolIcon,
    MapPinIcon,
    EyeIcon,
    PencilSquareIcon,
    ClockIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import { deleteUserAction } from '@/app/dashboard/users/actions'

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

    const cardStyles = isActuallyActive
        ? "bg-dark-800 border-dark-700 hover:border-dark-600"
        : "bg-red-900/10 border-red-900/30 opacity-80";

    const lastLocation = user.logs?.[0]?.device?.name;

    return (
        <div className={`border rounded-2xl p-5 transition-all group relative flex flex-col ${cardStyles}`}>
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center border overflow-hidden shrink-0 ${
                        isActuallyActive
                            ? "bg-dark-700 border-dark-600"
                            : "bg-dark-800 border-red-900/30 grayscale opacity-60"
                    }`}>
                        {user.image ? (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img src={user.image} alt={user.name || 'User'} className="w-full h-full object-cover" />
                        ) : (
                            <UserIcon className="w-6 h-6 text-dark-muted" />
                        )}
                    </div>

                    <div>
                        <h3 className={`font-bold text-lg leading-tight flex flex-wrap items-center gap-2 mb-1 ${!isActuallyActive ? "text-red-200" : "text-white"}`}>
                            {user.name || 'Unnamed'}
                            {isCurrentUser && <span className="text-dark-muted text-xs font-normal border border-dark-700 px-1.5 py-0.5 rounded">(You)</span>}

                            {isActuallyActive && (
                                user.isInside ? (
                                    <span className="flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 uppercase tracking-wider">
                                        <MapPinIcon className="w-3 h-3" /> {lastLocation ? lastLocation : 'Всередині'}
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-dark-700 text-dark-400 border border-dark-600 uppercase tracking-wider">
                                        <MapPinIcon className="w-3 h-3 opacity-50" /> Ззовні
                                    </span>
                                )
                            )}
                        </h3>
                        <p className="text-sm text-dark-muted line-clamp-1">
                            {user.jobTitle || 'No Job Title'}
                        </p>
                    </div>
                </div>

                <div className="flex flex-col items-end gap-1 shrink-0">
                    {user.role === 'ADMIN' && (
                        <span className="px-2 py-1 rounded-lg bg-purple-500/10 text-purple-400 text-xs font-bold border border-purple-500/20 flex items-center gap-1">
                            <ShieldCheckIcon className="w-3 h-3" /> ADMIN
                        </span>
                    )}

                    {user.role === 'GUEST' && (
                        <span className={`px-2 py-1 rounded-lg text-xs font-bold border flex items-center gap-1 ${
                            isExpired
                                ? 'bg-red-500/10 text-red-400 border-red-500/20'
                                : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                        }`}>
                            <ClockIcon className="w-3 h-3" />
                            {isExpired ? 'EXPIRED' : `GUEST (${timeLeftString})`}
                        </span>
                    )}

                    {!user.isActive && (
                        <span className="px-2 py-1 rounded-lg bg-red-500 text-white text-[10px] font-black tracking-wider uppercase shadow-lg shadow-red-900/50 flex items-center gap-1">
                            <NoSymbolIcon className="w-3 h-3" /> BLOCKED
                        </span>
                    )}
                </div>
            </div>

            <div className="space-y-2 bg-dark-900/50 p-3 rounded-xl border border-dark-700/50 mb-4 flex-1">
                <div className="flex justify-between text-sm">
                    <span className="text-dark-muted">Card UID:</span>
                    <span className={`font-mono tracking-wider ${!isActuallyActive ? "text-red-300/50 line-through" : "text-white"}`}>
                        {user.cardUid || '-'}
                    </span>
                </div>
                {user.role !== 'GUEST' && (
                    <div className="flex justify-between text-sm">
                        <span className="text-dark-muted">Email:</span>
                        <span className="text-white truncate max-w-[150px]" title={user.email || ''}>
                            {user.email || '-'}
                        </span>
                    </div>
                )}
            </div>

            <div className="flex gap-2 mt-auto">
                <Link
                    href={`/dashboard/users/${user.id}`}
                    className="flex-1 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 py-2 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2"
                >
                    <EyeIcon className="w-4 h-4" />
                    Stats
                </Link>

                <Link
                    href={`/dashboard/users/${user.id}/edit`}
                    className="bg-gray-500/10 hover:bg-gray-500/20 text-dark-muted hover:text-white p-2 rounded-xl transition-colors border border-gray-500/10 h-full w-10 flex items-center justify-center"
                    title="Edit User"
                >
                    <PencilSquareIcon className="w-5 h-5" />
                </Link>

                {!isCurrentUser && (
                    <form action={deleteUserAction}>
                        <input type="hidden" name="id" value={user.id} />
                        <button
                            type="submit"
                            className="bg-red-500/10 hover:bg-red-500/20 text-red-400 p-2 rounded-xl transition-colors border border-red-500/10 h-full w-10 flex items-center justify-center"
                            title="Delete User"
                        >
                            <TrashIcon className="w-5 h-5" />
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}