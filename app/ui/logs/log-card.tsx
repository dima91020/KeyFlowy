import {
    ArrowRightEndOnRectangleIcon,
    ArrowLeftStartOnRectangleIcon,
    ExclamationTriangleIcon,
    DevicePhoneMobileIcon
} from '@heroicons/react/24/outline'
import { LogWithDetails } from '@/app/dashboard/actions'
import { Badge } from '@/app/ui/badge'

export function LogCard({ log }: { log: LogWithDetails }) {
    const logDate = new Date(log.timestamp)

    const dateString = logDate.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    })

    const timeString = logDate.toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    })

    const isIntrusion = log.eventType === 'INTRUSION' || log.cardUid === 'INTRUSION'
    const isRemoteUnlock = log.cardUid === 'REMOTE'
    const displayName = log.user?.name ?? log.userName ?? 'Unknown Card'
    const isGuest = (log.user?.role ?? log.userRole) === 'GUEST'

    return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 bg-white rounded-lg border border-slate-200 hover:border-slate-300 transition-colors gap-3">
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                    {isIntrusion ? (
                        <span className="font-semibold text-xs text-rose-600 flex items-center gap-1">
                            <ExclamationTriangleIcon className="w-4 h-4" />
                            Forced Entry Alarm
                        </span>
                    ) : (
                        <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm text-slate-900 truncate">{displayName}</span>
                            {isGuest && (
                                <Badge size="sm" variant="info">
                                    Guest
                                </Badge>
                            )}
                        </div>
                    )}
                </div>

                <div className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-xs text-slate-500">
                    {isIntrusion ? (
                        <span>Door opened without badge</span>
                    ) : isRemoteUnlock ? (
                        <span className="inline-flex items-center gap-1 text-slate-700">
                            <DevicePhoneMobileIcon className="w-3.5 h-3.5 text-slate-500" /> Remote App Unlock
                        </span>
                    ) : (
                        <span className="font-mono text-[11px] text-slate-600">UID: {log.cardUid}</span>
                    )}

                    {log.device && (
                        <>
                            <span>•</span>
                            <span className="text-slate-600">{log.device.name}</span>
                        </>
                    )}
                </div>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                {!isIntrusion && log.direction && (
                    <span className="inline-flex items-center gap-1 text-xs text-slate-600 font-medium">
                        {log.direction === 'ENTRY' ? (
                            <ArrowRightEndOnRectangleIcon className="w-3.5 h-3.5 text-slate-400" />
                        ) : (
                            <ArrowLeftStartOnRectangleIcon className="w-3.5 h-3.5 text-slate-400" />
                        )}
                        {log.direction === 'ENTRY' ? 'Entry' : 'Exit'}
                    </span>
                )}

                <Badge
                    size="sm"
                    variant={isIntrusion ? 'danger' : log.accessGranted ? 'success' : 'danger'}
                    dot
                    pulse={isIntrusion}
                >
                    {isIntrusion ? 'Alert' : log.accessGranted ? 'Granted' : 'Denied'}
                </Badge>

                <div className="text-right">
                    <p className="text-xs font-mono text-slate-900 font-medium">{timeString}</p>
                    <p className="text-[10px] text-slate-400">{dateString}</p>
                </div>
            </div>
        </div>
    )
}