'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { useFormStatus } from 'react-dom'
import { ArrowPathIcon } from '@heroicons/react/24/outline'
import { createDeviceAction, DeviceState } from '../actions'

function SubmitButton() {
    const { pending } = useFormStatus()

    return (
        <button
            type="submit"
            disabled={pending}
            className="flex-1 bg-slate-900 hover:bg-slate-800 text-white py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
        >
            {pending ? (
                <>
                    <ArrowPathIcon className="w-4 h-4 animate-spin" />
                    Registering...
                </>
            ) : (
                'Register Device'
            )}
        </button>
    )
}

export function CreateDeviceForm() {
    const initialState: DeviceState = { message: null, errors: {} };
    const [state, formAction] = useActionState(createDeviceAction, initialState);

    return (
        <form action={formAction} className="space-y-4">
            {state.message && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-lg text-sm text-center font-medium">
                    {state.message}
                </div>
            )}

            <div className="space-y-1.5">
                <label htmlFor="name" className="text-xs font-semibold text-slate-700">Device Name</label>
                <input
                    type="text"
                    id="name"
                    name="name"
                    placeholder="e.g. Main Entrance"
                    className={`w-full bg-slate-50 border rounded-lg py-2 px-3 text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-slate-900 transition-colors ${
                        state.errors?.name ? 'border-rose-400' : 'border-slate-200'
                    }`}
                />
                {state.errors?.name && (
                    <p className="text-xs text-rose-600 font-medium">{state.errors.name[0]}</p>
                )}
            </div>

            <div className="space-y-1.5">
                <label htmlFor="macAddress" className="text-xs font-semibold text-slate-700">MAC Address</label>
                <input
                    type="text"
                    id="macAddress"
                    name="macAddress"
                    placeholder="e.g. 24:0A:C4:00:01:10"
                    className={`w-full bg-slate-50 border rounded-lg py-2 px-3 text-sm text-slate-900 uppercase font-mono focus:bg-white focus:outline-none focus:border-slate-900 transition-colors ${
                        state.errors?.macAddress ? 'border-rose-400' : 'border-slate-200'
                    }`}
                />
                {state.errors?.macAddress ? (
                    <p className="text-xs text-rose-600 font-medium">{state.errors.macAddress[0]}</p>
                ) : (
                    <p className="text-[11px] text-slate-500">
                        Format: XX:XX:XX:XX:XX:XX (from serial monitor or device label)
                    </p>
                )}
            </div>

            <div className="space-y-1.5">
                <label htmlFor="description" className="text-xs font-semibold text-slate-700">Description (Optional)</label>
                <textarea
                    id="description"
                    name="description"
                    rows={3}
                    placeholder="Location details or notes..."
                    className={`w-full bg-slate-50 border rounded-lg py-2 px-3 text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-slate-900 transition-colors resize-none ${
                        state.errors?.description ? 'border-rose-400' : 'border-slate-200'
                    }`}
                />
                {state.errors?.description && (
                    <p className="text-xs text-rose-600 font-medium">{state.errors.description[0]}</p>
                )}
            </div>

            <div className="pt-2 flex gap-3">
                <Link
                    href="/dashboard/devices"
                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-lg text-center text-sm font-medium transition-colors"
                >
                    Cancel
                </Link>
                <SubmitButton />
            </div>
        </form>
    )
}