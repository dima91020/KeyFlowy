"use client"

import { useState, useEffect } from "react"
import { setNewPassword } from "@/app/actions/new-password"
import { useRouter } from "next/navigation"
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'

export default function NewPasswordForm({ token }: { token: string }) {
    const [password, setPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [shouldRedirect, setShouldRedirect] = useState(false)
    const router = useRouter()

    useEffect(() => {
        if (!shouldRedirect) return

        const timer = setTimeout(() => {
            router.push("/login")
        }, 2000)

        return () => clearTimeout(timer)
    }, [shouldRedirect, router])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")
        setSuccess("")

        if (password.length < 8) {
            setError("Password must be at least 8 characters long.")
            return
        }

        setIsLoading(true)
        try {
            const res = await setNewPassword(token, password)

            if (res?.error) {
                setError(res.error)
            } else if (res?.success) {
                setSuccess(res.success)
                setPassword("")
                setShouldRedirect(true)
            } else {
                setError("No response from server.")
            }
        } catch (err) {
            setError("Network or server error occurred.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                    New Password
                </label>
                <div className="relative flex items-center w-full">
                    <input
                        type={showPassword ? "text" : "password"}
                        disabled={isLoading || !!success}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-3 pr-10 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-slate-900 transition-colors disabled:opacity-50"
                        placeholder="••••••••"
                        autoComplete="new-password"
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={isLoading || !!success}
                        className="absolute right-3 text-slate-400 hover:text-slate-700 transition-colors disabled:opacity-50"
                    >
                        {showPassword ? (
                            <EyeSlashIcon className="w-4 h-4" />
                        ) : (
                            <EyeIcon className="w-4 h-4" />
                        )}
                    </button>
                </div>
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
                disabled={isLoading || !!success}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-2 rounded-lg text-xs transition-colors shadow-sm disabled:opacity-50 flex justify-center items-center h-9 mt-4"
            >
                {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                    "Save Password"
                )}
            </button>
        </form>
    )
}
