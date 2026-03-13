'use server'

import { prisma } from '@/app/lib/prisma'
import { Prisma } from '@prisma/client'

export type LogWithDetails = Prisma.LogGetPayload<{
    include: {
        user: true,
        device: true
    }
}>

export async function getRecentLogsAction() {
    // Визначаємо початок та кінець поточного дня
    const now = new Date()
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0)
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999)

    return await prisma.log.findMany({
        where: {
            timestamp: {
                gte: startOfDay, // Більше або дорівнює початку дня
                lte: endOfDay,   // Менше або дорівнює кінцю дня
            }
        },
        orderBy: {
            timestamp: 'desc'
        },
        take: 50, // Можеш залишити ліміт, щоб не перевантажувати сторінку, якщо проходів багато
        include: {
            user: true,
            device: true
        }
    })
}

export type DailyStat = {
    date: string;
    rawDate: string;
    entries: number;
    exits: number;
    workHours: number;
};

export async function getWeeklyStatsAction() {
    const now = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(now.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const logs = await prisma.log.findMany({
        where: {
            timestamp: {
                gte: sevenDaysAgo
            },
            accessGranted: true,
            eventType: { not: 'INTRUSION' }
        },
        select: {
            timestamp: true,
            direction: true
        }
    });

    // Типізуємо масив за допомогою створеного типу
    const days: DailyStat[] = [];

    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(now.getDate() - i);
        days.push({
            date: d.toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short' }),
            rawDate: d.toDateString(),
            entries: 0,
            exits: 0,
            workHours: 0
        });
    }

    logs.forEach(log => {
        const logDateString = log.timestamp.toDateString();
        const dayBucket = days.find(d => d.rawDate === logDateString);
        if (dayBucket) {
            if (log.direction === 'ENTRY') dayBucket.entries++;
            if (log.direction === 'EXIT') dayBucket.exits++;
        }
    });

    return days;
}

export async function getUserProfileStatsAction(userId: string) {
    const user = await prisma.user.findUnique({
        where: { id: userId }
    });

    if (!user) return null;

    const recentLogs: LogWithDetails[] = await prisma.log.findMany({
        where: { userId: userId },
        orderBy: { timestamp: 'desc' },
        take: 10,
        include: { device: true, user: true }
    });

    const now = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(now.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    // Додаємо сортування по зростанню часу (asc), щоб легко знайти перший вхід і останній вихід
    const logsForStats = await prisma.log.findMany({
        where: {
            userId: userId,
            timestamp: { gte: sevenDaysAgo },
            accessGranted: true,
            eventType: { not: 'INTRUSION' }
        },
        orderBy: { timestamp: 'asc' },
        select: { timestamp: true, direction: true }
    });

    const weeklyStats: DailyStat[] = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(now.getDate() - i);
        weeklyStats.push({
            date: d.toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short' }),
            rawDate: d.toDateString(),
            entries: 0,
            exits: 0,
            workHours: 0 // Початкове значення
        });
    }

    // Групуємо логи по днях для зручного підрахунку
    const logsByDate = logsForStats.reduce((acc, log) => {
        const dateStr = log.timestamp.toDateString();
        if (!acc[dateStr]) acc[dateStr] = [];
        acc[dateStr].push(log);
        return acc;
    }, {} as Record<string, typeof logsForStats>);

    weeklyStats.forEach(day => {
        const dayLogs = logsByDate[day.rawDate] || [];

        // 1. Рахуємо кількість проходів
        day.entries = dayLogs.filter(l => l.direction === 'ENTRY').length;
        day.exits = dayLogs.filter(l => l.direction === 'EXIT').length;

        // 2. Рахуємо робочі години (Різниця між першим входом і останнім виходом)
        if (dayLogs.length > 0) {
            const firstEntry = dayLogs.find(l => l.direction === 'ENTRY');
            // Робимо копію масиву, перевертаємо і шукаємо перший (тобто останній за день) вихід
            const lastExit = [...dayLogs].reverse().find(l => l.direction === 'EXIT');

            if (firstEntry && lastExit && lastExit.timestamp > firstEntry.timestamp) {
                const diffMs = lastExit.timestamp.getTime() - firstEntry.timestamp.getTime();
                const hours = diffMs / (1000 * 60 * 60); // Переводимо мілісекунди в години
                day.workHours = Number(hours.toFixed(1)); // Залишаємо 1 знак після коми
            }
        }
    });

    // Рахуємо середній робочий час за тиждень (тільки для днів, коли людина була в офісі)
    const daysWithHours = weeklyStats.filter(d => d.workHours > 0);
    const avgWorkHours = daysWithHours.length > 0
        ? daysWithHours.reduce((sum, d) => sum + d.workHours, 0) / daysWithHours.length
        : 0;

    return {
        user,
        recentLogs,
        weeklyStats,
        avgWorkHours: Number(avgWorkHours.toFixed(1))
    };
}

export type HourlyStat = {
    hour: string;
    count: number;
};

export async function getPeakHoursAction() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Беремо всі успішні проходи за 30 днів
    const logs = await prisma.log.findMany({
        where: {
            timestamp: { gte: thirtyDaysAgo },
            accessGranted: true,
            eventType: { not: 'INTRUSION' }
        },
        select: { timestamp: true }
    });

    // Створюємо масив з 24 годин (від 00:00 до 23:00)
    const hours: HourlyStat[] = Array.from({ length: 24 }, (_, i) => ({
        hour: `${i.toString().padStart(2, '0')}:00`,
        count: 0
    }));

    // Розподіляємо кожен лог у відповідну годину
    logs.forEach(log => {
        const hour = log.timestamp.getHours();
        hours[hour].count++;
    });

    return hours;
}

export type SecurityStat = {
    name: string;
    value: number;
    color: string;
};

export async function getSecurityStatsAction() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Беремо всі події за місяць (лише потрібні поля для швидкості)
    const logs = await prisma.log.findMany({
        where: { timestamp: { gte: thirtyDaysAgo } },
        select: { accessGranted: true, eventType: true }
    });

    let granted = 0;
    let denied = 0;
    let intrusions = 0;

    // Розподіляємо події
    logs.forEach(log => {
        if (log.eventType === 'INTRUSION') {
            intrusions++;
        } else if (log.accessGranted) {
            granted++;
        } else {
            denied++;
        }
    });

    // Повертаємо масив об'єктів для графіка з готовими Tailwind-кольорами
    const stats: SecurityStat[] = [
        { name: 'Granted', value: granted, color: '#10B981' },    // Emerald-500
        { name: 'Denied', value: denied, color: '#F59E0B' },      // Amber-500
        { name: 'Intrusions', value: intrusions, color: '#EF4444' } // Red-500
    ];

    return stats;
}
