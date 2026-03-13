import { prisma } from '@/app/lib/prisma'
import { Prisma } from '@prisma/client'
import { Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react'
import { verifySession } from '@/app/lib/session'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { LogCard } from '@/app/ui/logs/log-card'
import { CustomSelect } from '@/app/ui/logs/custom-select'


const ITEMS_PER_PAGE = 20

export default async function LogsPage({searchParams}: {
    searchParams?: Promise<{ query?: string; status?: string; direction?: string; sort?: string; page?: string }>;
}) {
    const currentUserId = await verifySession()
    if (!currentUserId) redirect('/login')

    const params = await searchParams;
    const query = params?.query || '';
    const status = params?.status || 'ALL';
    const direction = params?.direction || 'ALL';
    const sort = params?.sort || 'desc';
    const currentPage = Number(params?.page) || 1;

    // Правильно і динамічно формуємо умови пошуку без порожніх об'єктів
    const whereCondition: Prisma.LogWhereInput = {}
    const andConditions: Prisma.LogWhereInput[] = []

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

    // Отримуємо загальну кількість для пагінації
    const totalLogs = await prisma.log.count({ where: whereCondition })
    const totalPages = Math.ceil(totalLogs / ITEMS_PER_PAGE)

    // Отримуємо самі логи
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

    // Функція для генерації URL з поточними параметрами
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
        <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
            <div>
                <h1 className="text-3xl font-bold text-white">Access Logs</h1>
                <p className="text-dark-muted mt-1">Full history of access events, intrusions, and movements.</p>
            </div>

            {/* Панель фільтрів */}
            <form method="GET" className="bg-dark-800/50 border border-dark-700/50 rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-end">
                <div className="flex-1 w-full space-y-1.5">
                    <label className="text-xs font-medium text-dark-muted ml-1">Search</label>
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 text-dark-muted" size={18} />
                        <input
                            name="query"
                            defaultValue={query}
                            placeholder="Search by name or card UID..."
                            className="w-full bg-dark-900 border border-dark-700 rounded-xl pl-10 pr-4 py-2 outline-none focus:border-primary text-sm transition-colors"
                        />
                    </div>
                </div>

                <div className="w-full md:w-40 space-y-1.5">
                    <label className="text-xs font-medium text-dark-muted ml-1">Status</label>
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

                <div className="w-full md:w-40 space-y-1.5">
                    <label className="text-xs font-medium text-dark-muted ml-1">Direction</label>
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

                <div className="w-full md:w-40 space-y-1.5">
                    <label className="text-xs font-medium text-dark-muted ml-1">Sort by Date</label>
                    <CustomSelect
                        name="sort"
                        defaultValue={sort}
                        options={[
                            { value: 'desc', label: 'Newest first' },
                            { value: 'asc', label: 'Oldest first' }
                        ]}
                    />
                </div>

                <div className="flex gap-2 w-full md:w-auto">
                    <button type="submit" className="flex-1 md:flex-none bg-primary hover:bg-blue-600 text-white px-6 py-2 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 h-[38px]">
                        <Filter size={16} />
                        Apply
                    </button>

                    <Link href="/dashboard/logs" className="px-4 py-2 rounded-xl text-sm font-medium text-dark-muted hover:text-white bg-dark-700 hover:bg-dark-600 transition-all h-[38px] flex items-center justify-center">
                        Reset
                    </Link>
                </div>
            </form>

            {/* Список логів */}
            <div className="space-y-3">
                {logs.length === 0 ? (
                    <div className="text-center py-20 text-dark-muted border border-dashed border-dark-700/50 rounded-2xl">
                        <Search size={48} className="mx-auto mb-3 opacity-20" />
                        <p>No logs found matching your criteria.</p>
                    </div>
                ) : (
                    logs.map((log) => (
                        <LogCard key={log.id} log={log} />
                    ))
                )}
            </div>

            {/* Пагінація */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between pt-6 border-t border-dark-700/50">
                    <p className="text-sm text-dark-muted">
                        Page <span className="text-white font-medium">{currentPage}</span> of <span className="text-white font-medium">{totalPages}</span>
                    </p>
                    <div className="flex gap-2">
                        {currentPage > 1 ? (
                            <Link
                                href={createPageUrl(currentPage - 1)}
                                className="px-3 py-2 rounded-xl bg-dark-800 border border-dark-700 text-white hover:bg-dark-700 transition-colors flex items-center gap-1 text-sm"
                            >
                                <ChevronLeft size={16} /> Previous
                            </Link>
                        ) : (
                            <button disabled className="px-3 py-2 rounded-xl bg-dark-900/50 border border-dark-800 text-dark-muted cursor-not-allowed flex items-center gap-1 text-sm">
                                <ChevronLeft size={16} /> Previous
                            </button>
                        )}

                        {currentPage < totalPages ? (
                            <Link
                                href={createPageUrl(currentPage + 1)}
                                className="px-3 py-2 rounded-xl bg-dark-800 border border-dark-700 text-white hover:bg-dark-700 transition-colors flex items-center gap-1 text-sm"
                            >
                                Next <ChevronRight size={16} />
                            </Link>
                        ) : (
                            <button disabled className="px-3 py-2 rounded-xl bg-dark-900/50 border border-dark-800 text-dark-muted cursor-not-allowed flex items-center gap-1 text-sm">
                                Next <ChevronRight size={16} />
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}