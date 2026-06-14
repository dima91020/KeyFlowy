import { KeyIcon, ChevronLeftIcon } from '@heroicons/react/24/outline'
import { ForgotPasswordForm } from './form'
import Link from 'next/link'

export default function ForgotPasswordPage() {
    return (
        <div className="min-h-screen bg-dark-900 flex items-center justify-center p-4">
            <div className="w-full max-w-sm relative z-10">
                <Link
                    href="/login"
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-dark-muted hover:text-white mb-6 transition-colors w-fit"
                >
                    <ChevronLeftIcon className="w-4 h-4" />
                    <span>Back to Login</span>
                </Link>

                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-dark-800 border border-dark-700 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <KeyIcon className="text-primary w-8 h-8" />
                    </div>
                    <h1 className="text-2xl font-semibold text-white mb-2">Reset Password</h1>
                    <p className="text-dark-muted text-sm">Enter your email to receive a reset link.</p>
                </div>

                <div className="bg-dark-800 border border-dark-700 rounded-2xl p-8 shadow-xl">
                    <ForgotPasswordForm />
                </div>
            </div>
        </div>
    )
}