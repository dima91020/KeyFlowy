'use client'

import { useActionState, useState } from 'react'
import { loginAction, LoginState } from './actions'
import {
    ArrowRightOnRectangleIcon,
    EnvelopeIcon,
    LockClosedIcon,
    EyeIcon,
    EyeSlashIcon,
    ArrowPathIcon
} from '@heroicons/react/24/outline'
import clsx from 'clsx'

export function LoginForm() {
    const initialState: LoginState = { message: null, errors: {} }
    const [state, action, isPending] = useActionState(loginAction, initialState)
    const [showPassword, setShowPassword] = useState(false)

    return (
        <form action={action} className="space-y-4" noValidate>
            <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Email Address</label>
                <div className="relative">
                    <EnvelopeIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        name="email"
                        type="email"
                        autoComplete="username"
                        defaultValue={state.inputs?.email}
                        placeholder="user@example.com"
                        className={clsx(
                            "w-full bg-slate-50 border rounded-lg pl-9 pr-3 py-2 text-xs text-slate-900 outline-none focus:bg-white focus:border-slate-900 transition-colors",
                            state.errors?.email ? "border-rose-400" : "border-slate-200"
                        )}
                    />
                </div>
                {state.errors?.email && (
                    <p className="text-rose-600 text-xs font-medium">{state.errors.email[0]}</p>
                )}
            </div>

            <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Password</label>
                <div className="relative">
                    <LockClosedIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        name="password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="current-password"
                        defaultValue={state.inputs?.password}
                        placeholder="••••••••"
                        className={clsx(
                            "w-full bg-slate-50 border rounded-lg pl-9 pr-10 py-2 text-xs text-slate-900 outline-none focus:bg-white focus:border-slate-900 transition-colors",
                            state.errors?.password ? "border-rose-400" : "border-slate-200"
                        )}
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors"
                    >
                        {showPassword ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                    </button>
                </div>
                {state.errors?.password && (
                    <p className="text-rose-600 text-xs font-medium">{state.errors.password[0]}</p>
                )}
            </div>

            {state.message && (
                <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs text-center">
                    {state.message}
                </div>
            )}

            <button
                type="submit"
                disabled={isPending}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-2 rounded-lg text-xs transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
                {isPending ? <ArrowPathIcon className="w-3.5 h-3.5 animate-spin" /> : <ArrowRightOnRectangleIcon className="w-3.5 h-3.5" />}
                {isPending ? 'Authenticating...' : 'Sign In'}
            </button>
        </form>
    )
}