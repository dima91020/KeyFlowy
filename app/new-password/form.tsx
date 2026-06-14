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
        <form onSubmit={handleSubmit} className="space-y-5">
            <div>
                <label className="block text-sm font-medium text-dark-muted mb-1.5">
                    New Password
                </label>
                <div className="relative flex items-center w-full">
                    <input
                        type={showPassword ? "text" : "password"}
                        disabled={isLoading || !!success}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-dark-900 border border-dark-700 rounded-lg pl-4 pr-12 py-2.5 text-white placeholder-dark-muted focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors disabled:opacity-50 hide-password-toggle"
                        placeholder="••••••••"
                        autoComplete="new-password"
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={isLoading || !!success}
                        className="absolute right-3 z-10 flex items-center text-dark-muted hover:text-white transition-colors disabled:opacity-50"
                    >
                        {showPassword ? (
                            <EyeSlashIcon className="w-5 h-5" />
                        ) : (
                            <EyeIcon className="w-5 h-5" />
                        )}
                    </button>
                </div>

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
                disabled={isLoading || !!success}
                className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-2.5 rounded-lg transition-colors disabled:opacity-50 flex justify-center items-center h-11 mt-6"
            >
                {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                    "Change Password"
                )}
            </button>
        </form>
    )
}
