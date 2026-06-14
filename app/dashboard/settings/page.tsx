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
        <div className="p-6 max-w-2xl mx-auto space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-white">Account Settings</h1>
                <p className="text-dark-muted mt-1">Manage your security and profile preferences.</p>
            </div>

            <SettingsClient user={{ email: user.email || '', role: user.role }} />
        </div>
    )
}