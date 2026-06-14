'use client'

import { useEffect, useState } from 'react'
import {
    ServerStackIcon,
    WifiIcon,
    SignalSlashIcon,
    LockOpenIcon,
    LockClosedIcon
} from '@heroicons/react/24/outline'

type Device = {
    id: string;
    name: string;
    macAddress: string;
    isOnline: boolean;
}

export function LiveDevices({ initialDevices }: { initialDevices: Device[] }) {
    // Зберігаємо стан дверей у вигляді словника: { "MAC_АДРЕСА": "OPENED" | "CLOSED" }
    const [doorStates, setDoorStates] = useState<Record<string, 'OPENED' | 'CLOSED'>>({})

    useEffect(() => {
        const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8080'
        const ws = new WebSocket(wsUrl)

        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data)

                // Якщо прийшло оновлення дверей і вказано MAC-адресу девайсу
                if (data.type === 'DOOR_UPDATE' && data.mac) {
                    setDoorStates(prev => ({
                        ...prev,
                        [data.mac]: data.state
                    }))
                }
            } catch (e) {
                console.error('WS Error', e)
            }
        }

        return () => ws.close()
    }, [])

    return (
        <div className="bg-dark-800 border border-dark-700 rounded-2xl p-6 shadow-lg">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold flex items-center gap-2 text-white">
                    <ServerStackIcon className="w-5 h-5 text-purple-400" />
                    Live Devices Status
                </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {initialDevices.map((device) => {
                    const isOpened = doorStates[device.macAddress] === 'OPENED'

                    return (
                        <div key={device.id} className="bg-dark-900 border border-dark-700 rounded-xl p-4 flex items-center justify-between transition-colors hover:border-dark-600">

                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${device.isOnline ? 'bg-blue-500/10 text-blue-400' : 'bg-dark-800 text-dark-muted'}`}>
                                    {device.isOnline ? <WifiIcon className="w-5 h-5" /> : <SignalSlashIcon className="w-5 h-5" />}
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-white">{device.name}</p>
                                    <p className="text-xs text-dark-muted font-mono">{device.macAddress}</p>
                                </div>
                            </div>

                            {/* Статус дверей показуємо тільки якщо девайс онлайн */}
                            {device.isOnline ? (
                                <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold tracking-wide border transition-all duration-300 ${
                                    isOpened
                                        ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30 shadow-[0_0_15px_rgba(234,179,8,0.15)]'
                                        : 'bg-green-500/10 text-green-500 border-green-500/20'
                                }`}>
                                    {isOpened ? <LockOpenIcon className="w-4 h-4" /> : <LockClosedIcon className="w-4 h-4" />}
                                    {isOpened ? 'OPEN' : 'CLOSED'}
                                </div>
                            ) : (
                                <span className="text-xs font-bold text-dark-muted px-2.5 py-1.5 bg-dark-800 rounded-lg border border-dark-700">
                                    OFFLINE
                                </span>
                            )}

                        </div>
                    )
                })}

                {initialDevices.length === 0 && (
                    <div className="col-span-full text-center py-8 text-sm text-dark-muted border border-dashed border-dark-700 rounded-xl">
                        No devices configured yet.
                    </div>
                )}
            </div>
        </div>
    )
}