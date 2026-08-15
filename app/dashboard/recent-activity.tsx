'use client'

import { useEffect, useState } from 'react'
import { getRecentLogsAction, LogWithDetails } from './actions'
import { LogCard } from '@/app/ui/logs/log-card'

export function RecentActivity({ initialLogs, adminId }: { initialLogs: LogWithDetails[], adminId: string }) {
    const [logs, setLogs] = useState<LogWithDetails[]>(initialLogs)

    const fetchLogs = async () => {
        const newLogs = await getRecentLogsAction(adminId)
        setLogs(newLogs)
    }

    useEffect(() => {
        const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8080'
        const ws = new WebSocket(wsUrl)

        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data)
                if (data.type === 'EVENT') {
                    fetchLogs()
                }
            } catch {
                // Ignore invalid message frames
            }
        }

        return () => {
            if (ws.readyState === WebSocket.OPEN) {
                ws.close()
            }
        }
    }, [adminId])

    return (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                    Recent Activity
                </h3>
            </div>

            <div className="space-y-2.5">
                {logs.length === 0 ? (
                    <div className="text-center py-10 text-slate-400 border border-dashed border-slate-200 rounded-lg text-sm">
                        No access activity recorded today.
                    </div>
                ) : (
                    logs.slice(0, 10).map((log) => (
                        <LogCard key={log.id} log={log} />
                    ))
                )}
            </div>
        </div>
    )
}