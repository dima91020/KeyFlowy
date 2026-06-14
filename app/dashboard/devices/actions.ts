'use server'

import { prisma } from '@/app/lib/prisma'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { verifySession } from '@/app/lib/session'
import { Prisma } from '@prisma/client'

// 1. Схеми валідації
const updateDeviceSchema = z.object({
    id: z.string(),
    name: z.string().min(2, "Name must be at least 2 characters").max(30, "Name is too long"),
    relayTime: z.coerce.number().min(1, "Minimum 1 second").max(60, "Maximum 60 seconds"),
    relayType: z.enum(["NO", "NC"]), // Додали валідацію типу реле
})

const deleteDeviceSchema = z.object({
    id: z.string(),
})

const createDeviceSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters").max(30, "Name is too long"),
    macAddress: z.string().regex(/^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/, "Invalid MAC address format (e.g., 24:0A:C4:00:01:10)"),
    description: z.string().max(200, "Description is too long").optional().or(z.literal('')),
})

// 2. Тип для стану форми
export type DeviceState = {
    message?: string | null;
    errors?: {
        name?: string[];
        macAddress?: string[];
        description?: string[];
        relayTime?: string[];
        relayType?: string[]; // Додали помилки для relayType
    };
}

// Отримуємо пристрої тільки поточного адміністратора
export async function getDevices() {
    const adminId = await verifySession()
    if (!adminId) return []

    return await prisma.device.findMany({
        where: { adminId },
        orderBy: [{ isOnline: 'desc' }, { lastSeen: 'desc' }]
    })
}

// 3. Екшен редагування
export async function updateDeviceAction(
    prevState: DeviceState,
    formData: FormData
): Promise<DeviceState> {
    const adminId = await verifySession()
    if (!adminId) return { message: "Unauthorized" }

    const rawData = {
        id: formData.get('id') as string,
        name: formData.get('name') as string,
        relayTime: formData.get('relayTime'),
        relayType: formData.get('relayType'), // Дістаємо тип реле
    }

    const validated = updateDeviceSchema.safeParse(rawData)

    if (!validated.success) {
        return {
            errors: validated.error.flatten().fieldErrors,
            message: "Validation failed"
        }
    }

    const { id, name, relayTime, relayType } = validated.data

    try {
        // Оновлюємо пристрій
        const result = await prisma.device.updateMany({
            where: {
                id,
                adminId // Перевіряємо, чи має право цей адмін оновлювати цей девайс
            },
            data: {
                name,
                relayTime,
                relayType // Зберігаємо новий тип реле
            }
        })

        if (result.count === 0) {
            return { message: "Device not found or access denied" }
        }

        revalidatePath('/dashboard/devices')
        revalidatePath('/dashboard/users/new')
        return { message: "Device updated successfully" }
    } catch (e) {
        return { message: "Database error: Failed to update device" }
    }
}

// 4. Екшен видалення
export async function deleteDevice(formData: FormData) {
    const adminId = await verifySession()
    if (!adminId) return

    const id = formData.get('id') as string
    const validated = deleteDeviceSchema.safeParse({ id })

    if (!validated.success) return;

    try {
        await prisma.device.deleteMany({
            where: {
                id: validated.data.id,
                adminId
            }
        })
        revalidatePath('/dashboard/devices')
    } catch (e) {
        console.error('Delete failed', e)
    }
}

// 5. Екшен створення пристрою
export async function createDeviceAction(
    prevState: DeviceState,
    formData: FormData
): Promise<DeviceState> {
    const adminId = await verifySession()
    if (!adminId) return { message: "Unauthorized: Please log in again." }

    const rawData = {
        name: formData.get('name') as string,
        macAddress: formData.get('macAddress') as string,
        description: formData.get('description') as string,
    }

    const validated = createDeviceSchema.safeParse(rawData)

    if (!validated.success) {
        return {
            errors: validated.error.flatten().fieldErrors,
            message: "Validation failed. Please check the fields."
        }
    }

    const { name, macAddress, description } = validated.data

    try {
        await prisma.device.create({
            data: {
                name,
                macAddress: macAddress.toUpperCase(),
                description: description || null,
                isOnline: false,
                relayTime: 5,
                relayType: "NO", // Дефолтний тип при створенні
                adminId,
            }
        });
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2002') {
                return {
                    message: "This device is already registered",
                    errors: { macAddress: ["MAC Address already exists in the system"] }
                };
            }
        }
        console.error("Помилка створення пристрою:", error)
        return { message: "Database error: Failed to create device" };
    }

    revalidatePath('/dashboard/devices');
    redirect('/dashboard/devices');
}