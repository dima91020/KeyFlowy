import {
    ArrowRightEndOnRectangleIcon,
    ArrowLeftStartOnRectangleIcon,
    ExclamationTriangleIcon,
    DevicePhoneMobileIcon,
    ClockIcon
} from '@heroicons/react/24/outline'
import { LogWithDetails } from '@/app/dashboard/actions'

export function LogCard({ log }: { log: LogWithDetails }) {
    const logDate = new Date(log.timestamp)

    const dateString = logDate.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        timeZone: 'Europe/Kyiv'
    })

    const timeString = logDate.toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZone: 'Europe/Kyiv'
    })

    // ...
    const isIntrusion = log.eventType === 'INTRUSION' || log.cardUid === 'INTRUSION'
    const isRemoteUnlock = log.cardUid === 'REMOTE'

    let accentColor = "bg-dark-600"
    if (isIntrusion) accentColor = "bg-red-500"
    else if (log.accessGranted) accentColor = "bg-green-500"
    else accentColor = "bg-yellow-500"

    // === ВАЖЛИВО: Використовуємо snapshot-дані, якщо юзера було видалено ===
    const displayName = log.user?.name ?? log.userName ?? 'Unknown User'
    const isGuest = (log.user?.role ?? log.userRole) === 'GUEST'
    const isDeleted = !log.user && (log.userName || log.userRole)

    let timeLeftString = null;
    let isExpired = false;

    if (isGuest) {
        if (log.user?.validUntil) {
            const now = new Date();
            const validUntil = new Date(log.user.validUntil);

            if (validUntil.getTime() > now.getTime()) {
                const diffMins = Math.floor((validUntil.getTime() - now.getTime()) / 60000);
                const hours = Math.floor(diffMins / 60);
                const mins = diffMins % 60;
                const days = Math.floor(hours / 24);

                if (days > 0) timeLeftString = `${days}d left`;
                else if (hours > 0) timeLeftString = `${hours}h ${mins}m`;
                else timeLeftString = `${mins}m`;
            } else {
                isExpired = true;
                timeLeftString = "Expired";
            }
        } else if (isDeleted) {
            timeLeftString = "Deleted Profile";
        }
    }

    return (
        <div className="relative flex flex-col md:flex-row md:items-center justify-between p-4 pl-5 bg-dark-800/40 rounded-xl border border-dark-700/50 hover:bg-dark-800/80 transition-colors overflow-hidden group">

            <div className={`absolute left-0 top-0 bottom-0 w-1 ${accentColor}`} />

            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-6 w-full">

                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        {isIntrusion ? (
                            <p className="font-semibold text-sm text-red-400 flex items-center gap-1.5">
                                <ExclamationTriangleIcon className="w-4 h-4" />
                                FORCED ENTRY
                            </p>
                        ) : (
                            <>
                                <p className="font-semibold text-sm text-gray-200 flex items-center gap-2">
                                    {displayName}
                                    {isDeleted && (
                                        <span className="text-[10px] bg-dark-700 text-dark-muted px-1.5 py-0.5 rounded border border-dark-600 font-normal uppercase tracking-wider">
                                            Deleted
                                        </span>
                                    )}
                                </p>
                                {isGuest && (
                                    <span className={`flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded border uppercase tracking-wider font-bold ${
                                        isExpired || isDeleted
                                            ? 'bg-red-500/10 text-red-400 border-red-500/20'
                                            : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                                    }`}>
                                        <ClockIcon className="w-3 h-3" /> GUEST ({timeLeftString})
                                    </span>
                                )}
                            </>
                        )}
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-dark-muted">
                        {isIntrusion ? (
                            <span>Door opened without a card</span>
                        ) : isRemoteUnlock ? (
                            <span className="flex items-center gap-1.5 text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20 font-medium">
                                <DevicePhoneMobileIcon className="w-4 h-4" /> App Unlock
                            </span>
                        ) : (
                            <span className="font-mono bg-dark-900/50 px-1.5 py-0.5 rounded border border-dark-700/50">UID: {log.cardUid}</span>
                        )}
                        {log.device && <span className="text-dark-600">•</span>}
                        {log.device && <span>{log.device.name}</span>}
                    </div>
                </div>

                <div className="flex items-center gap-3 mt-3 md:mt-0">
                    {!isIntrusion && (
                        <div className="flex items-center gap-1 text-xs font-medium text-gray-400 bg-dark-900/50 px-2 py-1 rounded-lg border border-dark-700/50">
                            {log.direction === 'ENTRY' ? <ArrowRightEndOnRectangleIcon className="w-4 h-4 text-blue-400" /> : <ArrowLeftStartOnRectangleIcon className="w-4 h-4 text-purple-400" />}
                            {log.direction === 'ENTRY' ? 'Entry' : 'Exit'}
                        </div>
                    )}

                    <div className={`text-[10px] font-bold tracking-wider px-2.5 py-1 rounded-lg uppercase border ${
                        isIntrusion ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                            log.accessGranted ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                    }`}>
                        {isIntrusion ? 'ALERT' : log.accessGranted ? 'GRANTED' : 'DENIED'}
                    </div>
                </div>

            </div>

            <div className="mt-4 md:mt-0 md:ml-6 md:text-right shrink-0">
                <p className="text-sm text-gray-300 font-medium">{timeString}</p>
                <p className="text-xs text-dark-muted mt-0.5">{dateString}</p>
            </div>

        </div>
    )
}