'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export function LiveListener() {
    const router = useRouter()

    useEffect(() => {
        const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8080'
        const ws = new WebSocket(wsUrl)

        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data)

                // Коли отримуємо подію успішного проходу, оновлюємо дані сторінки
                if (data.type === 'EVENT') {
                    router.refresh()
                }
            } catch (e) {
                console.error('WS Error', e)
            }
        }

        return () => ws.close()
    }, [router])

    return null // Цей компонент нічого не малює на екрані
}