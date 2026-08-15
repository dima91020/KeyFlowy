export function RecentActivitySkeleton() {
    return (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <div className="h-4 w-32 bg-slate-200 rounded mb-4" />

            <div className="space-y-2.5">
                {[...Array(5)].map((_, i) => (
                    <div
                        key={i}
                        className="flex flex-col md:flex-row md:items-center justify-between p-3.5 bg-slate-50 rounded-lg border border-slate-100 animate-pulse"
                    >
                        <div className="flex-1 space-y-1.5">
                            <div className="h-3.5 w-28 bg-slate-200 rounded" />
                            <div className="h-3 w-40 bg-slate-100 rounded" />
                        </div>

                        <div className="flex items-center gap-2 mt-2 md:mt-0">
                            <div className="h-5 w-14 bg-slate-200 rounded" />
                            <div className="h-5 w-16 bg-slate-200 rounded" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}