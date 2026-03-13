import { LogIn, LogOut, AlertTriangle } from 'lucide-react'
import { LogWithDetails } from '@/app/dashboard/actions'

export function LogCard({ log }: { log: LogWithDetails }) {
    const logDate = new Date(log.timestamp)
    const dateString = logDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    const timeString = logDate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' })

    const isIntrusion = log.eventType === 'INTRUSION' || log.cardUid === 'INTRUSION'

    // Визначаємо колір акценту
    let accentColor = "bg-dark-600"
    if (isIntrusion) accentColor = "bg-red-500"
    else if (log.accessGranted) accentColor = "bg-green-500"
    else accentColor = "bg-yellow-500"

    return (
        <div className="relative flex flex-col md:flex-row md:items-center justify-between p-4 pl-5 bg-dark-800/40 rounded-xl border border-dark-700/50 hover:bg-dark-800/80 transition-colors overflow-hidden group">

            {/* Тонка кольорова лінія зліва */}
            <div className={`absolute left-0 top-0 bottom-0 w-1 ${accentColor}`} />

            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-6 w-full">

                {/* Інфо про користувача */}
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        {isIntrusion ? (
                            <p className="font-semibold text-sm text-red-400 flex items-center gap-1.5">
                                <AlertTriangle size={14} />
                                FORCED ENTRY
                            </p>
                        ) : (
                            <p className="font-semibold text-sm text-gray-200">
                                {log.user?.name ?? 'Unknown User'}
                            </p>
                        )}
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-dark-muted">
                        {isIntrusion ? (
                            <span>Door opened without a card</span>
                        ) : (
                            <span className="font-mono bg-dark-900/50 px-1.5 py-0.5 rounded border border-dark-700/50">UID: {log.cardUid}</span>
                        )}
                        {log.device && <span className="text-dark-600">•</span>}
                        {log.device && <span>{log.device.name}</span>}
                    </div>
                </div>

                {/* Напрямок та Статус */}
                <div className="flex items-center gap-3 mt-3 md:mt-0">
                    {!isIntrusion && (
                        <div className="flex items-center gap-1 text-xs font-medium text-gray-400 bg-dark-900/50 px-2 py-1 rounded-lg border border-dark-700/50">
                            {log.direction === 'ENTRY' ? <LogIn size={14} className="text-blue-400" /> : <LogOut size={14} className="text-purple-400" />}
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

            {/* Дата та час */}
            <div className="mt-4 md:mt-0 md:ml-6 md:text-right shrink-0">
                <p className="text-sm text-gray-300 font-medium">{timeString}</p>
                <p className="text-xs text-dark-muted mt-0.5">{dateString}</p>
            </div>

        </div>
    )
}