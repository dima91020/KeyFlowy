'use client'

import { useActionState, useState } from 'react'
import { changePasswordAction, updateEmailAction } from './actions'
import {
    CheckCircleIcon,
    EyeIcon,
    EyeSlashIcon,
    EnvelopeIcon,
    LockClosedIcon,
    ArrowDownTrayIcon,
    ArrowPathIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'

export function SettingsClient({ user }: { user: { email: string, role: string } }) {
    const [passState, passAction, isPassPending] = useActionState(changePasswordAction, { message: null, success: false })
    const [emailState, emailAction, isEmailPending] = useActionState(updateEmailAction, { message: null, success: false })

    const [showCurrentPassword, setShowCurrentPassword] = useState(false)
    const [showNewPassword, setShowNewPassword] = useState(false)

    return (
        <div className="space-y-6">
            {/* Email Address Update for Admin */}
            {user.role === 'ADMIN' && (
                <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                    <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">
                        Account Email
                    </h2>

                    <form action={emailAction} className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-700">Email Address (Login)</label>
                            <div className="relative">
                                <EnvelopeIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                                <input
                                    type="email"
                                    name="email"
                                    defaultValue={user.email}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 pl-9 pr-3 text-xs text-slate-900 outline-none focus:bg-white focus:border-slate-900 transition-colors"
                                />
                            </div>
                        </div>

                        {emailState.message && (
                            <div className={`p-2.5 rounded-lg text-xs font-medium flex items-center gap-1.5 border ${
                                emailState.success ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'
                            }`}>
                                {emailState.success && <CheckCircleIcon className="w-4 h-4 text-emerald-600" />}
                                {emailState.message}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isEmailPending}
                            className="w-full bg-slate-900 hover:bg-slate-800 text-white py-2 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
                        >
                            {isEmailPending ? <ArrowPathIcon className="w-3.5 h-3.5 animate-spin" /> : <ArrowDownTrayIcon className="w-3.5 h-3.5" />}
                            Update Email
                        </button>
                    </form>
                </div>
            )}

            {/* Change Password Form */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">
                    Security & Password
                </h2>

                <form action={passAction} className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-700">Current Password</label>
                        <div className="relative">
                            <LockClosedIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                            <input
                                type={showCurrentPassword ? "text" : "password"}
                                name="currentPassword"
                                defaultValue={passState.inputs?.currentPassword}
                                className={`w-full bg-slate-50 border rounded-lg py-2 pl-9 pr-10 text-xs text-slate-900 outline-none focus:bg-white focus:border-slate-900 transition-colors ${
                                    passState.errors?.currentPassword ? 'border-rose-400' : 'border-slate-200'
                                }`}
                            />
                            <button
                                type="button"
                                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors"
                            >
                                {showCurrentPassword ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                            </button>
                        </div>
                        {passState.errors?.currentPassword && (
                            <p className="text-xs text-rose-600 font-medium">{passState.errors.currentPassword}</p>
                        )}
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-700">New Password</label>
                        <div className="relative">
                            <LockClosedIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                            <input
                                type={showNewPassword ? "text" : "password"}
                                name="newPassword"
                                defaultValue={passState.inputs?.newPassword}
                                className={`w-full bg-slate-50 border rounded-lg py-2 pl-9 pr-10 text-xs text-slate-900 outline-none focus:bg-white focus:border-slate-900 transition-colors ${
                                    passState.errors?.newPassword ? 'border-rose-400' : 'border-slate-200'
                                }`}
                            />
                            <button
                                type="button"
                                onClick={() => setShowNewPassword(!showNewPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors"
                            >
                                {showNewPassword ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                            </button>
                        </div>
                        {passState.errors?.newPassword && (
                            <p className="text-xs text-rose-600 font-medium">{passState.errors.newPassword}</p>
                        )}
                    </div>

                    {passState.message && (
                        <div className={`p-2.5 rounded-lg text-xs font-medium flex items-center gap-1.5 border ${
                            passState.success ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}>
                            {passState.success && <CheckCircleIcon className="w-4 h-4 text-emerald-600" />}
                            {passState.message}
                        </div>
                    )}

                    <div className="pt-2 flex gap-3">
                        {user.role !== 'ADMIN' && (
                            <Link
                                href="/dashboard"
                                className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors flex items-center justify-center"
                            >
                                Cancel
                            </Link>
                        )}
                        <button
                            type="submit"
                            disabled={isPassPending}
                            className="flex-1 bg-slate-900 hover:bg-slate-800 text-white py-2 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
                        >
                            {isPassPending ? <ArrowPathIcon className="w-3.5 h-3.5 animate-spin" /> : <ArrowDownTrayIcon className="w-3.5 h-3.5" />}
                            Update Password
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}