'use server'

import { prisma } from '@/app/lib/prisma'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { Prisma } from '@prisma/client'
import { verifySession } from '@/app/lib/session'

// --- ТИПИ ---

export type UserState = {
    message?: string | null;
    errors?: {
        name?: string[];
        email?: string[];
        jobTitle?: string[];
        cardUid?: string[];
        isActive?: string[];
    };
    inputs?: {
        name?: string;
        email?: string;
        jobTitle?: string;
        cardUid?: string;
    };
}

// --- HELPER SCHEMAS ---

// Цей трансформер перетворює пустий рядок "" на null.
// Це критично для полів, які є @unique в Prisma (як email та cardUid),
// бо база дозволяє багато null, але не дозволяє багато пустих рядків "".
const emptyStringToNull = z.string().trim().transform((val) => val === "" ? null : val);

// Схема для Email: Або null, або валідний email
const emailSchema = emptyStringToNull.pipe(z.string().email("Invalid email address").nullable());

// Схема для звичайних необов'язкових полів
const optionalStringSchema = emptyStringToNull.pipe(z.string().nullable());

// --- ОСНОВНІ СХЕМИ ---

const createUserSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    jobTitle: optionalStringSchema,
    cardUid: z.string().min(4, "Card UID is required"), // При створенні картка обов'язкова (за твоєю логікою)
    email: emailSchema,
});

const updateUserSchema = z.object({
    id: z.string(),
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: emailSchema,
    jobTitle: optionalStringSchema,
    // При оновленні картку можна стерти (зробити null), тому використовуємо optionalStringSchema
    // Якщо хочеш заборонити видаляти картку, поверни z.string().min(4)
    cardUid: optionalStringSchema,
    isActive: z.string().optional(),
});


// --- ACTIONS ---

export async function createUserAction(prevState: UserState, formData: FormData): Promise<UserState> {
    const rawData = {
        name: formData.get('name') as string,
        email: formData.get('email') as string,
        jobTitle: formData.get('jobTitle') as string,
        cardUid: formData.get('cardUid') as string,
    }

    const validated = createUserSchema.safeParse(rawData);

    if (!validated.success) {
        return {
            message: "Validation failed.",
            errors: validated.error.flatten().fieldErrors,
            inputs: rawData,
        };
    }

    const isInsideBool = formData.get('isInside') === 'on';

    try {
        await prisma.user.create({
            data: {
                name: validated.data.name,
                email: validated.data.email,
                jobTitle: validated.data.jobTitle,
                cardUid: validated.data.cardUid,
                role: 'EMPLOYEE',
                isActive: true,
                isInside: isInsideBool // <--- ТЕПЕР БЕРЕМО З ФОРМИ
            },
        })
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
            const target = String(error.meta?.target || '');

            if (target.includes('cardUid')) {
                return { message: "UID already taken.", inputs: rawData, errors: { cardUid: ["UID already assigned"] } }
            }
            if (target.includes('email')) {
                return { message: "Email already registered.", inputs: rawData, errors: { email: ["Email already taken"] } }
            }
        }
        console.error("Create User Error:", error);
        return { message: "Database Error: Failed to create user.", inputs: rawData }
    }

    revalidatePath('/dashboard/users')
    redirect('/dashboard/users')
}


export async function updateUser(prevState: UserState, formData: FormData): Promise<UserState> {
    // 1. Отримуємо значення чекбоксів ПРЯМО з форми
    const rawIsActive = formData.get('isActive');
    let isActiveBool = rawIsActive === 'on';

    // НОВЕ: Отримуємо значення чекбокса Anti-passback
    const rawIsInside = formData.get('isInside');
    const isInsideBool = rawIsInside === 'on';

    const currentUserId = await verifySession(); // Отримуємо ID поточного адміна

    const rawData = {
        id: formData.get('id') as string,
        name: formData.get('name') as string,
        email: formData.get('email') as string,
        jobTitle: formData.get('jobTitle') as string,
        cardUid: formData.get('cardUid') as string,
    }

    if (rawData.id === currentUserId) {
        isActiveBool = true; // Адмін не може заблокувати сам себе
    }

    const validated = updateUserSchema.safeParse(rawData)

    if (!validated.success) {
        return {
            message: "Validation failed",
            errors: validated.error.flatten().fieldErrors
        }
    }

    const { id, name, email, jobTitle, cardUid } = validated.data

    try {
        await prisma.user.update({
            where: { id },
            data: {
                name,
                email,
                jobTitle,
                cardUid: cardUid || null,
                isActive: isActiveBool,
                isInside: isInsideBool, // <--- НОВЕ: Зберігаємо статус локації
            }
        })
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
            const target = String(error.meta?.target || '');

            if (target.includes('email')) {
                return { message: "Email already in use.", errors: { email: ["Email already taken"] } }
            }
            if (target.includes('cardUid')) {
                return { message: "UID already assigned.", errors: { cardUid: ["UID already taken"] } }
            }
        }
        return { message: 'Database Error: Failed to update user.' }
    }

    revalidatePath('/dashboard/users')
    redirect('/dashboard/users')
}


export async function deleteUserAction(formData: FormData) {
    const userId = formData.get('id') as string;
    const currentUserId = await verifySession();

    if (!userId) return;

    if (userId === currentUserId) {
        console.error("Attempt to delete self blocked")
        return
    }

    try {
        await prisma.user.delete({ where: { id: userId } })
        revalidatePath('/dashboard/users')
    } catch (e) {
        console.error("Failed to delete user", e)
    }
}


export async function getOnlineDevices() {
    try {
        return await prisma.device.findMany({
            where: { isOnline: true },
            select: { macAddress: true, name: true },
            orderBy: { lastSeen: 'desc' }
        })
    } catch (error) {
        console.error("Failed to fetch devices", error)
        return []
    }
}