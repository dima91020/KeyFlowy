'use client'

import { useActionState, useState } from 'react'
import { loginAction, LoginState } from './actions'
import {
    ArrowRightOnRectangleIcon,
    EnvelopeIcon,
    LockClosedIcon,
    EyeIcon,
    EyeSlashIcon
} from '@heroicons/react/24/outline'
import clsx from 'clsx'

export function LoginForm() {
    const initialState: LoginState = { message: null, errors: {} }
    const [state, action, isPending] = useActionState(loginAction, initialState)
    const [showPassword, setShowPassword] = useState(false)

    // Клас для вимкнення білого фону при автозаповненні браузером
    const autofillFix = "[&:-webkit-autofill]:[-webkit-text-fill-color:white] [&:-webkit-autofill]:[transition:background-color_9999s_ease-in-out_0s]";

    return (
        <form action={action} className="space-y-6" noValidate>

            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300 ml-1">Email</label>
                <div className="relative">
                    <EnvelopeIcon
                        className={clsx(
                            "absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5",
                            state.errors?.email ? "text-red-400" : "text-dark-muted"
                        )}
                    />
                    <input
                        name="email"
                        type="email"
                        autoComplete="username"
                        defaultValue={state.inputs?.email}
                        placeholder="email@example.com"
                        className={clsx(
                            "w-full bg-dark-900 border rounded-xl pl-10 pr-4 py-3 transition-all outline-none",
                            autofillFix,
                            state.errors?.email
                                ? "border-red-500 focus:ring-2 focus:ring-red-500/50 text-red-100 placeholder:text-red-300/50"
                                : "border-dark-700 text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                        )}
                    />
                </div>
                {state.errors?.email && (
                    <p className="text-red-400 text-xs ml-1 font-medium">{state.errors.email[0]}</p>
                )}
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300 ml-1">Password</label>
                <div className="relative">
                    <LockClosedIcon
                        className={clsx(
                            "absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5",
                            state.errors?.password ? "text-red-400" : "text-dark-muted"
                        )}
                    />
                    <input
                        name="password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="current-password"
                        defaultValue={state.inputs?.password}
                        placeholder="••••••"
                        className={clsx(
                            "w-full bg-dark-900 border rounded-xl pl-10 pr-12 py-3 transition-all outline-none",
                            autofillFix,
                            state.errors?.password
                                ? "border-red-500 focus:ring-2 focus:ring-red-500/50 text-red-100"
                                : "border-dark-700 text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                        )}
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-muted hover:text-white transition-colors outline-none focus:outline-none"
                    >
                        {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                    </button>
                </div>
                {state.errors?.password && (
                    <p className="text-red-400 text-xs ml-1 font-medium">{state.errors.password[0]}</p>
                )}
            </div>

            {state.message && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center flex items-center justify-center gap-2">
                    <span>⚠️</span> {state.message}
                </div>
            )}

            <button
                type="submit"
                disabled={isPending}
                className={clsx(
                    "w-full font-bold py-3.5 rounded-xl shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2 outline-none focus:outline-none",
                    isPending
                        ? "bg-primary/50 cursor-not-allowed text-white/70"
                        : "bg-primary hover:bg-primary-hover text-white shadow-blue-500/25"
                )}
            >
                {isPending ? 'Signing In...' : 'Sign In'}
                {!isPending && <ArrowRightOnRectangleIcon className="w-5 h-5" />}
            </button>

        </form>
    )
}