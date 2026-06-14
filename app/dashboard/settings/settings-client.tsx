'use client'

import { useActionState, useState } from 'react'
import { changePasswordAction, updateEmailAction } from './actions'
import {
    KeyIcon,
    LockClosedIcon,
    CheckCircleIcon,
    EyeIcon,
    EyeSlashIcon,
    EnvelopeIcon,
    UserIcon,
    ArrowDownTrayIcon,
    ArrowPathIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'

export function SettingsClient({ user }: { user: { email: string, role: string } }) {
    const [passState, passAction, isPassPending] = useActionState(changePasswordAction, { message: null, success: false })
    const [emailState, emailAction, isEmailPending] = useActionState(updateEmailAction, { message: null, success: false })

    const [showCurrentPassword, setShowCurrentPassword] = useState(false)
    const [showNewPassword, setShowNewPassword] = useState(false)

    // Клас для вимкнення білого фону при автозаповненні браузером
    const autofillFix = "[&:-webkit-autofill]:[-webkit-text-fill-color:white] [&:-webkit-autofill]:[transition:background-color_9999s_ease-in-out_0s]";

    return (
        <div className="space-y-6">

            {/* Форма зміни пошти відображається ТІЛЬКИ для адміна */}
            {user.role === 'ADMIN' && (
                <div className="bg-dark-800 border border-dark-700 rounded-3xl p-8">
                    <h2 className="text-xl font-bold flex items-center gap-2 mb-6">
                        <UserIcon className="text-primary w-5 h-5" /> Login Details
                    </h2>

                    <form action={emailAction} className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300 ml-1">Email Address (Login)</label>
                            <div className="relative">
                                {/* Іконка відцентрована по вертикалі */}
                                <EnvelopeIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-muted w-5 h-5" />
                                <input
                                    type="email"
                                    name="email"
                                    defaultValue={user.email}
                                    className={`w-full bg-dark-900 border border-dark-700 rounded-xl py-3 pl-10 pr-4 text-white outline-none transition-colors focus:border-primary ${autofillFix}`}
                                />
                            </div>
                        </div>

                        {emailState.message && (
                            <div className={`p-4 rounded-xl text-sm font-medium flex items-center gap-2 ${
                                emailState.success ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                            }`}>
                                {emailState.success ? <CheckCircleIcon className="w-5 h-5" /> : null}
                                {emailState.message}
                            </div>
                        )}

                        <div className="pt-2">
                            {/* Змінили на w-full для розтягування */}
                            <button
                                type="submit"
                                disabled={isEmailPending}
                                className="w-full bg-primary hover:bg-blue-600 text-white px-6 py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {isEmailPending ? <ArrowPathIcon className="w-5 h-5 animate-spin" /> : <ArrowDownTrayIcon className="w-5 h-5" />}
                                Update Login
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Форма зміни пароля (для всіх) */}
            <div className="bg-dark-800 border border-dark-700 rounded-3xl p-8">
                <h2 className="text-xl font-bold flex items-center gap-2 mb-6">
                    <KeyIcon className="text-primary w-5 h-5" /> Change Password
                </h2>

                <form action={passAction} className="space-y-5">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300 ml-1">Current Password</label>
                        <div className="relative">
                            {/* Іконка замка відцентрована */}
                            <LockClosedIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-muted w-5 h-5" />
                            <input
                                type={showCurrentPassword ? "text" : "password"}
                                name="currentPassword"
                                defaultValue={passState.inputs?.currentPassword}
                                className={`w-full bg-dark-900 border rounded-xl py-3 pl-10 pr-12 text-white outline-none transition-colors ${autofillFix} ${
                                    passState.errors?.currentPassword ? 'border-red-500' : 'border-dark-700 focus:border-primary'
                                }`}
                            />
                            {/* Іконка ока відцентрована */}
                            <button
                                type="button"
                                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-muted hover:text-white transition-colors"
                            >
                                {showCurrentPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                            </button>
                        </div>
                        {passState.errors?.currentPassword && (
                            <p className="text-xs text-red-400 ml-1">{passState.errors.currentPassword}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300 ml-1">New Password</label>
                        <div className="relative">
                            {/* Іконки відцентровані */}
                            <LockClosedIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-muted w-5 h-5" />
                            <input
                                type={showNewPassword ? "text" : "password"}
                                name="newPassword"
                                defaultValue={passState.inputs?.newPassword}
                                className={`w-full bg-dark-900 border rounded-xl py-3 pl-10 pr-12 text-white outline-none transition-colors ${autofillFix} ${
                                    passState.errors?.newPassword ? 'border-red-500' : 'border-dark-700 focus:border-primary'
                                }`}
                            />
                            <button
                                type="button"
                                onClick={() => setShowNewPassword(!showNewPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-muted hover:text-white transition-colors"
                            >
                                {showNewPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                            </button>
                        </div>
                        {passState.errors?.newPassword && (
                            <p className="text-xs text-red-400 ml-1">{passState.errors.newPassword}</p>
                        )}
                    </div>

                    {passState.message && (
                        <div className={`p-4 rounded-xl text-sm font-medium flex items-center gap-2 ${
                            passState.success ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                        }`}>
                            {passState.success ? <CheckCircleIcon className="w-5 h-5" /> : null}
                            {passState.message}
                        </div>
                    )}

                    <div className="pt-4 flex gap-3">
                        {/* Показуємо Cancel ТІЛЬКИ для звичайного юзера */}
                        {user.role !== 'ADMIN' && (
                            <Link
                                href="/dashboard"
                                // Замінили border-dark-600 на border-dark-700, щоб рамка була темною і не світилася білим
                                className="px-6 py-3 rounded-xl bg-dark-800 hover:bg-dark-700 text-dark-muted hover:text-white font-medium transition-colors border border-dark-700 flex items-center justify-center outline-none focus:outline-none focus:ring-0"
                            >
                                Cancel
                            </Link>
                        )}
                        <button
                            type="submit"
                            disabled={isPassPending}
                            className="flex-1 bg-primary hover:bg-blue-600 text-white px-6 py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 outline-none focus:outline-none"
                        >
                            {isPassPending ? <ArrowPathIcon className="w-5 h-5 animate-spin" /> : <ArrowDownTrayIcon className="w-5 h-5" />}
                            Update Password
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}