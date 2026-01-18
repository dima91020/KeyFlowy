'use client'

import { useActionState } from 'react'
import { loginAction, LoginState } from './actions'
import { LogIn, Mail, Lock } from 'lucide-react'
import clsx from 'clsx'

export function LoginForm() {
    const initialState: LoginState = { message: null, errors: {} }
    const [state, action, isPending] = useActionState(loginAction, initialState)

    return (
        <form action={action} className="space-y-6" noValidate>

            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300 ml-1">Email</label>
                <div className="relative">
                    <Mail
                        className={clsx(
                            "absolute left-3 top-3.5",
                            state.errors?.email ? "text-red-400" : "text-dark-muted"
                        )}
                        size={18}
                    />
                    <input
                        name="email"
                        type="email"
                        autoComplete="username"
                        defaultValue={state.inputs?.email}
                        placeholder="admin@example.com"
                        className={clsx(
                            "w-full bg-dark-900 border rounded-xl pl-10 pr-4 py-3 transition-all outline-none",
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
                    <Lock
                        className={clsx(
                            "absolute left-3 top-3.5",
                            state.errors?.password ? "text-red-400" : "text-dark-muted"
                        )}
                        size={18}
                    />
                    <input
                        name="password"
                        type="password"
                        autoComplete="current-password"
                        placeholder="••••••"
                        className={clsx(
                            "w-full bg-dark-900 border rounded-xl pl-10 pr-4 py-3 transition-all outline-none",
                            state.errors?.password
                                ? "border-red-500 focus:ring-2 focus:ring-red-500/50 text-red-100"
                                : "border-dark-700 text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                        )}
                    />
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
                    "w-full font-bold py-3.5 rounded-xl shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2",
                    isPending
                        ? "bg-primary/50 cursor-not-allowed text-white/70"
                        : "bg-primary hover:bg-primary-hover text-white shadow-blue-500/25"
                )}
            >
                {isPending ? 'Signing In...' : 'Sign In'}
                {!isPending && <LogIn size={18} />}
            </button>

        </form>
    )
}