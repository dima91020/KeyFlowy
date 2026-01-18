import { prisma } from '@/app/lib/prisma'
import { redirect } from 'next/navigation'
import { Shield } from 'lucide-react'
import { SetupForm } from './form' // Імпортуємо форму

export default async function SetupPage() {
    // БЕЗПЕКА: Цей код виконується на сервері перед рендером
    const userCount = await prisma.user.count()
    if (userCount > 0) {
        redirect('/login')
    }

    return (
        <div className="min-h-screen bg-dark-900 flex items-center justify-center p-4">
            <div className="absolute top-0 left-0 w-full h-1/2 bg-blue-600/10 blur-[100px] pointer-events-none" />

            <div className="w-full max-w-md relative z-10">

                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-xl shadow-blue-500/20 mx-auto mb-6">
                        <Shield className="text-white w-8 h-8" />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">System Setup</h1>
                    <p className="text-dark-muted">Create the first Administrator account.</p>
                </div>

                <div className="bg-dark-800 border border-dark-700 rounded-2xl p-8 shadow-2xl">
                    {/* Тут тепер живе наша розумна форма */}
                    <SetupForm />
                </div>

                <p className="text-center text-dark-muted text-sm mt-6">
                    This page will be disabled after setup.
                </p>

            </div>
        </div>
    )
}