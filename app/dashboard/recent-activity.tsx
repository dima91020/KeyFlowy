'use client'

import { useEffect, useState } from 'react'
import { getRecentLogsAction, LogWithDetails } from './actions'
import { BoltIcon } from '@heroicons/react/24/outline'
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

                // Оновлюємо логи тільки при подіях доступу
                if (data.type === 'EVENT') {
                    fetchLogs()
                }
            } catch (e) {
                console.error('WS Error', e)
            }
        }

        return () => ws.close()
    }, [adminId])

    return (
        <div className="lg:col-span-2 bg-dark-800 border border-dark-700 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center mb-6">
                <h3 className="text-xl font-bold flex items-center gap-2 text-white">
                    <BoltIcon className="w-5 h-5 text-primary" />
                    Recent Activity
                </h3>
            </div>

            <div className="space-y-4">
                {logs.length === 0 ? (
                    <div className="text-center py-10 text-dark-muted border border-dashed border-dark-700 rounded-xl">
                        No activity recorded today.
                    </div>
                ) : (
                    logs.map((log) => (
                        <LogCard key={log.id} log={log} />
                    ))
                )}
            </div>
        </div>
    )
}