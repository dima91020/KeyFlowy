'use client'

import { useActionState, useState } from 'react'
import { registerAdminAction, RegisterState } from './actions'
import {
    ShieldCheckIcon,
    UserIcon,
    EnvelopeIcon,
    LockClosedIcon,
    EyeIcon,
    EyeSlashIcon,
    ArrowPathIcon
} from '@heroicons/react/24/outline'

export function RegisterForm() {
    const initialState: RegisterState = { message: null, errors: {} }
    const [state, action, isPending] = useActionState(registerAdminAction, initialState)

    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)

    return (
        <form action={action} className="space-y-4" noValidate>
            <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Administrator / Company Name</label>
                <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        name="name"
                        type="text"
                        defaultValue={state.inputs?.name}
                        placeholder="e.g. Acme Security Ltd"
                        className={`w-full bg-slate-50 border rounded-lg pl-9 pr-3 py-2 text-xs text-slate-900 outline-none focus:bg-white focus:border-slate-900 transition-colors ${
                            state.errors?.name ? 'border-rose-400' : 'border-slate-200'
                        }`}
                    />
                </div>
                {state.errors?.name && (
                    <p className="text-rose-600 text-xs font-medium">{state.errors.name[0]}</p>
                )}
            </div>

            <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Email Address</label>
                <div className="relative">
                    <EnvelopeIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        name="email"
                        type="email"
                        defaultValue={state.inputs?.email}
                        placeholder="admin@company.com"
                        className={`w-full bg-slate-50 border rounded-lg pl-9 pr-3 py-2 text-xs text-slate-900 outline-none focus:bg-white focus:border-slate-900 transition-colors ${
                            state.errors?.email ? 'border-rose-400' : 'border-slate-200'
                        }`}
                    />
                </div>
                {state.errors?.email && (
                    <p className="text-rose-600 text-xs font-medium">{state.errors.email[0]}</p>
                )}
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">Password</label>
                    <div className="relative">
                        <LockClosedIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            name="password"
                            type={showPassword ? "text" : "password"}
                            autoComplete="new-password"
                            placeholder="••••••••"
                            className={`w-full bg-slate-50 border rounded-lg pl-9 pr-9 py-2 text-xs text-slate-900 outline-none focus:bg-white focus:border-slate-900 transition-colors ${
                                state.errors?.password ? 'border-rose-400' : 'border-slate-200'
                            }`}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors"
                        >
                            {showPassword ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                        </button>
                    </div>
                    {state.errors?.password && (
                        <p className="text-rose-600 text-xs font-medium">{state.errors.password[0]}</p>
                    )}
                </div>

                <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">Confirm</label>
                    <div className="relative">
                        <LockClosedIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            name="confirmPassword"
                            type={showConfirmPassword ? "text" : "password"}
                            autoComplete="new-password"
                            placeholder="••••••••"
                            className={`w-full bg-slate-50 border rounded-lg pl-9 pr-9 py-2 text-xs text-slate-900 outline-none focus:bg-white focus:border-slate-900 transition-colors ${
                                state.errors?.confirmPassword ? 'border-rose-400' : 'border-slate-200'
                            }`}
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors"
                        >
                            {showConfirmPassword ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                        </button>
                    </div>
                    {state.errors?.confirmPassword && (
                        <p className="text-rose-600 text-xs font-medium">{state.errors.confirmPassword[0]}</p>
                    )}
                </div>
            </div>

            {state.message && (
                <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs text-center">
                    {state.message}
                </div>
            )}

            <div className="pt-2">
                <button
                    type="submit"
                    disabled={isPending}
                    className="w-full bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-medium py-2 rounded-lg text-xs transition-colors shadow-sm flex items-center justify-center gap-1.5"
                >
                    {isPending ? <ArrowPathIcon className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheckIcon className="w-4 h-4" />}
                    {isPending ? 'Registering...' : 'Register as Admin'}
                </button>
            </div>
        </form>
    )
}