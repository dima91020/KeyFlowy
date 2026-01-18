'use server'

import { z } from 'zod'
import { prisma } from '@/app/lib/prisma'
import { hash } from 'bcrypt'
import { redirect } from 'next/navigation'

const setupSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});

export type SetupState = {
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

export async function createAdminAction(prevState: SetupState, formData: FormData): Promise<SetupState> {
    const rawData = {
        name: formData.get('name') as string,
        email: formData.get('email') as string,
        password: formData.get('password') as string,
        confirmPassword: formData.get('confirmPassword') as string,
    }

    const validatedFields = setupSchema.safeParse(rawData)

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
        await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: 'ADMIN',
                cardUid: 'ADMIN_' + Date.now(),
            }
        })
    } catch (error) {
        return {
            message: "Database Error: Failed to create user.",
            inputs: { name: rawData.name, email: rawData.email }
        }
    }

    redirect('/login')
}