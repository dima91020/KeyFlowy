import { getDevices } from './actions'
import { redirect } from 'next/navigation'
import { verifySession } from '@/app/lib/session'
import { SignalSlashIcon, PlusIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import { DeviceCard } from './device-card'
import { Badge } from '@/app/ui/badge'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function DevicesPage() {
    const userId = await verifySession()
    if (!userId) redirect('/login')

    const devices = await getDevices()

    return (
        <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-200">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Devices</h1>
                    <p className="text-slate-500 text-sm mt-0.5">Manage connected ESP32 hardware controllers and door relays.</p>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <Badge variant="neutral" className="hidden sm:inline-flex">
                        Total: <strong className="text-slate-900 ml-1">{devices.length}</strong>
                    </Badge>

                    <Link
                        href="/dashboard/devices/new"
                        className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-colors shadow-sm w-full sm:w-auto justify-center"
                    >
                        <PlusIcon className="w-4 h-4" />
                        Add Device
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {devices.map((device) => (
                    <DeviceCard key={device.id} device={device} currentUserId={userId} />
                ))}

                {devices.length === 0 && (
                    <div className="col-span-full text-center py-16 text-slate-500 border border-dashed border-slate-200 rounded-xl bg-white p-8">
                        <SignalSlashIcon className="w-10 h-10 mx-auto mb-3 text-slate-300" />
                        <h3 className="text-base font-semibold text-slate-900 mb-1">No devices registered</h3>
                        <p className="text-sm text-slate-500 mb-5">Connect an ESP32 hardware node or run the interactive simulator.</p>
                        <Link
                            href="/dashboard/devices/new"
                            className="inline-flex bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium items-center gap-1.5 transition-colors"
                        >
                            <PlusIcon className="w-4 h-4" />
                            Register Device
                        </Link>
                    </div>
                )}
            </div>
        </div>
    )
}