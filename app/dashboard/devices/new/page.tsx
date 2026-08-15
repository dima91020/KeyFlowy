import { verifySession } from '@/app/lib/session'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeftIcon } from '@heroicons/react/24/outline'
import { CreateDeviceForm } from './create-device-form'

export default async function NewDevicePage() {
    const userId = await verifySession()
    if (!userId) redirect('/login')

    return (
        <div className="p-6 md:p-8 max-w-xl mx-auto space-y-6">
            <Link
                href="/dashboard/devices"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors"
            >
                <ChevronLeftIcon className="w-3.5 h-3.5" /> Back to Devices
            </Link>

            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                <div className="mb-6 pb-4 border-b border-slate-100">
                    <h1 className="text-xl font-bold text-slate-900">
                        Add New Device
                    </h1>
                    <p className="text-slate-500 text-xs mt-1">
                        Register a new ESP32 controller using its hardware MAC address.
                    </p>
                </div>

                <CreateDeviceForm />
            </div>
        </div>
    )
}