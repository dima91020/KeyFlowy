'use client'

import dynamic from 'next/dynamic'
import { LogWithDetails } from './actions'
import { RecentActivitySkeleton } from './recent-activity-skeleton' // Імпортуємо скелетон

const RecentActivityComponent = dynamic(
    () => import('./recent-activity').then((mod) => mod.RecentActivity),
    {
        ssr: false,
        // Тепер замість простого div ми показуємо повноцінний скелетон
        loading: () => <RecentActivitySkeleton />
    }
)

export function RecentActivityWrapper({ initialLogs }: { initialLogs: LogWithDetails[] }) {
    return <RecentActivityComponent initialLogs={initialLogs} />
}