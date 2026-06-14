'use client'

import { useState, useRef, useEffect } from 'react'
import {
    KeyIcon,
    LockOpenIcon,
    WifiIcon,
    ArrowPathIcon,
    Cog6ToothIcon,
    NoSymbolIcon,
    MapPinIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

type Device = { id: string; name: string; macAddress: string; isOnline: boolean; relayTime: number }
type User = { id: string; name: string; jobTitle: string | null; cardUid: string | null; isActive: boolean; isInside: boolean; allowedDevices: Device[] }

export function EmployeePortal({ user }: { user: User }) {
    const [unlockingId, setUnlockingId] = useState<string | null>(null)
    const [prevAllowedDevices, setPrevAllowedDevices] = useState<Device[]>(user.allowedDevices)
    const [devices, setDevices] = useState<Device[]>(user.allowedDevices)

    const socketRef = useRef<WebSocket | null>(null)
    const router = useRouter()

    if (user.allowedDevices !== prevAllowedDevices) {
        setPrevAllowedDevices(user.allowedDevices)
        setDevices(user.allowedDevices)
    }

    useEffect(() => {
        const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8080'
        const ws = new WebSocket(wsUrl)

        ws.onopen = () => console.log('Employee connected to WS')

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
            } catch (e) {
                console.error("WS Message Error:", e)
            }
        }

        socketRef.current = ws
        return () => ws.close()
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
        <div className="p-6 space-y-8 text-white max-w-5xl mx-auto">
            <div className="flex justify-between items-end mb-10">
                <div>
                    <h1 className="text-3xl font-bold">My Access Portal</h1>
                    <p className="text-dark-muted mt-1">View your credentials and manage remote access.</p>
                </div>
                <Link
                    href="/dashboard/settings"
                    className="bg-dark-800 hover:bg-dark-700 border border-dark-700 px-4 py-2.5 rounded-xl font-medium transition-colors flex items-center gap-2 text-sm"
                >
                    <Cog6ToothIcon className="w-5 h-5" />
                    Settings
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">

                <div className="flex flex-col space-y-4">
                    <h3 className="text-xl font-bold px-1 flex items-center gap-2">
                        <KeyIcon className="text-primary w-5 h-5" /> Digital Pass
                    </h3>

                    <div className="flex-1 bg-gradient-to-br from-dark-800 to-dark-900 border border-dark-700 p-8 rounded-3xl shadow-2xl relative overflow-hidden flex flex-col">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
                        <div className="relative z-10 flex-1 flex flex-col justify-between">
                            <div className="flex justify-between items-start mb-8">
                                <div>
                                    <p className="text-sm text-dark-muted mb-1">Employee</p>
                                    <h2 className="text-2xl font-bold text-white">{user.name}</h2>
                                    <p className="text-primary font-medium">{user.jobTitle || 'Staff Member'}</p>
                                </div>
                                <div className={`px-3 py-1 rounded-full text-xs font-bold border ${user.isActive ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                                    {user.isActive ? 'ACTIVE' : 'BLOCKED'}
                                </div>
                            </div>

                            <div className="bg-dark-950/50 p-4 rounded-2xl border border-dark-700/50 backdrop-blur-sm mt-auto">
                                <div className="flex justify-between items-center mb-2">
                                    <p className="text-xs text-dark-muted uppercase tracking-wider">Card UID</p>
                                    <span className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${user.isInside ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'}`}>
                                        <MapPinIcon className="w-3 h-3" />
                                        {user.isInside ? 'Inside' : 'Outside'}
                                    </span>
                                </div>
                                <p className="font-mono text-lg text-white tracking-widest">{user.cardUid || 'NO CARD ASSIGNED'}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col space-y-4">
                    <h3 className="text-xl font-bold px-1 flex items-center gap-2">
                        <LockOpenIcon className="text-purple-400 w-5 h-5" /> Permitted Access Points
                    </h3>

                    <div className="flex-1 bg-dark-800 border border-dark-700 rounded-3xl p-6 flex flex-col">
                        {!user.isActive ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-red-400 text-center opacity-80 py-10">
                                <NoSymbolIcon className="w-12 h-12 mb-3 opacity-50" />
                                <p className="font-bold">Access Denied</p>
                                <p className="text-sm mt-1">Your account has been deactivated by the administrator.</p>
                            </div>
                        ) : devices.length === 0 ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-dark-muted text-center py-10">
                                <WifiIcon className="w-12 h-12 mb-3 opacity-20" />
                                <p>No access points assigned</p>
                                <p className="text-sm mt-1">Contact your administrator to grant access.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-3">
                                {devices.map((device) => {
                                    const isUnlocking = unlockingId === device.id;

                                    return (
                                        <div key={device.id} className="bg-dark-900 border border-dark-700 p-4 rounded-2xl flex items-center justify-between group hover:border-primary/50 transition-all">
                                            <div>
                                                <h4 className="font-bold text-white">{device.name}</h4>
                                                <p className="text-xs text-dark-muted mt-0.5 flex items-center gap-1.5">
                                                    <span className={`w-1.5 h-1.5 rounded-full ${device.isOnline ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                                    {device.isOnline ? 'Online' : 'Offline'}
                                                </p>
                                            </div>

                                            <button
                                                onClick={() => handleUnlock(device)}
                                                disabled={!device.isOnline || isUnlocking}
                                                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 disabled:opacity-50 ${
                                                    isUnlocking
                                                        ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                                        : 'bg-primary/10 hover:bg-primary text-primary hover:text-white'
                                                }`}
                                            >
                                                {isUnlocking ? <ArrowPathIcon className="w-4 h-4 animate-spin" /> : <LockOpenIcon className="w-4 h-4" />}
                                                {isUnlocking ? 'Opened' : 'Unlock'}
                                            </button>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    )
}