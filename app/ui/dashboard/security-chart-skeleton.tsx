import { ShieldExclamationIcon } from '@heroicons/react/24/outline'

export function SecurityChartSkeleton() {
    return (
        <div className="bg-dark-800 border border-dark-700 rounded-2xl p-6 shadow-lg h-[400px] flex flex-col w-full relative animate-pulse">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <ShieldExclamationIcon className="text-dark-600 w-5 h-5" />
                <div className="h-6 w-40 bg-dark-700 rounded" />
            </h3>

            <div className="flex-1 w-full h-full flex flex-col items-center justify-center relative pb-6">

                <div className="relative flex items-center justify-center w-48 h-48 rounded-full border-[20px] border-dark-700">
                    <div className="absolute flex flex-col items-center justify-center">
                        <div className="h-8 w-16 bg-dark-600 rounded mb-2" />
                        <div className="h-3 w-12 bg-dark-700 rounded" />
                    </div>
                </div>

                <div className="flex gap-4 mt-8">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-dark-700" />
                        <div className="h-4 w-16 bg-dark-700 rounded" />
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-dark-700" />
                        <div className="h-4 w-16 bg-dark-700 rounded" />
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-dark-700" />
                        <div className="h-4 w-16 bg-dark-700 rounded" />
                    </div>
                </div>

            </div>
        </div>
    )
}