import { prisma } from '@/app/lib/prisma'
import { verifySession } from '@/app/lib/session'
import { NextResponse } from 'next/server'

export async function GET() {
    const userId = await verifySession()
    if (!userId) return new NextResponse('Unauthorized', { status: 401 })

    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) return new NextResponse('Unauthorized', { status: 401 })

    const logs = await prisma.log.findMany({
        where: user.role === 'ADMIN' ? { device: { adminId: user.id } } : { userId: user.id },
        orderBy: { timestamp: 'desc' },
        include: { user: true, device: true }
    })

    // Спеціальний символ, який каже Excel, що файл має кодування UTF-8
    const BOM = '\uFEFF'

    const csvHeaders = ['Date', 'Time', 'User', 'Card UID', 'Device', 'Direction', 'Status', 'Event Type']
    const csvRows = logs.map(log => {
        const date = log.timestamp.toISOString().split('T')[0]
        const time = log.timestamp.toISOString().split('T')[1].split('.')[0]
        const userName = log.user?.name || 'Unknown'
        const cardUid = log.cardUid || '-'
        const deviceName = log.device?.name || 'Unknown'
        const direction = log.direction || '-'
        const status = log.accessGranted ? 'Granted' : 'Denied'
        const eventType = log.eventType

        // Змінили розділювач на крапку з комою (;)
        return [date, time, `"${userName}"`, cardUid, `"${deviceName}"`, direction, status, eventType].join(';')
    })

    // Додаємо BOM на самий початок і з'єднуємо заголовки та рядки через ентер
    const csvContent = BOM + [csvHeaders.join(';'), ...csvRows].join('\n')

    return new NextResponse(csvContent, {
        headers: {
            'Content-Type': 'text/csv; charset=utf-8',
            'Content-Disposition': 'attachment; filename="access_logs.csv"'
        }
    })
}