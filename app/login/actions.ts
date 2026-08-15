'use server'

import { z } from 'zod'
import { prisma } from '@/app/lib/prisma'
import { compare } from 'bcryptjs'
import { redirect } from 'next/navigation'
import { createSession, deleteSession } from '@/app/lib/session'

const loginSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(1, "Password is required"),
})

export type LoginState = {
    errors?: {
        email?: string[];
        password?: string[];
    };
    message?: string | null;
    inputs?: {
        email?: string;
        password?: string;
    };
}

export async function loginAction(prevState: LoginState, formData: FormData): Promise<LoginState> {
    const rawData = {
        email: (formData.get('email') as string) || '',
        password: (formData.get('password') as string) || '',
    }

    const validatedFields = loginSchema.safeParse(rawData)

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: "Invalid credentials.",
            inputs: rawData
        }
    }

    const { email, password } = validatedFields.data

    try {
        const user = await prisma.user.findUnique({
            where: { email }
        })

        if (!user || !user.password) {
            return {
                message: "Invalid email or password.",
                inputs: rawData
            }
        }

        const isPasswordValid = await compare(password, user.password)

        if (!isPasswordValid) {
            return {
                message: "Invalid email or password.",
                inputs: rawData
            }
        }

        if (!user.isActive) {
            return {
                message: "Account is disabled. Please contact administrator.",
                inputs: rawData
            }
        }

        await createSession(user.id)

    } catch {
        return {
            message: "Something went wrong. Please try again.",
            inputs: rawData
        }
    }

    redirect('/dashboard')
}

export async function logoutAction() {
    await deleteSession()
    redirect('/')
}