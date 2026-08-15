import { KeyIcon, ChevronLeftIcon } from '@heroicons/react/24/outline'
import { ForgotPasswordForm } from './form'
import Link from 'next/link'

export default function ForgotPasswordPage() {
    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="w-full max-w-sm relative z-10">
                <Link
                    href="/login"
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 mb-6 transition-colors"
                >
                    <ChevronLeftIcon className="w-3.5 h-3.5" />
                    <span>Back to Login</span>
                </Link>

                <div className="text-center mb-6">
                    <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center mx-auto mb-4 text-white shadow-sm">
                        <KeyIcon className="w-6 h-6" />
                    </div>
                    <h1 className="text-xl font-bold text-slate-900">Reset Password</h1>
                    <p className="text-xs text-slate-500 mt-1">Enter your account email to receive a reset token.</p>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                    <ForgotPasswordForm />
                </div>
            </div>
        </div>
    )
}