export function RecentActivitySkeleton() {
    return (
        <div className="lg:col-span-2 bg-dark-800 border border-dark-700 rounded-2xl p-6 shadow-lg">
            {/* Header Skeleton */}
            <div className="flex justify-between items-center mb-6">
                <div className="h-7 w-40 bg-dark-700 animate-pulse rounded-lg" />
                {/* Door Status Pill Skeleton */}
                <div className="h-6 w-28 bg-dark-700 animate-pulse rounded-md" />
            </div>

            {/* Logs List Skeleton */}
            <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                    <div
                        key={i}
                        className="relative flex flex-col md:flex-row md:items-center justify-between p-4 pl-5 bg-dark-800/40 rounded-xl border border-dark-700/50 overflow-hidden"
                    >
                        {/* Accent Line Skeleton */}
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-dark-700 animate-pulse" />

                        <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-6 w-full">
                            {/* User Info Skeleton */}
                            <div className="flex-1">
                                <div className="h-4 w-32 bg-dark-700 animate-pulse rounded mb-2" />
                                <div className="h-3 w-48 bg-dark-700 animate-pulse rounded" />
                            </div>

                            {/* Badges Skeleton (Direction & Status) */}
                            <div className="flex items-center gap-3 mt-3 md:mt-0">
                                <div className="h-6 w-16 bg-dark-700 animate-pulse rounded-lg" />
                                <div className="h-6 w-16 bg-dark-700 animate-pulse rounded-lg" />
                            </div>
                        </div>

                        {/* Date & Time Skeleton */}
                        <div className="mt-4 md:mt-0 md:ml-6 md:text-right shrink-0 flex flex-col md:items-end">
                            <div className="h-4 w-16 bg-dark-700 animate-pulse rounded mb-1.5" />
                            <div className="h-3 w-24 bg-dark-700 animate-pulse rounded" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}