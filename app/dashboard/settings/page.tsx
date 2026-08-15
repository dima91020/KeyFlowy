import { verifySession } from '@/app/lib/session'
import { prisma } from '@/app/lib/prisma'
import { redirect } from 'next/navigation'
import { SettingsClient } from './settings-client'

export default async function SettingsPage() {
    const userId = await verifySession()
    if (!userId) redirect('/login')

    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { email: true, role: true }
    })

    if (!user) redirect('/login')

    return (
        <div className="p-6 md:p-8 max-w-xl mx-auto space-y-6">
            <div className="pb-4 border-b border-slate-200">
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Account Settings</h1>
                <p className="text-slate-500 text-sm mt-0.5">Manage security credentials and email login preferences.</p>
            </div>

            <SettingsClient user={{ email: user.email || '', role: user.role }} />
        </div>
    )
}