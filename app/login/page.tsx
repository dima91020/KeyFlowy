import { ShieldCheckIcon, ChevronLeftIcon } from '@heroicons/react/24/outline'
import { LoginForm } from './form'
import Link from 'next/link'

export default async function LoginPage() {
    return (
        <div className="min-h-screen bg-dark-900 flex items-center justify-center p-4">

            <div className="w-full max-w-sm relative z-10">

                <Link
                    href="/"
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-dark-muted hover:text-white mb-6 transition-colors w-fit"
                >
                    <ChevronLeftIcon className="w-4 h-4" />
                    <span>Back to Home</span>
                </Link>

                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-dark-800 border border-dark-700 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <ShieldCheckIcon className="text-primary w-8 h-8" />
                    </div>
                    <h1 className="text-2xl font-semibold text-white mb-2">Welcome Back</h1>
                    <p className="text-dark-muted text-sm">Sign in to access the system.</p>
                </div>

                <div className="bg-dark-800 border border-dark-700 rounded-2xl p-8 shadow-xl">
                    <LoginForm />

                    <div className="mt-5 text-center">
                        <Link
                            href="/forgot-password"
                            className="text-sm text-dark-muted hover:text-white transition-colors"
                        >
                            Forgot your password?
                        </Link>
                    </div>
                </div>

                <p className="text-center text-dark-muted text-sm mt-6">
                    New organization?{' '}
                    <Link href="/register" className="text-primary hover:underline transition-all">
                        Register here
                    </Link>
                </p>

            </div>
        </div>
    )
}