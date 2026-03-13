'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { useFormStatus } from 'react-dom'
import { Router, Cpu, AlignLeft, Loader2 } from 'lucide-react'
import { createDeviceAction, DeviceState } from '../actions'

// Окремий компонент для кнопки, щоб використовувати useFormStatus
function SubmitButton() {
    const { pending } = useFormStatus()

    return (
        <button
            type="submit"
            disabled={pending}
            className="flex-1 bg-primary hover:bg-blue-600 text-white py-3 rounded-xl font-medium transition-colors shadow-lg shadow-blue-500/20 disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
        >
            {pending ? (
                <>
                    <Loader2 size={18} className="animate-spin" />
                    Registering...
                </>
            ) : (
                'Register Device'
            )}
        </button>
    )
}

export function CreateDeviceForm() {
    // Початковий стан для useActionState
    const initialState: DeviceState = { message: null, errors: {} };
    const [state, formAction] = useActionState(createDeviceAction, initialState);

    return (
        <form action={formAction} className="space-y-6">
            {/* Виведення загальної помилки (наприклад, якщо такий MAC вже є) */}
            {state.message && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-sm text-center font-medium">
                    {state.message}
                </div>
            )}

            <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium text-gray-300 ml-1">Device Name</label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Router size={18} className="text-dark-muted" />
                    </div>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        placeholder="e.g. Main Entrance"
                        className={`w-full bg-dark-900 border rounded-xl py-2.5 pl-10 pr-4 text-white focus:outline-none focus:ring-1 transition-all ${
                            state.errors?.name ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500' : 'border-dark-700 focus:border-primary focus:ring-primary'
                        }`}
                    />
                </div>
                {state.errors?.name && (
                    <p className="text-xs text-red-400 ml-1">{state.errors.name[0]}</p>
                )}
            </div>

            <div className="space-y-2">
                <label htmlFor="macAddress" className="text-sm font-medium text-gray-300 ml-1">MAC Address</label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Cpu size={18} className="text-dark-muted" />
                    </div>
                    <input
                        type="text"
                        id="macAddress"
                        name="macAddress"
                        placeholder="e.g. 24:0A:C4:00:01:10"
                        className={`w-full bg-dark-900 border rounded-xl py-2.5 pl-10 pr-4 text-white uppercase focus:outline-none focus:ring-1 transition-all ${
                            state.errors?.macAddress ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500' : 'border-dark-700 focus:border-primary focus:ring-primary'
                        }`}
                    />
                </div>
                {state.errors?.macAddress ? (
                    <p className="text-xs text-red-400 ml-1">{state.errors.macAddress[0]}</p>
                ) : (
                    <p className="text-xs text-dark-muted ml-1">
                        Found in the Arduino Serial Monitor when ESP32 boots up.
                    </p>
                )}
            </div>

            <div className="space-y-2">
                <label htmlFor="description" className="text-sm font-medium text-gray-300 ml-1">Description (Optional)</label>
                <div className="relative">
                    <div className="absolute top-3 left-3 pointer-events-none">
                        <AlignLeft size={18} className="text-dark-muted" />
                    </div>
                    <textarea
                        id="description"
                        name="description"
                        rows={3}
                        placeholder="Additional notes about location or installation..."
                        className={`w-full bg-dark-900 border rounded-xl py-2.5 pl-10 pr-4 text-white focus:outline-none focus:ring-1 transition-all resize-none ${
                            state.errors?.description ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500' : 'border-dark-700 focus:border-primary focus:ring-primary'
                        }`}
                    />
                </div>
                {state.errors?.description && (
                    <p className="text-xs text-red-400 ml-1">{state.errors.description[0]}</p>
                )}
            </div>

            <div className="pt-4 flex gap-3">
                <Link
                    href="/dashboard/devices"
                    className="flex-1 bg-dark-700 hover:bg-dark-600 text-white py-3 rounded-xl text-center font-medium transition-colors"
                >
                    Cancel
                </Link>
                <SubmitButton />
            </div>
        </form>
    )
}