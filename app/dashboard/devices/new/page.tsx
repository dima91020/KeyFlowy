import { verifySession } from '@/app/lib/session'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, Router } from 'lucide-react'
import { CreateDeviceForm } from './create-device-form'

export default async function NewDevicePage() {
    const userId = await verifySession()
    if (!userId) redirect('/login')

    return (
        <div className="p-6 max-w-2xl mx-auto space-y-6">
            <Link
                href="/dashboard/devices"
                className="inline-flex items-center gap-2 text-sm text-dark-muted hover:text-white transition-colors"
            >
                <ChevronLeft size={16} /> Back to Devices
            </Link>

            <div className="bg-dark-800 border border-dark-700 rounded-2xl p-6 md:p-8 shadow-lg">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                        <Router className="text-primary" />
                        Add New Device
                    </h1>
                    <p className="text-dark-muted mt-2">
                        Register a new ESP32 controller using its unique MAC address.
                    </p>
                </div>

                {/* Вставляємо нашу клієнтську форму */}
                <CreateDeviceForm />
            </div>
        </div>
    )
}