'use server'

import { z } from 'zod'
import { prisma } from '@/app/lib/prisma'
import { compare } from 'bcrypt'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

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
            inputs: { email: rawData.email }
        }
    }

    const { email, password } = validatedFields.data

    try {
        const user = await prisma.user.findUnique({
            where: { email }
        })

        if (!user || !user.password || !(await compare(password, user.password))) {
            return {
                message: "Invalid email or password.",
                inputs: { email }
            }
        }

        const cookieStore = await cookies()
        cookieStore.set('session', user.id, {
            httpOnly: true,
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24 * 7,
            path: '/',
        })

    } catch (error) {
        console.error("Login Error:", error)
        return {
            message: "Something went wrong. Please try again.",
            inputs: { email: rawData.email }
        }
    }

    redirect('/dashboard')
}

export async function logoutAction() {
    const cookieStore = await cookies()
    cookieStore.delete('session')
    redirect('/login')
}