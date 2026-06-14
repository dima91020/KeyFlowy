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
    const [prevPropOnline, setPrevPropOnline] = useState(device.isOnline)
    const [prevPropLastSeen, setPrevPropLastSeen] = useState(device.lastSeen)

    const [isUnlocking, setIsUnlocking] = useState(false)

    const [relayType, setRelayType] = useState(device.relayType || "NO")
    const [prevPropRelayType, setPrevPropRelayType] = useState(device.relayType)

    const socketRef = useRef<WebSocket | null>(null)

    if (device.isOnline !== prevPropOnline || device.lastSeen !== prevPropLastSeen) {
        setPrevPropOnline(device.isOnline)
        setPrevPropLastSeen(device.lastSeen)
        setIsOnline(isActuallyOnline)
    }

    if (device.relayType !== prevPropRelayType) {
        setPrevPropRelayType(device.relayType)
        setRelayType(device.relayType || "NO")
    }

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
            } catch (e) {
                console.error("WS Message Error:", e)
            }
        }

        ws.onclose = () => console.log("Browser UI disconnected from WS server");
        ws.onerror = () => console.log("Browser UI WS error");

        return () => ws.close()
    }, [device.macAddress, router])

    useEffect(() => {
        if (state.message === "Device updated successfully" && socketRef.current?.readyState === WebSocket.OPEN) {
            socketRef.current.send(JSON.stringify({
                type: 'COMMAND',
                target: device.macAddress,
                command: 'UPDATE_CONFIG',
                userId: currentUserId
            }))
        }
    }, [state, device.macAddress, currentUserId])

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
            className={`group relative bg-dark-800 rounded-2xl border p-6 transition-all cursor-pointer hover:-translate-y-1 ${
                isOnline
                    ? 'border-green-500/30 hover:border-green-500/60 shadow-[0_0_20px_rgba(34,197,94,0.1)]'
                    : 'border-dark-700 hover:border-primary/50 opacity-80 hover:opacity-100'
            }`}
        >
            <div className="flex justify-between items-start mb-6">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    isOnline ? 'bg-green-500/10 text-green-400' : 'bg-dark-700 text-dark-muted'
                }`}>
                    {isOnline ? <WifiIcon className="w-6 h-6" /> : <SignalSlashIcon className="w-6 h-6" />}
                </div>

                <div className="flex items-center gap-2">
                    <div className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 border ${
                        isOnline
                            ? 'bg-green-500/10 text-green-400 border-green-500/20'
                            : 'bg-red-500/10 text-red-400 border-red-500/20'
                    }`}>
                        <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                        {isOnline ? 'ONLINE' : 'OFFLINE'}
                    </div>

                    {isOnline ? (
                        <button
                            onClick={handleResetWifi}
                            className="bg-dark-900 border border-dark-600 hover:bg-yellow-900/30 hover:border-yellow-500/50 hover:text-yellow-400 text-dark-muted p-1.5 rounded-full transition-all flex items-center justify-center"
                            title="Factory Reset Wi-Fi"
                        >
                            <WrenchScrewdriverIcon className="w-4 h-4" />
                        </button>
                    ) : (
                        <form action={deleteDevice}>
                            <input type="hidden" name="id" value={device.id} />
                            <button type="submit" className="bg-dark-900 border border-dark-600 hover:bg-red-900/30 hover:border-red-500/50 hover:text-red-400 text-dark-muted p-1.5 rounded-full transition-all flex items-center justify-center" title="Remove Device">
                                <TrashIcon className="w-4 h-4" />
                            </button>
                        </form>
                    )}
                </div>
            </div>

            <div className="space-y-4 relative z-10 mb-6">
                <button
                    onClick={handleUnlock}
                    disabled={!isOnline || isUnlocking}
                    className={clsx(
                        "w-full py-2.5 rounded-xl font-medium flex items-center justify-center gap-2 transition-all border",
                        isOnline && !isUnlocking
                            ? "bg-primary/10 text-primary hover:bg-primary/20 border-primary/30 shadow-lg shadow-blue-500/10"
                            : "bg-dark-900 text-dark-muted border-dark-700 cursor-not-allowed"
                    )}
                >
                    {isUnlocking ? <ArrowPathIcon className="w-5 h-5 animate-spin" /> : <LockOpenIcon className="w-5 h-5" />}
                    {isUnlocking ? "Unlocking..." : "Remote Unlock"}
                </button>

                <form action={action} className="bg-dark-900/50 p-3 rounded-xl border border-dark-700/50 space-y-3">
                    <input type="hidden" name="id" value={device.id} />

                    <div className="grid grid-cols-12 gap-3">
                        <div className="col-span-12 sm:col-span-6 space-y-1">
                            <label className="text-[10px] text-dark-muted font-mono uppercase tracking-wider">Device Name</label>
                            <input
                                name="name"
                                defaultValue={device.name}
                                className={clsx(
                                    "w-full h-[46px] bg-dark-900 border rounded-xl px-3 text-sm text-white focus:border-primary outline-none transition-colors",
                                    state.errors?.name ? "border-red-500" : "border-dark-700"
                                )}
                            />
                        </div>

                        <div className="col-span-6 sm:col-span-3 space-y-1">
                            <label className="text-[10px] text-dark-muted font-mono uppercase tracking-wider">Time (s)</label>
                            <input
                                type="number"
                                name="relayTime"
                                min="1"
                                max="60"
                                defaultValue={device.relayTime || 5}
                                className={clsx(
                                    "w-full h-[46px] bg-dark-900 border rounded-xl px-3 text-sm text-white focus:border-primary outline-none transition-colors text-center",
                                    "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
                                    state.errors?.relayTime ? "border-red-500" : "border-dark-700"
                                )}
                            />
                        </div>

                        <div className="col-span-6 sm:col-span-3 space-y-1 custom-select-container">
                            <label className="text-[10px] text-dark-muted font-mono uppercase tracking-wider">Type</label>
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
                        <span className="text-xs text-red-400">
                            {state.errors?.name?.[0] || state.errors?.relayTime?.[0] || state.errors?.relayType?.[0]}
                        </span>
                        <button
                            type="submit"
                            disabled={isPending}
                            className="bg-dark-700 hover:bg-primary hover:text-white text-dark-muted px-4 py-1.5 rounded-lg transition-colors disabled:opacity-50 text-sm font-medium flex items-center gap-1.5 ml-auto"
                        >
                            {isPending ? <ArrowPathIcon className="w-4 h-4 animate-spin" /> : <ArrowDownTrayIcon className="w-4 h-4" />}
                            Save
                        </button>
                    </div>
                </form>
            </div>

            <div className="pt-4 border-t border-dark-700 space-y-3">
                <div className="flex justify-between items-center text-sm">
                    <span className="text-dark-muted flex items-center gap-2">
                        <CpuChipIcon className="w-4 h-4" /> MAC Address
                    </span>
                    <span className="font-mono text-xs bg-dark-900 px-2 py-1 rounded text-gray-300 border border-dark-700/50">
                        {device.macAddress}
                    </span>
                </div>

                <div className="flex justify-between items-center text-sm">
                    <span className="text-dark-muted flex items-center gap-2">
                        <BoltIcon className="w-4 h-4" /> Last Seen
                    </span>
                    <span className="text-xs text-gray-400" suppressHydrationWarning>
                        {new Date(device.lastSeen).toLocaleString()}
                    </span>
                </div>

                <div className="flex items-center justify-between text-xs text-primary pt-2 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="flex items-center gap-1.5"><UsersIcon className="w-4 h-4" /> Manage Access</span>
                    <span>→</span>
                </div>
            </div>
        </div>
    )
}