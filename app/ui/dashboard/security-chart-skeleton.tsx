export function SecurityChartSkeleton() {
    return (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm h-[340px] flex flex-col w-full relative animate-pulse">
            <div className="h-4 w-32 bg-slate-200 rounded mb-4" />

            <div className="flex-1 w-full h-full flex flex-col items-center justify-center relative pb-6">
                <div className="relative flex items-center justify-center w-40 h-40 rounded-full border-[16px] border-slate-100">
                    <div className="absolute flex flex-col items-center justify-center">
                        <div className="h-6 w-12 bg-slate-200 rounded mb-1" />
                        <div className="h-3 w-16 bg-slate-100 rounded" />
                    </div>
                </div>

                <div className="flex gap-4 mt-6">
                    <div className="h-3 w-14 bg-slate-200 rounded" />
                    <div className="h-3 w-14 bg-slate-200 rounded" />
                    <div className="h-3 w-14 bg-slate-200 rounded" />
                </div>
            </div>
        </div>
    )
}