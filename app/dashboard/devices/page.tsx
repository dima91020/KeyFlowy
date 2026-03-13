import { getDevices } from './actions'
import { redirect } from 'next/navigation'
import { verifySession } from '@/app/lib/session'
import { WifiOff, Plus } from 'lucide-react'
import Link from 'next/link'
import { DeviceCard } from './device-card'

export default async function DevicesPage() {
    const userId = await verifySession()
    if (!userId) redirect('/login')

    const devices = await getDevices()

    return (
        <div className="p-6 space-y-8 text-white max-w-7xl mx-auto">

            {/* Header: Адаптивний flex-контейнер */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Connected Devices</h1>
                    <p className="text-dark-muted mt-1">Manage your ESP32 controllers and readers.</p>
                </div>

                {/* Блок з лічильником та кнопкою додавання */}
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="text-sm bg-dark-800 px-4 py-2.5 rounded-xl border border-dark-700 whitespace-nowrap hidden sm:block">
                        Total Devices: <span className="text-white font-bold">{devices.length}</span>
                    </div>

                    <Link
                        href="/dashboard/devices/new"
                        className="flex-1 md:flex-none justify-center bg-primary hover:bg-blue-600 text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all shadow-lg shadow-blue-500/20 whitespace-nowrap"
                    >
                        <Plus size={20} />
                        Add Device
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {devices.map((device) => (
                    <DeviceCard key={device.id} device={device} />
                ))}

                {/* Оновлений стан, коли пристроїв немає */}
                {devices.length === 0 && (
                    <div className="col-span-full text-center py-16 text-dark-muted border border-dashed border-dark-700 rounded-2xl bg-dark-800/50">
                        <WifiOff size={48} className="mx-auto mb-4 opacity-50" />
                        <h3 className="text-xl font-medium text-white mb-2">No devices found</h3>
                        <p className="mb-6">You haven't registered any ESP32 controllers yet.</p>
                        <Link
                            href="/dashboard/devices/new"
                            className="inline-flex bg-dark-700 hover:bg-dark-600 text-white px-6 py-2.5 rounded-xl font-medium items-center gap-2 transition-all border border-dark-600"
                        >
                            <Plus size={18} />
                            Register First Device
                        </Link>
                    </div>
                )}
            </div>
        </div>
    )
}