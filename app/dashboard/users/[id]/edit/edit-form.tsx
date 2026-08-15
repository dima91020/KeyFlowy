'use client'

import { updateUser, UserState } from '../../actions'
import { useActionState } from 'react'
import {
    ArrowDownTrayIcon,
    ArrowPathIcon,
    LockClosedIcon,
    CalendarIcon,
    ClockIcon
} from '@heroicons/react/24/outline'
import clsx from 'clsx'
import { CustomSelect } from "@/app/ui/logs/custom-select"

type EditFormProps = {
    user: {
        id: string
        name: string | null
        email: string | null
        jobTitle: string | null
        cardUid: string | null
        isActive: boolean
        isInside: boolean
        role: string
        validFrom: Date | string | null
        validUntil: Date | string | null
    },
    currentUserId: string | null | undefined
}

interface Option {
    value: string;
    label: string;
}

const generateDateOptions = (): Option[] => {
    const opts: Option[] = []
    const today = new Date()
    for (let i = -5; i < 30; i++) {
        const d = new Date(today)
        d.setDate(today.getDate() + i)
        const val = d.toISOString().split('T')[0]
        const labelDate = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
        let label = `${d.toLocaleDateString('en-GB', { weekday: 'short' })}, ${labelDate}`
        if (i === 0) label = `Today, ${labelDate}`
        if (i === 1) label = `Tomorrow, ${labelDate}`
        if (i === -1) label = `Yesterday, ${labelDate}`
        opts.push({ value: val, label })
    }
    return opts
}

