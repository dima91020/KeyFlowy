'use client'

import dynamic from 'next/dynamic'
import { LogWithDetails } from './actions'
import { RecentActivitySkeleton } from './recent-activity-skeleton'

const RecentActivityComponent = dynamic(
    () => import('./recent-activity').then((mod) => mod.RecentActivity),
    {
        ssr: false,
        loading: () => <RecentActivitySkeleton />
    }
)

export function RecentActivityWrapper({ initialLogs, adminId }: { initialLogs: LogWithDetails[], adminId: string }) {
    return <RecentActivityComponent initialLogs={initialLogs} adminId={adminId} />
}