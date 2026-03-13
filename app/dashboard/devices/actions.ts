'use server'

import { prisma } from '@/app/lib/prisma'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'

// 1. Схеми валідації
const updateDeviceSchema = z.object({
    id: z.string(),
    name: z.string().min(2, "Name must be at least 2 characters").max(30, "Name is too long"),
})

const deleteDeviceSchema = z.object({
    id: z.string(),
})

const createDeviceSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters").max(30, "Name is too long"),
    // Перевіряємо стандартний формат MAC-адреси (наприклад, 24:0A:C4:00:01:10 або 24-0A-C4-00-01-10)
    macAddress: z.string().regex(/^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/, "Invalid MAC address format (e.g., 24:0A:C4:00:01:10)"),
    description: z.string().max(200, "Description is too long").optional().or(z.literal('')),
})

// 2. Тип для стану форми (те, що повертає екшен)
export type DeviceState = {
    message?: string | null;
    errors?: {
        name?: string[];
        macAddress?: string[];
        description?: string[];
    };
}

export async function getDevices() {
    return await prisma.device.findMany({
        orderBy: [{ isOnline: 'desc' }, { lastSeen: 'desc' }]
    })
}

// 3. Екшен редагування
export async function updateDeviceName(
    prevState: DeviceState,
    formData: FormData
): Promise<DeviceState> {
    const rawData = {
        id: formData.get('id') as string,
        name: formData.get('name') as string,
    }

    const validated = updateDeviceSchema.safeParse(rawData)

    if (!validated.success) {
        return {
            errors: validated.error.flatten().fieldErrors,
            message: "Validation failed"
        }
    }

    const { id, name } = validated.data

    try {
        await prisma.device.update({
            where: { id },
            data: { name }
        })
        revalidatePath('/dashboard/devices')
        revalidatePath('/dashboard/users/new')
        return { message: "Device updated successfully" }
    } catch (e) {
        return { message: "Database error: Failed to update device" }
    }
}

// 4. Екшен видалення
export async function deleteDevice(formData: FormData) {
    const id = formData.get('id') as string

    const validated = deleteDeviceSchema.safeParse({ id })

    if (!validated.success) return;

    try {
        await prisma.device.delete({
            where: { id: validated.data.id }
        })
        revalidatePath('/dashboard/devices')
    } catch (e) {
        console.error('Delete failed', e)
    }
}

// 5. НОВИЙ Екшен створення пристрою
export async function createDeviceAction(
    prevState: DeviceState,
    formData: FormData
): Promise<DeviceState> {
    const rawData = {
        name: formData.get('name') as string,
        macAddress: formData.get('macAddress') as string,
        description: formData.get('description') as string,
    }

    // Валідація Zod
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
                macAddress: macAddress.toUpperCase(), // Завжди зберігаємо у верхньому регістрі
                description: description || null,
                isOnline: false,
            }
        });
    } catch (error: unknown) {
        // Перевіряємо чи це помилка унікальності Prisma (P2002)
        if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
            return {
                message: "This device is already registered",
                errors: { macAddress: ["MAC Address already exists in the system"] }
            };
        }
        return { message: "Database error: Failed to create device" };
    }

    // Робимо редірект поза блоком try-catch, бо Next.js використовує помилки для редіректу під капотом
    revalidatePath('/dashboard/devices');
    redirect('/dashboard/devices');
}