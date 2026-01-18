import { Shield } from 'lucide-react'
import { LoginForm } from './form'
import { prisma } from '@/app/lib/prisma'
import { redirect } from 'next/navigation'

export default async function LoginPage() {
    const userCount = await prisma.user.count()
    if (userCount === 0) {
        redirect('/setup')
    }

    return (
        <div className="min-h-screen bg-dark-900 flex items-center justify-center p-4">

            <div className="w-full max-w-sm relative z-10">

                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-dark-800 border border-dark-700 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <Shield className="text-primary w-8 h-8" />
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-2">Welcome Back</h1>
                    <p className="text-dark-muted text-sm">Sign in to access SecurePass ACS.</p>
                </div>

                <div className="bg-dark-800 border border-dark-700 rounded-2xl p-8 shadow-xl">
                    <LoginForm />
                </div>

                <p className="text-center text-dark-muted text-xs mt-8 opacity-50">
                    © 2026 Diploma Project
                </p>

            </div>
        </div>
    )
}