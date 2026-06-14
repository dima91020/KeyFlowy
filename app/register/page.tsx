import { ShieldCheckIcon, ChevronLeftIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import { RegisterForm } from './form'

export default async function RegisterPage() {
    return (
        <div className="min-h-screen bg-dark-900 flex items-center justify-center p-4">
            <div className="absolute top-0 left-0 w-full h-1/2 bg-blue-600/10 blur-[100px] pointer-events-none" />

            <div className="w-full max-w-md relative z-10">

                <Link
                    href="/"
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-dark-muted hover:text-white mb-6 transition-colors w-fit"
                >
                    <ChevronLeftIcon className="w-4 h-4" />
                    <span>Back to Home</span>
                </Link>

                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-xl shadow-blue-500/20 mx-auto mb-6">
                        <ShieldCheckIcon className="text-white w-8 h-8" />
                    </div>
                    <h1 className="text-3xl font-semibold text-white mb-2">Register Company</h1>
                    <p className="text-dark-muted">Create an administrator account for your organization.</p>
                </div>

                <div className="bg-dark-800 border border-dark-700 rounded-2xl p-8 shadow-2xl">
                    <RegisterForm />
                </div>

                <p className="text-center text-dark-muted text-sm mt-6">
                    Already have an account? <Link href="/login" className="text-primary hover:underline">Log in here</Link>
                </p>

            </div>
        </div>
    )
}