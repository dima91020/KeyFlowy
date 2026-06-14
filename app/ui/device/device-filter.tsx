'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { CpuChipIcon } from '@heroicons/react/24/outline'
import { CustomSelect } from "@/app/ui/logs/custom-select"

export function DeviceFilter({ devices }: { devices: { id: string, name: string }[] }) {
    const searchParams = useSearchParams()
    const router = useRouter()

    const handleChange = (value: string) => {
        const params = new URLSearchParams(searchParams)
        if (value) {
            params.set('device', value)
        } else {
            params.delete('device')
        }
        router.replace(`/dashboard/users?${params.toString()}`)
    }

    const options = [
        { value: '', label: 'All Access Points' },
        ...devices.map(d => ({ value: d.id, label: d.name }))
    ]

    return (
        <div className="relative w-full md:w-auto min-w-[220px]">
            <CustomSelect
                options={options}
                defaultValue={searchParams.get('device') || ''}
                onChange={handleChange}
                icon={<CpuChipIcon className="w-5 h-5" />}
            />
        </div>
    )
}