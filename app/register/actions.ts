'use server'

import { z } from 'zod'
import { prisma } from '@/app/lib/prisma'
import { hash } from 'bcrypt'
import { redirect } from 'next/navigation'
import { Prisma } from '@prisma/client'
import { createSession } from '@/app/lib/session'

const registerSchema = z.object({
    name: z.string().min(2, "Company/Admin name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});

export type RegisterState = {
    errors?: {
        name?: string[];
        email?: string[];
        password?: string[];
        confirmPassword?: string[];
    };
    message?: string | null;
    inputs?: {
        name?: string;
        email?: string;
    };
}

export async function registerAdminAction(prevState: RegisterState, formData: FormData): Promise<RegisterState> {
    const rawData = {
        name: formData.get('name') as string,
        email: formData.get('email') as string,
        password: formData.get('password') as string,
        confirmPassword: formData.get('confirmPassword') as string,
    }

    const validatedFields = registerSchema.safeParse(rawData)

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: "Check your data.",
            inputs: {
                name: rawData.name,
                email: rawData.email
            }
        }
    }

    const { name, email, password } = validatedFields.data
    const hashedPassword = await hash(password, 10)

    try {
        // Зберігаємо створеного користувача у змінну
        const newUser = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: 'ADMIN',
            }
        })

        // Одразу створюємо сесію (куку) для цього адміна
        await createSession(newUser.id)

    } catch (error) {
        // Точна перевірка на дублікат email за допомогою вбудованого класу Prisma
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2002') {
                return {
                    errors: { email: ["This email is already registered"] },
                    message: "Registration failed.",
                    inputs: { name: rawData.name, email: rawData.email }
                }
            }
        }

        console.error("Помилка створення адміна:", error)

        return {
            message: "Database Error: Failed to create admin account.",
            inputs: { name: rawData.name, email: rawData.email }
        }
    }

    // Тепер редірект спрацює без проблем, бо сесія вже існує
    redirect('/dashboard')
}