'use client'

import { useEffect, useState } from 'react'
import {
    WifiIcon,
    SignalSlashIcon,
    LockOpenIcon,
    LockClosedIcon
} from '@heroicons/react/24/outline'
import { Badge } from '@/app/ui/badge'

type Device = {
    id: string;
    name: string;
    macAddress: string;
    isOnline: boolean;
}

export function LiveDevices({ initialDevices }: { initialDevices: Device[] }) {
    const [doorStates, setDoorStates] = useState<Record<string, 'OPENED' | 'CLOSED'>>({})

    useEffect(() => {
        const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8080'
        const ws = new WebSocket(wsUrl)

        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data)
                if (data.type === 'DOOR_UPDATE' && data.mac) {
                    setDoorStates(prev => ({
                        ...prev,
                        [data.mac]: data.state
                    }))
                }
            } catch {
                // Ignore malformed WS frames
            }
        }

        return () => {
            if (ws.readyState === WebSocket.OPEN) {
                ws.close()
            }
        }
    }, [])

    return (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                    Live Hardware Telemetry
                </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                {initialDevices.map((device) => {
                    const isOpened = doorStates[device.macAddress] === 'OPENED'

                    return (
                        <div key={device.id} className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 flex items-center justify-between transition-colors">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${device.isOnline ? 'bg-white border border-slate-200 text-slate-700' : 'bg-slate-200 text-slate-400'}`}>
                                    {device.isOnline ? <WifiIcon className="w-4 h-4" /> : <SignalSlashIcon className="w-4 h-4" />}
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-slate-900">{device.name}</p>
                                    <p className="text-xs text-slate-500 font-mono">{device.macAddress}</p>
                                </div>
                            </div>

                            {device.isOnline ? (
                                <Badge
                                    variant={isOpened ? 'warning' : 'success'}
                                    dot
                                    pulse={isOpened}
                                    icon={isOpened ? <LockOpenIcon className="w-3.5 h-3.5" /> : <LockClosedIcon className="w-3.5 h-3.5" />}
                                >
                                    {isOpened ? 'Open' : 'Closed'}
                                </Badge>
                            ) : (
                                <Badge variant="neutral" dot>
                                    Offline
                                </Badge>
                            )}
                        </div>
                    )
                })}

                {initialDevices.length === 0 && (
                    <div className="col-span-full text-center py-6 text-xs text-slate-400 border border-dashed border-slate-200 rounded-lg">
                        No devices configured yet.
                    </div>
                )}
            </div>
        </div>
    )
}