'use server'

import { prisma } from '@/app/lib/prisma'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'

export async function deleteUserAction(userId: string) {
    const cookieStore = await cookies()
    const currentUserId = cookieStore.get('session')?.value

    if (userId === currentUserId) {
        console.error("Attempt to delete self blocked")
        return
    }

    try {
        await prisma.user.delete({
            where: { id: userId }
        })
        revalidatePath('/dashboard/users')
    } catch (e) {
        console.error("Failed to delete user", e)
    }
}