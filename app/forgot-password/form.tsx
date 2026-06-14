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
        <form onSubmit={onSubmit} className="space-y-5">
            <div>
                <label htmlFor="email" className="block text-sm font-medium text-dark-muted mb-1.5">
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
                    className="w-full bg-dark-900 border border-dark-700 rounded-lg px-4 py-2.5 text-white placeholder-dark-muted focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors disabled:opacity-50"
                    placeholder="admin@example.com"
                />
            </div>

            {error && (
                <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3">
                    <p className="text-sm text-red-400">{error}</p>
                </div>
            )}

            {success && (
                <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3">
                    <p className="text-sm text-emerald-400">{success}</p>
                </div>
            )}

            <button
                type="submit"
                disabled={isPending}
                className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-2.5 rounded-lg transition-colors disabled:opacity-50 flex justify-center items-center h-11"
            >
                {isPending ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                    "Send Reset Link"
                )}
            </button>
        </form>
    )
}