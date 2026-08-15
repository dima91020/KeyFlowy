import { ShieldCheckIcon, ChevronLeftIcon } from '@heroicons/react/24/outline'
import { LoginForm } from './form'
import Link from 'next/link'

export default async function LoginPage() {
    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="w-full max-w-sm relative z-10">
                <Link
                    href="/"
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 mb-6 transition-colors"
                >
                    <ChevronLeftIcon className="w-3.5 h-3.5" />
                    <span>Back to Home</span>
                </Link>

                <div className="text-center mb-6">
                    <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center mx-auto mb-4 text-white shadow-sm">
                        <ShieldCheckIcon className="w-6 h-6" />
                    </div>
                    <h1 className="text-xl font-bold text-slate-900">Sign In</h1>
                    <p className="text-xs text-slate-500 mt-1">Enter your credentials to access the portal.</p>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                    <LoginForm />

                    <div className="mt-4 text-center">
                        <Link
                            href="/forgot-password"
                            className="text-xs text-slate-500 hover:text-slate-900 transition-colors"
                        >
                            Forgot your password?
                        </Link>
                    </div>
                </div>

                <p className="text-center text-xs text-slate-500 mt-4">
                    Need an account?{' '}
                    <Link href="/register" className="text-slate-900 font-semibold hover:underline">
                        Register organization
                    </Link>
                </p>
            </div>
        </div>
    )
}