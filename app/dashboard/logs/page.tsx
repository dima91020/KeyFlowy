import { prisma } from '@/app/lib/prisma'
import { Prisma } from '@prisma/client'
import { MagnifyingGlassIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'
import { verifySession } from '@/app/lib/session'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { LogCard } from '@/app/ui/logs/log-card'
import { CustomSelect } from '@/app/ui/logs/custom-select'
import { LiveListener } from "@/app/dashboard/users/live-listener"
import { ExportButton } from './export-button'

const ITEMS_PER_PAGE = 20

export default async function LogsPage({searchParams}: {
    searchParams?: Promise<{ query?: string; status?: string; direction?: string; sort?: string; page?: string }>;
}) {
    const currentUserId = await verifySession()
    if (!currentUserId) redirect('/login')

    const user = await prisma.user.findUnique({ where: { id: currentUserId } })
    if (!user) redirect('/login')

    const params = await searchParams;
    const query = params?.query || '';
    const status = params?.status || 'ALL';
    const direction = params?.direction || 'ALL';
    const sort = params?.sort || 'desc';
    const currentPage = Number(params?.page) || 1;

    const whereCondition: Prisma.LogWhereInput = {}
    const andConditions: Prisma.LogWhereInput[] = []

    if (user.role === 'ADMIN') {
        andConditions.push({ device: { adminId: user.id } })
    } else {
        andConditions.push({ userId: user.id })
    }

    if (query) {
        andConditions.push({
            OR: [
                { user: { name: { contains: query, mode: 'insensitive' } } },
                { cardUid: { contains: query, mode: 'insensitive' } }
            ]
        })
    }

    if (status === 'GRANTED') andConditions.push({ accessGranted: true, eventType: { not: 'INTRUSION' } })
    else if (status === 'DENIED') andConditions.push({ accessGranted: false, eventType: { not: 'INTRUSION' } })
    else if (status === 'INTRUSION') andConditions.push({ eventType: 'INTRUSION' })

    if (direction === 'ENTRY') andConditions.push({ direction: 'ENTRY' })
    else if (direction === 'EXIT') andConditions.push({ direction: 'EXIT' })

    if (andConditions.length > 0) {
        whereCondition.AND = andConditions
    }

    const totalLogs = await prisma.log.count({ where: whereCondition })
    const totalPages = Math.ceil(totalLogs / ITEMS_PER_PAGE)

    const logs = await prisma.log.findMany({
        where: whereCondition,
        orderBy: {
            timestamp: sort === 'asc' ? 'asc' : 'desc'
        },
        skip: (currentPage - 1) * ITEMS_PER_PAGE,
        take: ITEMS_PER_PAGE,
        include: {
            user: true,
            device: true
        }
    })

    const createPageUrl = (pageNumber: number) => {
        const urlParams = new URLSearchParams()
        if (query) urlParams.set('query', query)
        if (status !== 'ALL') urlParams.set('status', status)
        if (direction !== 'ALL') urlParams.set('direction', direction)
        if (sort !== 'desc') urlParams.set('sort', sort)
        urlParams.set('page', pageNumber.toString())
        return `/dashboard/logs?${urlParams.toString()}`
    }

    return (
        <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
            <LiveListener />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Access Logs</h1>
                    <p className="text-slate-500 text-sm mt-0.5">Real-time audit log of passages, alarms, and credentials.</p>
                </div>

                <div className="flex items-center gap-3">
                    <span className="text-xs font-medium text-slate-500 bg-white px-3 py-2 rounded-lg border border-slate-200 shadow-sm hidden sm:inline-block">
                        Total: <strong className="text-slate-900">{totalLogs}</strong>
                    </span>
                    <ExportButton />
                </div>
            </div>

            {/* Filter Bar */}
            <form method="GET" className="bg-white border border-slate-200 rounded-xl p-3.5 flex flex-col md:flex-row gap-3 items-end shadow-sm">
                <div className="flex-1 w-full space-y-1">
                    <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Search</label>
                    <div className="relative h-[38px]">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <input
                            name="query"
                            defaultValue={query}
                            placeholder="Filter by name or card UID..."
                            className="w-full h-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 text-xs text-slate-900 outline-none focus:bg-white focus:border-slate-900 transition-colors"
                        />
                    </div>
                </div>

                <div className="w-full md:w-36 space-y-1">
                    <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Status</label>
                    <CustomSelect
                        name="status"
                        defaultValue={status}
                        options={[
                            { value: 'ALL', label: 'All Statuses' },
                            { value: 'GRANTED', label: 'Granted' },
                            { value: 'DENIED', label: 'Denied' },
                            { value: 'INTRUSION', label: 'Intrusions' }
                        ]}
                    />
                </div>

                <div className="w-full md:w-36 space-y-1">
                    <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Direction</label>
                    <CustomSelect
                        name="direction"
                        defaultValue={direction}
                        options={[
                            { value: 'ALL', label: 'All Directions' },
                            { value: 'ENTRY', label: 'Entry Only' },
                            { value: 'EXIT', label: 'Exit Only' }
                        ]}
                    />
                </div>

                <div className="w-full md:w-36 space-y-1">
                    <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Order</label>
                    <CustomSelect
                        name="sort"
                        defaultValue={sort}
                        options={[
                            { value: 'desc', label: 'Newest First' },
                            { value: 'asc', label: 'Oldest First' }
                        ]}
                    />
                </div>

                <div className="flex gap-2 w-full md:w-auto">
                    <button
                        type="submit"
                        className="flex-1 md:flex-none bg-slate-900 hover:bg-slate-800 text-white px-4 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1.5 h-[38px] shadow-sm"
                    >
                        Filter
                    </button>

                    <Link
                        href="/dashboard/logs"
                        className="px-3 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition-colors flex items-center justify-center h-[38px]"
                    >
                        Reset
                    </Link>
                </div>
            </form>

            <div className="space-y-2.5">
                {logs.length === 0 ? (
                    <div className="text-center py-16 text-slate-400 border border-dashed border-slate-200 rounded-xl bg-white p-8 text-xs">
                        No logs match your filter criteria.
                    </div>
                ) : (
                    logs.map((log) => (
                        <LogCard key={log.id} log={log} />
                    ))
                )}
            </div>

            {totalPages > 1 && (
                <div className="flex items-center justify-between pt-4 border-t border-slate-200 text-xs">
                    <p className="text-slate-500">
                        Page <strong className="text-slate-900">{currentPage}</strong> of <strong className="text-slate-900">{totalPages}</strong>
                    </p>
                    <div className="flex gap-2">
                        {currentPage > 1 ? (
                            <Link
                                href={createPageUrl(currentPage - 1)}
                                className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-1 font-medium shadow-xs"
                            >
                                <ChevronLeftIcon className="w-3.5 h-3.5" /> Prev
                            </Link>
                        ) : (
                            <button disabled className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-400 cursor-not-allowed flex items-center gap-1 font-medium">
                                <ChevronLeftIcon className="w-3.5 h-3.5" /> Prev
                            </button>
                        )}

                        {currentPage < totalPages ? (
                            <Link
                                href={createPageUrl(currentPage + 1)}
                                className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-1 font-medium shadow-xs"
                            >
                                Next <ChevronRightIcon className="w-3.5 h-3.5" />
                            </Link>
                        ) : (
                            <button disabled className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-400 cursor-not-allowed flex items-center gap-1 font-medium">
                                Next <ChevronRightIcon className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}