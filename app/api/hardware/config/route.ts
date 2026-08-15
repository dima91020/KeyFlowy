import { prisma } from '@/app/lib/prisma'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const mac = searchParams.get('mac')

    if (!mac) {
        return new NextResponse('MAC address is required', { status: 400 })
    }

    try {
        const device = await prisma.device.findUnique({
            where: { macAddress: mac },
            select: {
                relayTime: true,
                relayType: true,
                isOnline: true
            }
        })

        if (!device) {
            return new NextResponse('Device not found', { status: 404 })
        }

        return NextResponse.json({
            relayTime: device.relayTime,
            relayType: device.relayType
        }, {
            headers: {
                'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0',
            }
        })

    } catch (error) {
        console.error('Error fetching device config:', error)
        return new NextResponse('Internal Server Error', { status: 500 })
    }
}