const generateTimeOptions = (): Option[] => {
    const opts: Option[] = []
    for (let h = 0; h < 24; h++) {
        for (let m = 0; m < 60; m += 30) {
            const val = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`
            opts.push({ value: val, label: val })
        }
    }
    return opts
}

export function EditUserForm({ user, currentUserId }: EditFormProps) {
    const initialState: UserState = { message: null, errors: {} }
    const [state, action, isPending] = useActionState(updateUser, initialState)

    const isSelf = user.id === currentUserId;
    const dateOptions = generateDateOptions()
    const timeOptions = generateTimeOptions()

    const getInitialDateTime = (dateStr: Date | string | null) => {
        if (!dateStr) return { date: '', time: '' }
        const d = new Date(dateStr)
        if (isNaN(d.getTime())) return { date: '', time: '' }
        const pad = (num: number) => String(num).padStart(2, '0')
        return {
            date: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
            time: `${pad(d.getHours())}:${pad(d.getMinutes())}`
        }
    }

    const initialFrom = getInitialDateTime(user.validFrom)
    const initialUntil = getInitialDateTime(user.validUntil)

    return (
        <form action={action} className="space-y-4">
            <input type="hidden" name="id" value={user.id} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">Full Name</label>
                    <input
                        name="name"
                        defaultValue={user.name || ''}
                        className={clsx(
                            "w-full bg-slate-50 border rounded-lg px-3 py-2 text-xs text-slate-900 focus:bg-white focus:border-slate-900 outline-none transition-colors",
                            state.errors?.name ? "border-rose-400" : "border-slate-200"
                        )}
                    />
                    {state.errors?.name && <p className="text-xs text-rose-600">{state.errors.name[0]}</p>}
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">Job Title</label>
                    <input
                        name="jobTitle"
                        defaultValue={user.jobTitle || ''}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:bg-white focus:border-slate-900 outline-none transition-colors"
                    />
                </div>
            </div>

            {user.role !== 'GUEST' && (
                <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">Email Address</label>
                    <input
                        name="email"
                        type="email"
                        defaultValue={user.email || ''}
                        className={clsx(
                            "w-full bg-slate-50 border rounded-lg px-3 py-2 text-xs text-slate-900 focus:bg-white focus:border-slate-900 outline-none transition-colors",
                            state.errors?.email ? "border-rose-400" : "border-slate-200"
                        )}
                    />
                    {state.errors?.email && <p className="text-xs text-rose-600">{state.errors.email[0]}</p>}
                </div>
            )}

            <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">RFID Card UID</label>
                <input
                    name="cardUid"
                    defaultValue={user.cardUid || ''}
                    placeholder="UID..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 font-mono focus:bg-white focus:border-slate-900 outline-none transition-colors uppercase tracking-wider"
                />
            </div>

            {user.role === 'GUEST' && (
                <div className="space-y-3 bg-slate-50 p-3.5 rounded-lg border border-slate-200">
                    <h3 className="text-slate-800 font-semibold flex items-center gap-1.5 text-xs">
                        <ClockIcon className="w-4 h-4 text-slate-500" />
                        Pass Validity Window
                    </h3>

                    <div className="grid grid-cols-1 gap-3">
                        <div className="space-y-1">
                            <span className="text-[11px] font-medium text-slate-500">Valid From</span>
                            <div className="grid grid-cols-[1fr_95px] gap-2">
                                <CustomSelect
                                    name="validFromDate"
                                    options={dateOptions}
                                    defaultValue={initialFrom.date || dateOptions[5].value}
                                    icon={<CalendarIcon className="w-3.5 h-3.5" />}
                                />
                                <CustomSelect
                                    name="validFromTime"
                                    options={timeOptions}
                                    defaultValue={initialFrom.time || '09:00'}
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <span className="text-[11px] font-medium text-slate-500">Valid Until</span>
                            <div className="grid grid-cols-[1fr_95px] gap-2">
                                <CustomSelect
                                    name="validUntilDate"
                                    options={dateOptions}
                                    defaultValue={initialUntil.date || dateOptions[6].value}
                                    icon={<CalendarIcon className="w-3.5 h-3.5" />}
                                />
                                <CustomSelect
                                    name="validUntilTime"
                                    options={timeOptions}
                                    defaultValue={initialUntil.time || '18:00'}
                                />
                            </div>
                            {state.errors?.validUntilTime && <p className="text-xs text-rose-600">{state.errors.validUntilTime[0]}</p>}
                        </div>
                    </div>
                </div>
            )}

            <div className="space-y-3 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between bg-slate-50 p-3 rounded-lg border border-slate-200">
                    <div>
                        <h3 className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
                            Account Access State
                            {isSelf && <span className="text-[10px] text-slate-500 bg-slate-200 px-1.5 py-0.5 rounded font-normal">Protected</span>}
                        </h3>
                        <p className="text-[11px] text-slate-500">
                            {isSelf ? "Self-deactivation is disabled." : "Toggle active state to permit or restrict card scans."}
                        </p>
                    </div>

                    {isSelf ? (
                        <LockClosedIcon className="w-4 h-4 text-slate-400" />
                    ) : (
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" name="isActive" defaultChecked={user.isActive} className="sr-only peer" />
                            <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-slate-900"></div>
                        </label>
                    )}
                </div>

                <div className="flex items-center justify-between bg-slate-50 p-3 rounded-lg border border-slate-200">
                    <div>
                        <h3 className="text-xs font-semibold text-slate-900">
                            Location Status (Anti-Passback Override)
                        </h3>
                        <p className="text-[11px] text-slate-500">
                            Manual toggle: switch location state if user left without scanning.
                        </p>
                    </div>

                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" name="isInside" defaultChecked={user.isInside} className="sr-only peer" />
                        <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-slate-900"></div>
                    </label>
                </div>
            </div>

            {state.message && (
                <div className="text-rose-700 text-xs bg-rose-50 p-2.5 rounded-lg border border-rose-200">
                    {state.message}
                </div>
            )}

            <button
                type="submit"
                disabled={isPending}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white py-2.5 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
            >
                {isPending ? <ArrowPathIcon className="w-3.5 h-3.5 animate-spin" /> : <ArrowDownTrayIcon className="w-3.5 h-3.5" />}
                {isPending ? 'Saving...' : 'Save Changes'}
            </button>
        </form>
    )
}