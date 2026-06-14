'use server'

import { prisma } from '@/app/lib/prisma'
import { verifySession } from '@/app/lib/session'
import { hash, compare } from 'bcrypt'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export type PasswordState = {
    message: string | null;
    success: boolean;
    inputs?: {
        currentPassword?: string;
        newPassword?: string;
    };
    errors?: {
        currentPassword?: string;
        newPassword?: string;
    };
}

export async function changePasswordAction(prevState: PasswordState, formData: FormData): Promise<PasswordState> {
    const userId = await verifySession()
    if (!userId) {
        return { message: "Unauthorized", success: false }
    }

    const currentPassword = formData.get('currentPassword') as string
    const newPassword = formData.get('newPassword') as string

    const inputs = { currentPassword, newPassword }
    const errors: { currentPassword?: string, newPassword?: string } = {}

    // Валідація полів
    if (!currentPassword) {
        errors.currentPassword = "Current password is required"
    }
    if (!newPassword || newPassword.length < 6) {
        errors.newPassword = "New password must be at least 6 characters"
    }

    if (Object.keys(errors).length > 0) {
        return { message: "Please check your inputs", success: false, inputs, errors }
    }

    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user || !user.password) {
        return { message: "User error", success: false, inputs }
    }

    // Перевірка поточного пароля
    const isValid = await compare(currentPassword, user.password)
    if (!isValid) {
        return {
            message: "Authentication failed",
            success: false,
            inputs,
            errors: { currentPassword: "Incorrect current password" }
        }
    }

    const hashedNew = await hash(newPassword, 10)

    await prisma.user.update({
        where: { id: userId },
        data: { password: hashedNew }
    })

    redirect('/dashboard')
}

export type EmailState = {
    message: string | null;
    success: boolean;
}

export async function updateEmailAction(prevState: EmailState, formData: FormData): Promise<EmailState> {
    const userId = await verifySession()
    if (!userId) return { message: "Unauthorized", success: false }

    const newEmail = formData.get('email') as string
    if (!newEmail || !newEmail.includes('@')) {
        return { message: "Please enter a valid email address.", success: false }
    }

    try {
        const user = await prisma.user.findUnique({ where: { id: userId } })

        // Перевіряємо, чи юзер існує і чи є він адміном
        if (!user || user.role !== 'ADMIN') {
            return { message: "Only administrators can change their login email.", success: false }
        }

        await prisma.user.update({
            where: { id: userId },
            data: { email: newEmail }
        })

        // Оновлюємо кеш сторінки, щоб нова пошта одразу відобразилася в інпуті
        revalidatePath('/dashboard/settings')

        return { message: "Email updated successfully. Use it for your next login.", success: true }
    } catch (error) {
        // Якщо Prisma викидає помилку унікальності поля email
        return { message: "This email is already in use.", success: false }
    }
}