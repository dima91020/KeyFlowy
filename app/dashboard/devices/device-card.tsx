'use client'

import { updateDeviceName, deleteDevice, DeviceState } from './actions'
import { useActionState } from 'react'
import { Wifi, WifiOff, Cpu, Trash2, Save, Activity, Loader2 } from 'lucide-react'
import clsx from 'clsx'

type DeviceProps = {
    device: {
        id: string
        name: string
        macAddress: string
        isOnline: boolean
        lastSeen: Date
    }
}

export function DeviceCard({ device }: DeviceProps) {
    const initialState: DeviceState = { message: null, errors: {} }
    const [state, action, isPending] = useActionState(updateDeviceName, initialState)

    return (
        <div
            className={`relative bg-dark-800 rounded-2xl border p-6 transition-all ${
                device.isOnline ? 'border-green-500/30 shadow-[0_0_20px_rgba(34,197,94,0.1)]' : 'border-dark-700 opacity-80'
            }`}
        >
            {/* Header: Icon + Status Area */}
            <div className="flex justify-between items-start mb-6">
                {/* Left: Icon */}
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    device.isOnline ? 'bg-green-500/10 text-green-400' : 'bg-dark-700 text-dark-muted'
                }`}>
                    {device.isOnline ? <Wifi size={24} /> : <WifiOff size={24} />}
                </div>

                {/* Right: Status Badge + Delete Button Wrapper */}
                <div className="flex items-center gap-2">
                    {/* Status Badge */}
                    <div className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 border ${
                        device.isOnline
                            ? 'bg-green-500/10 text-green-400 border-green-500/20'
                            : 'bg-red-500/10 text-red-400 border-red-500/20'
                    }`}>
                        <div className={`w-2 h-2 rounded-full ${device.isOnline ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                        {device.isOnline ? 'ONLINE' : 'OFFLINE'}
                    </div>

                    {/* Delete Button (Тепер поруч, а не зверху) */}
                    {!device.isOnline && (
                        <form action={deleteDevice}>
                            <input type="hidden" name="id" value={device.id} />
                            <button
                                type="submit"
                                className="bg-dark-900 border border-dark-600 hover:bg-red-900/30 hover:border-red-500/50 hover:text-red-400 text-dark-muted p-1.5 rounded-full transition-all flex items-center justify-center"
                                title="Remove Device"
                            >
                                <Trash2 size={16} />
                            </button>
                        </form>
                    )}
                </div>
            </div>

            {/* Form for editing name */}
            <form action={action} className="space-y-4">
                <input type="hidden" name="id" value={device.id} />

                <div className="space-y-1">
                    <label className="text-xs text-dark-muted font-mono uppercase">Device Name</label>
                    <div className="flex gap-2">
                        <input
                            name="name"
                            defaultValue={device.name}
                            className={clsx(
                                "flex-1 bg-dark-900 border rounded-lg px-3 py-2 text-sm text-white focus:border-primary outline-none transition-colors",
                                state.errors?.name ? "border-red-500" : "border-dark-700"
                            )}
                        />
                        <button
                            type="submit"
                            disabled={isPending}
                            className="bg-dark-700 hover:bg-primary hover:text-white text-dark-muted p-2 rounded-lg transition-colors disabled:opacity-50"
                        >
                            {isPending ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                        </button>
                    </div>
                    {state.errors?.name && (
                        <p className="text-red-400 text-xs">{state.errors.name[0]}</p>
                    )}
                </div>
            </form>

            {/* Technical Info */}
            <div className="mt-6 pt-4 border-t border-dark-700 space-y-3">
                <div className="flex justify-between items-center text-sm">
                    <span className="text-dark-muted flex items-center gap-2">
                        <Cpu size={14} /> MAC Address
                    </span>
                    <span className="font-mono text-xs bg-dark-900 px-2 py-1 rounded text-gray-300 border border-dark-700/50">
                        {device.macAddress}
                    </span>
                </div>

                <div className="flex justify-between items-center text-sm">
                    <span className="text-dark-muted flex items-center gap-2">
                        <Activity size={14} /> Last Seen
                    </span>
                    <span
                        className="text-xs text-gray-400"
                        suppressHydrationWarning
                    >
                        {new Date(device.lastSeen).toLocaleString()}
                    </span>
                </div>
            </div>
        </div>
    )
}