'use client'

import { updateUser, UserState } from '../../actions'
import { useActionState } from 'react'
import {
    UserIcon,
    EnvelopeIcon,
    CreditCardIcon,
    BriefcaseIcon,
    ArrowDownTrayIcon,
    ArrowPathIcon,
    LockClosedIcon,
    MapPinIcon,
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

    // Рятівний клас для вимкнення білого фону при автозаповненні
    const autofillFix = "[&:-webkit-autofill]:[-webkit-text-fill-color:white] [&:-webkit-autofill]:[transition:background-color_9999s_ease-in-out_0s]";

    return (
        <form action={action} className="space-y-6">
            <input type="hidden" name="id" value={user.id} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-sm text-dark-muted flex items-center gap-2">
                        <UserIcon className="w-4 h-4" /> Full Name
                    </label>
                    <input
                        name="name"
                        defaultValue={user.name || ''}
                        className={clsx(
                            "w-full bg-dark-900 border rounded-xl px-4 py-3 text-white focus:border-primary outline-none transition-colors",
                            autofillFix,
                            state.errors?.name ? "border-red-500" : "border-dark-700"
                        )}
                    />
                    {state.errors?.name && <p className="text-xs text-red-400">{state.errors.name[0]}</p>}
                </div>
                <div className="space-y-2">
                    <label className="text-sm text-dark-muted flex items-center gap-2">
                        <BriefcaseIcon className="w-4 h-4" /> Job Title
                    </label>
                    <input
                        name="jobTitle"
                        defaultValue={user.jobTitle || ''}
                        className={clsx(
                            "w-full bg-dark-900 border border-dark-700 rounded-xl px-4 py-3 text-white focus:border-primary outline-none transition-colors",
                            autofillFix
                        )}
                    />
                </div>
            </div>

            {user.role !== 'GUEST' && (
                <div className="space-y-2">
                    <label className="text-sm text-dark-muted flex items-center gap-2">
                        <EnvelopeIcon className="w-4 h-4" /> Email Address
                    </label>
                    <input
                        name="email"
                        type="email"
                        defaultValue={user.email || ''}
                        className={clsx(
                            "w-full bg-dark-900 border rounded-xl px-4 py-3 text-white focus:border-primary outline-none transition-colors",
                            autofillFix,
                            state.errors?.email ? "border-red-500" : "border-dark-700"
                        )}
                    />
                    {state.errors?.email && <p className="text-xs text-red-400">{state.errors.email[0]}</p>}
                </div>
            )}

            <div className="space-y-2">
                <label className="text-sm text-dark-muted flex items-center gap-2">
                    <CreditCardIcon className="w-4 h-4" /> RFID Card UID
                </label>
                <input
                    name="cardUid"
                    defaultValue={user.cardUid || ''}
                    placeholder="Scanned UID will appear here..."
                    className={clsx(
                        "w-full bg-dark-900 border border-dark-700 rounded-xl px-4 py-3 text-white font-mono focus:border-primary outline-none transition-colors",
                        autofillFix
                    )}
                />
                <p className="text-xs text-dark-muted">Use the &quot;Scan&quot; function on the Add User page to find new card UIDs.</p>
            </div>

            {user.role === 'GUEST' && (
                <div className="space-y-4 bg-dark-900/40 p-5 rounded-2xl border border-dark-700">
                    <h3 className="text-white font-medium flex items-center gap-2 text-sm">
                        <ClockIcon className="w-4 h-4 text-yellow-500" />
                        Time Restrictions
                    </h3>

                    <div className="grid grid-cols-1 gap-5">
                        <div className="space-y-2">
                            <label className="text-xs text-dark-muted flex items-center gap-1.5">
                                Valid From
                            </label>
                            <div className="grid grid-cols-[1fr_105px] gap-2">
                                <CustomSelect
                                    name="validFromDate"
                                    options={dateOptions}
                                    defaultValue={initialFrom.date || dateOptions[5].value}
                                    icon={<CalendarIcon className="w-4 h-4" />}
                                />
                                <CustomSelect
                                    name="validFromTime"
                                    options={timeOptions}
                                    defaultValue={initialFrom.time || '09:00'}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs text-dark-muted flex items-center gap-1.5">
                                Valid Until
                            </label>
                            <div className="grid grid-cols-[1fr_105px] gap-2">
                                <CustomSelect
                                    name="validUntilDate"
                                    options={dateOptions}
                                    defaultValue={initialUntil.date || dateOptions[6].value}
                                    icon={<CalendarIcon className="w-4 h-4" />}
                                />
                                <CustomSelect
                                    name="validUntilTime"
                                    options={timeOptions}
                                    defaultValue={initialUntil.time || '18:00'}
                                />
                            </div>
                            {state.errors?.validUntilTime && <p className="text-xs text-red-400">{state.errors.validUntilTime[0]}</p>}
                        </div>
                    </div>
                </div>
            )}

            <hr className="border-dark-700" />

            <div className="space-y-4">
                <div className={clsx(
                    "flex items-center justify-between bg-dark-900 p-4 rounded-xl border transition-colors",
                    isSelf ? "border-yellow-500/20 opacity-80" : "border-dark-700"
                )}>
                    <div>
                        <h3 className="text-white font-medium flex items-center gap-2 text-sm">
                            Account Status
                            {isSelf && <span className="text-[10px] bg-yellow-500/10 text-yellow-500 px-2 py-0.5 rounded border border-yellow-500/20 uppercase font-bold">Protected</span>}
                        </h3>
                        <p className="text-sm text-dark-muted">
                            {isSelf
                                ? "You cannot block your own account."
                                : "Disable to block access without deleting data."}
                        </p>
                    </div>

                    {isSelf ? (
                        <LockClosedIcon className="w-6 h-6 text-dark-muted" />
                    ) : (
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" name="isActive" defaultChecked={user.isActive} className="sr-only peer" />
                            <div className="w-11 h-6 bg-dark-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                        </label>
                    )}
                </div>

                <div className="flex items-center justify-between bg-dark-900 p-4 rounded-xl border border-dark-700">
                    <div>
                        <h3 className="text-white font-medium flex items-center gap-2 text-sm">
                            <MapPinIcon className="w-4 h-4 text-blue-400" />
                            Location Status (Anti-passback)
                        </h3>
                        <p className="text-sm text-dark-muted">
                            Manual override. Turn off if the user left without scanning their card.
                        </p>
                    </div>

                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" name="isInside" defaultChecked={user.isInside} className="sr-only peer" />
                        <div className="w-11 h-6 bg-dark-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                    </label>
                </div>
            </div>

            {state.message && (
                <div className="text-red-400 text-sm bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                    {state.message}
                </div>
            )}

            <button
                type="submit"
                disabled={isPending}
                className="w-full bg-primary hover:bg-primary-hover text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-all disabled:opacity-70"
            >
                {isPending ? <ArrowPathIcon className="w-5 h-5 animate-spin" /> : <ArrowDownTrayIcon className="w-5 h-5" />}
                {isPending ? 'Saving...' : 'Save Changes'}
            </button>
        </form>
    )
}