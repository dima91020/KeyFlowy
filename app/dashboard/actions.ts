'use server'

import { prisma } from '@/app/lib/prisma'
import { Prisma } from '@prisma/client'
import {verifySession} from "@/app/lib/session";

export type LogWithDetails = Prisma.LogGetPayload<{
    include: {
        user: true,
        device: true
    }
}>

export async function getCurrentUserId() {
    return await verifySession()
}

// 1. Оновлено: Приймає adminId
export async function getRecentLogsAction(adminId: string) {
    const now = new Date()
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0)
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999)

    return await prisma.log.findMany({
        where: {
            timestamp: {
                gte: startOfDay,
                lte: endOfDay,
            },
            // ФІЛЬТР: логи тільки з пристроїв цього адміна
            device: {
                adminId: adminId
            }
        },
        orderBy: {
            timestamp: 'desc'
        },
        take: 50,
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

// 2. Оновлено: Приймає adminId
export async function getWeeklyStatsAction(adminId: string) {
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
            eventType: { not: 'INTRUSION' },
            // ФІЛЬТР: логи тільки з пристроїв цього адміна
            device: {
                adminId: adminId
            }
        },
        select: {
            timestamp: true,
            direction: true
        }
    });

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

// Функція getUserProfileStatsAction не потребує adminId,
// бо вона приймає конкретний userId (запит іде для конкретного працівника).
// Але для безпеки можна додати перевірку, чи належить цей юзер адміну (опціонально).
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
            workHours: 0
        });
    }

    const logsByDate = logsForStats.reduce((acc, log) => {
        const dateStr = log.timestamp.toDateString();
        if (!acc[dateStr]) acc[dateStr] = [];
        acc[dateStr].push(log);
        return acc;
    }, {} as Record<string, typeof logsForStats>);

    weeklyStats.forEach(day => {
        const dayLogs = logsByDate[day.rawDate] || [];

        day.entries = dayLogs.filter(l => l.direction === 'ENTRY').length;
        day.exits = dayLogs.filter(l => l.direction === 'EXIT').length;

        if (dayLogs.length > 0) {
            const firstEntry = dayLogs.find(l => l.direction === 'ENTRY');
            const lastExit = [...dayLogs].reverse().find(l => l.direction === 'EXIT');

            if (firstEntry && lastExit && lastExit.timestamp > firstEntry.timestamp) {
                const diffMs = lastExit.timestamp.getTime() - firstEntry.timestamp.getTime();
                const hours = diffMs / (1000 * 60 * 60);
                day.workHours = Number(hours.toFixed(1));
            }
        }
    });

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

// 3. Оновлено: Приймає adminId
export async function getPeakHoursAction(adminId: string) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const logs = await prisma.log.findMany({
        where: {
            timestamp: { gte: thirtyDaysAgo },
            accessGranted: true,
            eventType: { not: 'INTRUSION' },
            // ФІЛЬТР
            device: {
                adminId: adminId
            }
        },
        select: { timestamp: true }
    });

    const hours: HourlyStat[] = Array.from({ length: 24 }, (_, i) => ({
        hour: `${i.toString().padStart(2, '0')}:00`,
        count: 0
    }));

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

// 4. Оновлено: Приймає adminId
export async function getSecurityStatsAction(adminId: string) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const logs = await prisma.log.findMany({
        where: {
            timestamp: { gte: thirtyDaysAgo },
            // ФІЛЬТР
            device: {
                adminId: adminId
            }
        },
        select: { accessGranted: true, eventType: true }
    });

    let granted = 0;
    let denied = 0;
    let intrusions = 0;

    logs.forEach(log => {
        if (log.eventType === 'INTRUSION') {
            intrusions++;
        } else if (log.accessGranted) {
            granted++;
        } else {
            denied++;
        }
    });

    const stats: SecurityStat[] = [
        { name: 'Granted', value: granted, color: '#10B981' },
        { name: 'Denied', value: denied, color: '#F59E0B' },
        { name: 'Intrusions', value: intrusions, color: '#EF4444' }
    ];

    return stats;
}