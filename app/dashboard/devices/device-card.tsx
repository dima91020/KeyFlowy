'use client'

import { updateDeviceAction, deleteDevice, DeviceState } from './actions'
import { useActionState, useEffect, useState, useRef } from 'react'
import {
    WifiIcon,
    SignalSlashIcon,
    CpuChipIcon,
    TrashIcon,
    ArrowDownTrayIcon,
    BoltIcon,
    ArrowPathIcon,
    UsersIcon,
    LockOpenIcon,
    WrenchScrewdriverIcon
} from '@heroicons/react/24/outline'
import { useRouter } from 'next/navigation'
import clsx from 'clsx'
import { CustomSelect } from "@/app/ui/logs/custom-select"
import { Badge } from '@/app/ui/badge'

type DeviceProps = {
    device: {
        id: string
        name: string
        macAddress: string
        isOnline: boolean
        lastSeen: Date
        relayTime: number
        relayType: string
    }
    currentUserId: string
}

export function DeviceCard({ device, currentUserId }: DeviceProps) {
    const isFresh = new Date().getTime() - new Date(device.lastSeen).getTime() < 20000;
    const isActuallyOnline = device.isOnline && isFresh;

    const initialState: DeviceState = { message: null, errors: {} }
    const [state, action, isPending] = useActionState(updateDeviceAction, initialState)
    const router = useRouter()

    const [isOnline, setIsOnline] = useState(isActuallyOnline)
    const [isUnlocking, setIsUnlocking] = useState(false)
    const [relayType, setRelayType] = useState(device.relayType || "NO")
    const socketRef = useRef<WebSocket | null>(null)

    // Sync online state safely when props change
    useEffect(() => {
        setIsOnline(isActuallyOnline)
        setRelayType(device.relayType || "NO")
    }, [device.isOnline, device.lastSeen, device.relayType, isActuallyOnline])

    // WebSocket listener for live device online/offline events
    useEffect(() => {
        const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8080'
        const ws = new WebSocket(wsUrl)
        socketRef.current = ws

        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data)
                if (data.type === 'DEVICE_STATUS' && data.mac === device.macAddress) {
                    setIsOnline(data.isOnline)
                    router.refresh()
                }
            } catch {
                // Ignore malformed WS packets
            }
        }

        return () => {
            if (ws.readyState === WebSocket.OPEN) {
                ws.close()
            }
        }
    }, [device.macAddress, router])

    // Send config update command over WS when saved
    useEffect(() => {
        if (state.message === "Device updated successfully" && socketRef.current?.readyState === WebSocket.OPEN) {
            socketRef.current.send(JSON.stringify({
                type: 'COMMAND',
                target: device.macAddress,
                command: 'UPDATE_CONFIG',
                userId: currentUserId
            }))
        }
    }, [state.message, device.macAddress, currentUserId])

    const handleCardClick = (e: React.MouseEvent) => {
        const target = e.target as HTMLElement;
        if (target.closest('form') || target.closest('button') || target.closest('input') || target.closest('select') || target.closest('.custom-select-container')) {
            return;
        }
        router.push(`/dashboard/users?device=${device.id}`);
    }

    const handleUnlock = (e: React.MouseEvent) => {
        e.preventDefault()

        if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
            alert("WS Disconnected. Cannot send command.")
            return
        }

        setIsUnlocking(true)

        socketRef.current.send(JSON.stringify({
            type: 'COMMAND',
            target: device.macAddress,
            command: 'UNLOCK',
            userId: currentUserId
        }))

        const timeoutDuration = device.relayTime ? device.relayTime * 1000 : 5000;
        setTimeout(() => setIsUnlocking(false), timeoutDuration)
    }

    const handleResetWifi = (e: React.MouseEvent) => {
        e.preventDefault()

        const confirmed = window.confirm("Are you sure you want to reset Wi-Fi? The device will erase its network settings and reboot into setup mode.")
        if (!confirmed) return

        if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
            alert("WS Disconnected. Cannot send command.")
            return
        }

        socketRef.current.send(JSON.stringify({
            type: 'COMMAND',
            target: device.macAddress,
            command: 'RESET_WIFI',
            userId: currentUserId
        }))
    }

    return (
        <div
            onClick={handleCardClick}
            className="group relative bg-white rounded-xl border border-slate-200 p-5 shadow-sm transition-all cursor-pointer hover:border-slate-300 hover:shadow"
        >
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                    <div className={clsx(
                        "w-10 h-10 rounded-lg flex items-center justify-center border",
                        isOnline ? "bg-slate-50 border-slate-200 text-slate-700" : "bg-slate-100 border-slate-200 text-slate-400"
                    )}>
                        {isOnline ? <WifiIcon className="w-5 h-5" /> : <SignalSlashIcon className="w-5 h-5" />}
                    </div>
                    <div>
                        <h3 className="font-semibold text-slate-900 text-base">{device.name}</h3>
                        <p className="font-mono text-xs text-slate-500">{device.macAddress}</p>
                    </div>
                </div>

                <div className="flex items-center gap-1.5">
                    <Badge variant={isOnline ? 'success' : 'neutral'} dot pulse={isOnline}>
                        {isOnline ? 'Online' : 'Offline'}
                    </Badge>

                    {isOnline ? (
                        <button
                            onClick={handleResetWifi}
                            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                            title="Factory Reset Wi-Fi"
                        >
                            <WrenchScrewdriverIcon className="w-4 h-4" />
                        </button>
                    ) : (
                        <form action={deleteDevice}>
                            <input type="hidden" name="id" value={device.id} />
                            <button
                                type="submit"
                                className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors"
                                title="Remove Device"
                            >
                                <TrashIcon className="w-4 h-4" />
                            </button>
                        </form>
                    )}
                </div>
            </div>

            <div className="space-y-3 mb-4">
                <button
                    onClick={handleUnlock}
                    disabled={!isOnline || isUnlocking}
                    className={clsx(
                        "w-full py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors border",
                        isOnline && !isUnlocking
                            ? "bg-slate-900 text-white hover:bg-slate-800 border-slate-900 shadow-sm"
                            : "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
                    )}
                >
                    {isUnlocking ? <ArrowPathIcon className="w-4 h-4 animate-spin" /> : <LockOpenIcon className="w-4 h-4" />}
                    {isUnlocking ? "Unlocking..." : "Remote Unlock"}
                </button>

                <form action={action} className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-2.5">
                    <input type="hidden" name="id" value={device.id} />

                    <div className="grid grid-cols-12 gap-2">
                        <div className="col-span-12 sm:col-span-6 space-y-1">
                            <label className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Device Name</label>
                            <input
                                name="name"
                                defaultValue={device.name}
                                className={clsx(
                                    "w-full h-[38px] bg-white border rounded-lg px-2.5 text-sm text-slate-900 focus:border-slate-900 outline-none transition-colors",
                                    state.errors?.name ? "border-rose-500" : "border-slate-200"
                                )}
                            />
                        </div>

                        <div className="col-span-6 sm:col-span-3 space-y-1">
                            <label className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Relay (s)</label>
                            <input
                                type="number"
                                name="relayTime"
                                min="1"
                                max="60"
                                defaultValue={device.relayTime || 5}
                                className={clsx(
                                    "w-full h-[38px] bg-white border rounded-lg px-2.5 text-sm text-slate-900 focus:border-slate-900 outline-none transition-colors text-center",
                                    state.errors?.relayTime ? "border-rose-500" : "border-slate-200"
                                )}
                            />
                        </div>

                        <div className="col-span-6 sm:col-span-3 space-y-1 custom-select-container">
                            <label className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Type</label>
                            <input type="hidden" name="relayType" value={relayType} />

                            <CustomSelect
                                key={device.relayType}
                                options={[
                                    { value: "NO", label: "NO" },
                                    { value: "NC", label: "NC" }
                                ]}
                                defaultValue={relayType}
                                onChange={(val) => setRelayType(val)}
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                        <span className="text-xs text-rose-600">
                            {state.errors?.name?.[0] || state.errors?.relayTime?.[0] || state.errors?.relayType?.[0]}
                        </span>
                        <button
                            type="submit"
                            disabled={isPending}
                            className="bg-slate-200 hover:bg-slate-300 text-slate-800 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 text-xs font-medium flex items-center gap-1.5 ml-auto"
                        >
                            {isPending ? <ArrowPathIcon className="w-3.5 h-3.5 animate-spin" /> : <ArrowDownTrayIcon className="w-3.5 h-3.5" />}
                            Save
                        </button>
                    </div>
                </form>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1">
                    <BoltIcon className="w-3.5 h-3.5 text-slate-400" />
                    Last Seen: <span className="text-slate-700 font-medium" suppressHydrationWarning>{new Date(device.lastSeen).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </span>

                <span className="text-slate-600 font-medium flex items-center gap-1 group-hover:text-slate-900 transition-colors">
                    <UsersIcon className="w-3.5 h-3.5" /> Access Matrix →
                </span>
            </div>
        </div>
    )
}