'use client'

import { useState, useRef, useEffect } from 'react'
import {
    LockOpenIcon,
    WifiIcon,
    ArrowPathIcon,
    Cog6ToothIcon,
    NoSymbolIcon,
    CreditCardIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Badge } from '@/app/ui/badge'

type Device = { id: string; name: string; macAddress: string; isOnline: boolean; relayTime: number }
type User = { id: string; name: string; jobTitle: string | null; cardUid: string | null; isActive: boolean; isInside: boolean; allowedDevices: Device[] }

export function EmployeePortal({ user }: { user: User }) {
    const [unlockingId, setUnlockingId] = useState<string | null>(null)
    const [devices, setDevices] = useState<Device[]>(user.allowedDevices)
    const socketRef = useRef<WebSocket | null>(null)
    const router = useRouter()

    useEffect(() => {
        setDevices(user.allowedDevices)
    }, [user.allowedDevices])

    useEffect(() => {
        const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8080'
        const ws = new WebSocket(wsUrl)

        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data)

                if (data.type === 'DEVICE_STATUS') {
                    setDevices(prevDevices =>
                        prevDevices.map(device =>
                            device.macAddress === data.mac
                                ? { ...device, isOnline: data.isOnline }
                                : device
                        )
                    )
                }

                if (data.type === 'EVENT' || data.type === 'PASSAGE_CONFIRMED') {
                    router.refresh()
                }
            } catch {
                // Ignore malformed WS packets
            }
        }

        socketRef.current = ws
        return () => {
            if (ws.readyState === WebSocket.OPEN) {
                ws.close()
            }
        }
    }, [router])

    const handleUnlock = (device: Device) => {
        if (!device.isOnline || !socketRef.current) return

        if (socketRef.current.readyState === WebSocket.OPEN) {
            setUnlockingId(device.id)

            const commandMsg = {
                type: 'COMMAND',
                target: device.macAddress,
                command: 'UNLOCK',
                userId: user.id
            }

            socketRef.current.send(JSON.stringify(commandMsg))
            const timeoutDuration = device.relayTime ? device.relayTime * 1000 : 5000;

            setTimeout(() => {
                setUnlockingId(null)
            }, timeoutDuration)
        } else {
            alert("Connection error: Cannot reach the server.")
        }
    }

    return (
        <div className="p-6 md:p-8 space-y-6 max-w-4xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-200">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Employee Portal</h1>
                    <p className="text-slate-500 text-sm mt-0.5">Manage digital access and remote door permissions.</p>
                </div>
                <Link
                    href="/dashboard/settings"
                    className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 px-3.5 py-2 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 shadow-sm"
                >
                    <Cog6ToothIcon className="w-4 h-4" />
                    Account Settings
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Employee Pass Card */}
                <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col justify-between space-y-6">
                    <div>
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Employee Badge</span>
                                <h2 className="text-xl font-bold text-slate-900 mt-0.5">{user.name}</h2>
                                <p className="text-sm text-slate-600 font-medium">{user.jobTitle || 'Staff Member'}</p>
                            </div>
                            <Badge variant={user.isActive ? 'success' : 'danger'} dot>
                                {user.isActive ? 'Active' : 'Blocked'}
                            </Badge>
                        </div>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-2">
                        <div className="flex justify-between items-center text-xs">
                            <span className="text-slate-500 font-medium flex items-center gap-1">
                                <CreditCardIcon className="w-3.5 h-3.5 text-slate-400" /> Card UID
                            </span>
                            <span className="text-slate-600 font-medium">
                                Location: <strong className="text-slate-900">{user.isInside ? 'Inside' : 'Outside'}</strong>
                            </span>
                        </div>
                        <p className="font-mono text-base font-semibold text-slate-800 tracking-wider">
                            {user.cardUid || 'NO BADGE ASSIGNED'}
                        </p>
                    </div>
                </div>

                {/* Authorized Doors */}
                <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col space-y-4">
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                        Assigned Access Points
                    </h3>

                    {!user.isActive ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-slate-500 text-center py-8">
                            <NoSymbolIcon className="w-8 h-8 mb-2 text-slate-300" />
                            <p className="text-sm font-medium text-slate-700">Account Inactive</p>
                            <p className="text-xs text-slate-400 mt-0.5">Please contact your administrator for activation.</p>
                        </div>
                    ) : devices.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-slate-500 text-center py-8">
                            <WifiIcon className="w-8 h-8 mb-2 text-slate-300" />
                            <p className="text-sm font-medium text-slate-700">No Access Points</p>
                            <p className="text-xs text-slate-400 mt-0.5">No doors have been assigned to your profile yet.</p>
                        </div>
                    ) : (
                        <div className="space-y-2.5">
                            {devices.map((device) => {
                                const isUnlocking = unlockingId === device.id;

                                return (
                                    <div key={device.id} className="bg-slate-50 border border-slate-200 p-3.5 rounded-lg flex items-center justify-between">
                                        <div>
                                            <h4 className="text-sm font-semibold text-slate-900">{device.name}</h4>
                                            <div className="mt-1">
                                                <Badge size="sm" variant={device.isOnline ? 'success' : 'neutral'} dot pulse={device.isOnline}>
                                                    {device.isOnline ? 'Ready' : 'Offline'}
                                                </Badge>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => handleUnlock(device)}
                                            disabled={!device.isOnline || isUnlocking}
                                            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors bg-slate-900 hover:bg-slate-800 text-white disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 shadow-sm"
                                        >
                                            {isUnlocking ? <ArrowPathIcon className="w-3.5 h-3.5 animate-spin" /> : <LockOpenIcon className="w-3.5 h-3.5" />}
                                            {isUnlocking ? 'Unlocking...' : 'Unlock Door'}
                                        </button>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}