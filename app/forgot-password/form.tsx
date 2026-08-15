"use client"

import { useState, useTransition } from "react"
import { resetPassword } from "@/app/actions/reset-password"

export function ForgotPasswordForm() {
    const [email, setEmail] = useState("")
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")
    const [isPending, startTransition] = useTransition()

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        setError("")
        setSuccess("")

        startTransition(async () => {
            const res = await resetPassword(email)

            if (res?.error) {
                setError(res.error)
            } else if (res?.success) {
                setSuccess(res.success)
                setEmail("")
            }
        })
    }

    return (
        <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-1">
                <label htmlFor="email" className="text-xs font-semibold text-slate-700">
                    Email Address
                </label>
                <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    disabled={isPending}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-slate-900 transition-colors disabled:opacity-50"
                    placeholder="admin@example.com"
                />
            </div>

            {error && (
                <div className="rounded-lg border border-rose-200 bg-rose-50 p-2.5">
                    <p className="text-xs text-rose-700 font-medium">{error}</p>
                </div>
            )}

            {success && (
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-2.5">
                    <p className="text-xs text-emerald-700 font-medium">{success}</p>
                </div>
            )}

            <button
                type="submit"
                disabled={isPending}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-2 rounded-lg text-xs transition-colors shadow-sm disabled:opacity-50 flex justify-center items-center h-9"
            >
                {isPending ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                    "Send Reset Link"
                )}
            </button>
        </form>
    )
}