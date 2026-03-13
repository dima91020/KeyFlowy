'use client'

import { useEffect, useState } from 'react'
import { getRecentLogsAction, LogWithDetails } from './actions'
import { Activity, LogIn, LogOut, AlertTriangle } from 'lucide-react'
import { LogCard } from '@/app/ui/logs/log-card'

export function RecentActivity({ initialLogs }: { initialLogs: LogWithDetails[] }) {
    const [logs, setLogs] = useState<LogWithDetails[]>(initialLogs)
    const [doorState, setDoorState] = useState<string>("CLOSED")

    const fetchLogs = async () => {
        const newLogs = await getRecentLogsAction()
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
                } else if (data.type === 'DOOR_UPDATE') {
                    setDoorState(data.state)
                }
            } catch (e) {
                console.error('WS Error', e)
            }
        }

        return () => ws.close()
    }, [])

    return (
        <div className="lg:col-span-2 bg-dark-800 border border-dark-700 rounded-2xl p-6 shadow-lg">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold flex items-center gap-2 text-white">
                    <Activity size={20} className="text-primary" />
                    Recent Activity
                </h3>

                <span className={`text-xs px-2 py-1 rounded font-medium tracking-wide ${doorState === 'OPENED' ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/30' : 'bg-green-500/20 text-green-500 border border-green-500/30'}`}>
                    {doorState === 'OPENED' ? 'DOOR OPENED' : 'DOOR CLOSED'}
                </span>
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