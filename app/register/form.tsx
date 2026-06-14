'use client'

import { useActionState, useState } from 'react'
import { registerAdminAction, RegisterState } from './actions'
import {
    ShieldCheckIcon,
    UserIcon,
    EnvelopeIcon,
    LockClosedIcon,
    KeyIcon,
    EyeIcon,
    EyeSlashIcon
} from '@heroicons/react/24/outline'

export function RegisterForm() {
    const initialState: RegisterState = { message: null, errors: {} }
    const [state, action, isPending] = useActionState(registerAdminAction, initialState)

    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)

    // Клас для вимкнення білого фону при автозаповненні браузером
    const autofillFix = "[&:-webkit-autofill]:[-webkit-text-fill-color:white] [&:-webkit-autofill]:[transition:background-color_9999s_ease-in-out_0s]";

    return (
        <form action={action} className="space-y-5" noValidate>

            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300 ml-1">Admin Name (Company)</label>
                <div className="relative">
                    <UserIcon className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${state.errors?.name ? 'text-red-400' : 'text-dark-muted'}`} />
                    <input
                        name="name"
                        type="text"
                        defaultValue={state.inputs?.name}
                        placeholder="Alina Bright"
                        className={`w-full bg-dark-900 border rounded-xl pl-10 pr-4 py-3 transition-all outline-none ${autofillFix}
              ${state.errors?.name
                            ? 'border-red-500 focus:ring-2 focus:ring-red-500/50 text-red-100 placeholder:text-red-300/50'
                            : 'border-dark-700 text-white focus:ring-2 focus:ring-primary focus:border-transparent'
                        }`}
                    />
                </div>
                {state.errors?.name && (
                    <p className="text-red-400 text-xs ml-1 font-medium">{state.errors.name[0]}</p>
                )}
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300 ml-1">Email Address</label>
                <div className="relative">
                    <EnvelopeIcon className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${state.errors?.email ? 'text-red-400' : 'text-dark-muted'}`} />
                    <input
                        name="email"
                        type="email"
                        defaultValue={state.inputs?.email}
                        placeholder="admin@example.com"
                        className={`w-full bg-dark-900 border rounded-xl pl-10 pr-4 py-3 transition-all outline-none ${autofillFix}
              ${state.errors?.email
                            ? 'border-red-500 focus:ring-2 focus:ring-red-500/50 text-red-100'
                            : 'border-dark-700 text-white focus:ring-2 focus:ring-primary'
                        }`}
                    />
                </div>
                {state.errors?.email && (
                    <p className="text-red-400 text-xs ml-1 font-medium">{state.errors.email[0]}</p>
                )}
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300 ml-1">Password</label>
                    <div className="relative">
                        <LockClosedIcon className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${state.errors?.password ? 'text-red-400' : 'text-dark-muted'}`} />
                        <input
                            name="password"
                            type={showPassword ? "text" : "password"}
                            autoComplete="new-password"
                            placeholder="******"
                            className={`w-full bg-dark-900 border rounded-xl pl-10 pr-12 py-3 transition-all outline-none ${autofillFix}
                ${state.errors?.password
                                ? 'border-red-500 focus:ring-2 focus:ring-red-500/50 text-red-100'
                                : 'border-dark-700 text-white focus:ring-2 focus:ring-primary'
                            }`}
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

                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300 ml-1">Confirm</label>
                    <div className="relative">
                        <KeyIcon className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${state.errors?.confirmPassword ? 'text-red-400' : 'text-dark-muted'}`} />
                        <input
                            name="confirmPassword"
                            type={showConfirmPassword ? "text" : "password"}
                            autoComplete="new-password"
                            placeholder="******"
                            className={`w-full bg-dark-900 border rounded-xl pl-10 pr-12 py-3 transition-all outline-none ${autofillFix}
                ${state.errors?.confirmPassword
                                ? 'border-red-500 focus:ring-2 focus:ring-red-500/50 text-red-100'
                                : 'border-dark-700 text-white focus:ring-2 focus:ring-primary'
                            }`}
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-muted hover:text-white transition-colors outline-none focus:outline-none"
                        >
                            {showConfirmPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                        </button>
                    </div>
                    {state.errors?.confirmPassword && (
                        <p className="text-red-400 text-xs ml-1 font-medium">{state.errors.confirmPassword[0]}</p>
                    )}
                </div>
            </div>

            {state.message && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
                    {state.message}
                </div>
            )}

            <div className="pt-4">
                <button
                    type="submit"
                    disabled={isPending}
                    className="w-full bg-primary hover:bg-primary-hover disabled:bg-primary/50 disabled:cursor-not-allowed text-white font-medium py-3.5 rounded-xl shadow-lg shadow-blue-500/25 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                >
                    {isPending ? 'Creating account...' : 'Register as Admin'}
                    {!isPending && <ShieldCheckIcon className="w-5 h-5" />}
                </button>
            </div>

        </form>
    )
}