'use client'

import { useActionState } from 'react'
import { createAdminAction, SetupState } from './actions'
import { Shield, User, Mail, Lock, Key } from 'lucide-react'

export function SetupForm() {
    const initialState: SetupState = { message: null, errors: {} }
    const [state, action, isPending] = useActionState(createAdminAction, initialState)

    return (
        <form action={action} className="space-y-5" noValidate>

            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300 ml-1">Full Name</label>
                <div className="relative">
                    <User className={`absolute left-3 top-3.5 -translate-y-0 text-dark-muted ${state.errors?.name ? 'text-red-400' : ''}`} size={18} />
                    <input
                        name="name"
                        type="text"
                        defaultValue={state.inputs?.name}
                        placeholder="Alina Bright"
                        className={`w-full bg-dark-900 border rounded-xl pl-10 pr-4 py-3 transition-all outline-none
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
                    <Mail className={`absolute left-3 top-3.5 text-dark-muted ${state.errors?.email ? 'text-red-400' : ''}`} size={18} />
                    <input
                        name="email"
                        type="email"
                        defaultValue={state.inputs?.email}
                        placeholder="admin@example.com"
                        className={`w-full bg-dark-900 border rounded-xl pl-10 pr-4 py-3 transition-all outline-none
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
                        <Lock className={`absolute left-3 top-3.5 text-dark-muted ${state.errors?.password ? 'text-red-400' : ''}`} size={18} />
                        <input
                            name="password"
                            type="password"
                            autoComplete="current-password"
                            placeholder="******"
                            className={`w-full bg-dark-900 border rounded-xl pl-10 pr-4 py-3 transition-all outline-none
                ${state.errors?.password
                                ? 'border-red-500 focus:ring-2 focus:ring-red-500/50 text-red-100'
                                : 'border-dark-700 text-white focus:ring-2 focus:ring-primary'
                            }`}
                        />
                    </div>
                    {state.errors?.password && (
                        <p className="text-red-400 text-xs ml-1 font-medium">{state.errors.password[0]}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300 ml-1">Confirm</label>
                    <div className="relative">
                        <Key className={`absolute left-3 top-3.5 text-dark-muted ${state.errors?.confirmPassword ? 'text-red-400' : ''}`} size={18} />
                        <input
                            name="confirmPassword"
                            type="password"
                            placeholder="******"
                            className={`w-full bg-dark-900 border rounded-xl pl-10 pr-4 py-3 transition-all outline-none
                ${state.errors?.confirmPassword
                                ? 'border-red-500 focus:ring-2 focus:ring-red-500/50 text-red-100'
                                : 'border-dark-700 text-white focus:ring-2 focus:ring-primary'
                            }`}
                        />
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
                    className="w-full bg-primary hover:bg-primary-hover disabled:bg-primary/50 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-500/25 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                >
                    {isPending ? 'Setting up...' : 'Complete Setup'}
                    {!isPending && <Shield size={18} />}
                </button>
            </div>

        </form>
    )
}