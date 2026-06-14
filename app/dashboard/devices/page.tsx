import { getDevices } from './actions'
import { redirect } from 'next/navigation'
import { verifySession } from '@/app/lib/session'
import { SignalSlashIcon, PlusIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import { DeviceCard } from './device-card'

// Вбиваємо кеш, щоб сторінка завжди віддавала актуальний статус з бази
export const dynamic = 'force-dynamic'
export const revalidate = 0

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
                    <p className="text-dark-muted mt-1">Manage your devices.</p>
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
                        <PlusIcon className="w-5 h-5" />
                        Add Device
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {devices.map((device) => (
                    <DeviceCard key={device.id} device={device} currentUserId={userId} />
                ))}

                {/* Оновлений стан, коли пристроїв немає */}
                {devices.length === 0 && (
                    <div className="col-span-full text-center py-16 text-dark-muted border border-dashed border-dark-700 rounded-2xl bg-dark-800/50">
                        <SignalSlashIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <h3 className="text-xl font-medium text-white mb-2">No devices found</h3>
                        <p className="mb-6">You haven't registered any ESP32 controllers yet.</p>
                        <Link
                            href="/dashboard/devices/new"
                            className="inline-flex bg-dark-700 hover:bg-dark-600 text-white px-6 py-2.5 rounded-xl font-medium items-center gap-2 transition-all border border-dark-600"
                        >
                            <PlusIcon className="w-5 h-5" />
                            Register First Device
                        </Link>
                    </div>
                )}
            </div>
        </div>
    )
}